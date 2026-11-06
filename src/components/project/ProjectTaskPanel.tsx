import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDragSort } from '../../hooks/useDragSort';
import { SubItem } from '../../types';
import { ProjectTaskHeader } from './ProjectTaskHeader';
import { ProjectTaskRow } from './ProjectTaskRow';
import { moveScopedItem } from '../../utils/orderUtils';
import { getTodayDateStr } from '../../utils/calendarUtils';

export const ProjectTaskPanel: React.FC = () => {
  const {
    categoryGroups,
    categoryItems,
    subItems,
    setSubItems,
    checklistGroups,
    getAllScheduleItems,
    getCurrentActiveState,
    selectSubItem,
    addSubItem,
  } = useWorkspace();

  const currentTopId = getCurrentActiveState().topCategoryId;
  const selectedCategoryId = getCurrentActiveState().categoryId;
  const selectedSubItemId = getCurrentActiveState().subItemId;

  const currentCategory = categoryItems.find((c) => c.id === selectedCategoryId);
  const currentSubItems = subItems.filter((s) => s.categoryId === selectedCategoryId);

  // 현재 대분류에 속한 다른 프로젝트(카테고리) 목록
  const categoryTargets = categoryItems
    .filter((c) => c.topCategoryId === currentTopId && c.id !== selectedCategoryId)
    .map((c) => {
      const grp = categoryGroups.find((g) => g.id === c.groupId);
      return {
        id: c.id,
        name: grp ? `[${grp.name}] ${c.name}` : c.name,
      };
    });

  const handleMoveToCategory = (subItemId: string, targetCategoryId: string) => {
    setSubItems((prev) =>
      prev.map((s) => (s.id === subItemId ? { ...s, categoryId: targetCategoryId } : s))
    );
  };

  const {
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragSort(currentSubItems, (reordered: SubItem[]) => {
    setSubItems((prev) => {
      const others = prev.filter((s) => s.categoryId !== selectedCategoryId);
      return [...others, ...reordered];
    });
  });

  const handleAdd = () => {
    if (selectedCategoryId) {
      addSubItem(selectedCategoryId);
    }
  };

  // 각 업무별 통계(체크리스트 완료수 / 전체수)
  const taskStatsMap = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; percent: number }>();
    currentSubItems.forEach((item) => {
      const groups = checklistGroups.filter((g) => g.subItemId === item.id);
      let total = 0;
      let completed = 0;
      groups.forEach((g) => {
        total += g.items.length;
        completed += g.items.filter((i) => i.isCompleted).length;
      });
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      map.set(item.id, { total, completed, percent });
    });
    return map;
  }, [currentSubItems, checklistGroups]);

  // 각 업무별 D-Day 텍스트
  const todayStr = getTodayDateStr();
  const dDayMap = useMemo(() => {
    const allSchedules = getAllScheduleItems();
    const map = new Map<string, string>();

    currentSubItems.forEach((item) => {
      const schedules = allSchedules.filter(
        (s) => s.subItemId === item.id && s.dueDate && !s.isCompleted
      );
      if (schedules.length === 0) return;

      const sorted = [...schedules].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      const targetDate = sorted[0].dueDate;

      if (targetDate === todayStr) {
        map.set(item.id, 'D-Day');
      } else {
        const diffDays = Math.ceil(
          (new Date(targetDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 0) {
          map.set(item.id, `D-${diffDays}`);
        } else {
          map.set(item.id, `D+${Math.abs(diffDays)}`);
        }
      }
    });

    return map;
  }, [currentSubItems, getAllScheduleItems, todayStr]);

  // 프로젝트 전체 통계
  const projectOverall = useMemo(() => {
    let total = 0;
    let completed = 0;
    taskStatsMap.forEach((stat) => {
      total += stat.total;
      completed += stat.completed;
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: currentSubItems.length,
      completedTasks: currentSubItems.filter((i) => {
        const s = taskStatsMap.get(i.id);
        return s && s.total > 0 && s.completed === s.total;
      }).length,
      overallPercent: percent,
    };
  }, [currentSubItems, taskStatsMap]);

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden select-none">
      <ProjectTaskHeader
        categoryTitle={currentCategory?.name || '프로젝트'}
        totalTasks={projectOverall.totalTasks}
        completedTasks={projectOverall.completedTasks}
        overallPercent={projectOverall.overallPercent}
        onAddTask={handleAdd}
      />

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {currentSubItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
            <p>등록된 마일스톤이나 업무가 없습니다.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="mt-2 text-indigo-600 font-semibold hover:underline"
            >
              + 첫 번째 업무 추가
            </button>
          </div>
        ) : (
          currentSubItems.map((item, index) => (
            <ProjectTaskRow
              key={item.id}
              item={item}
              isSelected={item.id === selectedSubItemId}
              isDragged={item.id === draggedId}
              taskStats={taskStatsMap.get(item.id) || { total: 0, completed: 0, percent: 0 }}
              dDayText={dDayMap.get(item.id)}
              canMoveUp={index > 0}
              canMoveDown={index < currentSubItems.length - 1}
              onMove={(dir) =>
                setSubItems((prev) =>
                  moveScopedItem(prev, (s) => s.categoryId === selectedCategoryId, item.id, dir)
                )
              }
              categoryTargets={categoryTargets}
              onMoveToCategory={(targetId) => handleMoveToCategory(item.id, targetId)}
              onSelect={() => selectSubItem(item.id)}
              onUpdateTitle={(id, title) =>
                setSubItems((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, title } : s))
                )
              }
              onDelete={(id) => setSubItems((prev) => prev.filter((s) => s.id !== id))}
              onDragStart={(e) => handleDragStart(item.id, e)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(item.id, e)}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
};
