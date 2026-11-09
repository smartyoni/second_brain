import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDragSort } from '../../hooks/useDragSort';
import { SubItem } from '../../types';
import { SubItemHeader } from '../subitem/SubItemHeader';
import { SubItemRow } from '../subitem/SubItemRow';
import { moveScopedItem } from '../../utils/orderUtils';

export const SubItemPanel: React.FC = () => {
  const {
    categoryGroups,
    categoryItems,
    subItems,
    setSubItems,
    getCurrentActiveState,
    selectSubItem,
    addSubItem,
  } = useWorkspace();

  const currentTopId = getCurrentActiveState().topCategoryId;
  const isQuickMemoTab = currentTopId === 'top-1';
  const selectedCategoryId = getCurrentActiveState().categoryId;
  const selectedSubItemId = getCurrentActiveState().subItemId;

  const currentCategory = categoryItems.find((c) => c.id === selectedCategoryId);
  const currentSubItems = subItems.filter((s) => s.categoryId === selectedCategoryId);
  const completedCount = isQuickMemoTab
    ? currentSubItems.filter((s) => s.isCompleted).length
    : undefined;

  const handleToggleComplete = (subItemId: string) => {
    setSubItems((prev) => {
      const target = prev.find((s) => s.id === subItemId);
      if (!target) return prev;

      const nextCompleted = !target.isCompleted;

      // 퀵메모 탭에서는 완료 시 하단으로 자동 이동
      if (isQuickMemoTab) {
        const currentCatItems = prev.filter((s) => s.categoryId === selectedCategoryId);
        const otherCatItems = prev.filter((s) => s.categoryId !== selectedCategoryId);
        const withoutTarget = currentCatItems.filter((s) => s.id !== subItemId);

        let reorderedCatItems: SubItem[];
        if (nextCompleted) {
          // 완료되면 목록의 맨 끝(하단)으로 이동
          reorderedCatItems = [...withoutTarget, { ...target, isCompleted: true }];
        } else {
          // 미완료로 해제되면 미완료 목록의 끝(완료된 항목들 바로 위)으로 복귀
          const uncompleted = withoutTarget.filter((s) => !s.isCompleted);
          const completed = withoutTarget.filter((s) => s.isCompleted);
          reorderedCatItems = [...uncompleted, { ...target, isCompleted: false }, ...completed];
        }

        return [...otherCatItems, ...reorderedCatItems];
      }

      return prev.map((s) => (s.id === subItemId ? { ...s, isCompleted: nextCompleted } : s));
    });
  };

  // 현재 대분류에 속한 다른 카테고리 목록 (그룹명과 함께 표시)
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

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <SubItemHeader
        categoryTitle={currentCategory?.name || '카테고리'}
        totalCount={currentSubItems.length}
        completedCount={completedCount}
        onAddSubItem={handleAdd}
      />

      <div className="flex-1 overflow-y-auto">
        {currentSubItems.map((item, idx) => (
          <SubItemRow
            key={item.id}
            item={item}
            isSelected={item.id === selectedSubItemId}
            isDragged={item.id === draggedId}
            canMoveUp={idx > 0}
            canMoveDown={idx < currentSubItems.length - 1}
            showCheckbox={isQuickMemoTab}
            onToggleComplete={handleToggleComplete}
            categoryTargets={categoryTargets}
            onMoveToCategory={(targetCatId) => handleMoveToCategory(item.id, targetCatId)}
            onMove={(dir) =>
              setSubItems((prev) =>
                moveScopedItem(prev, (s) => s.categoryId === selectedCategoryId, item.id, dir)
              )
            }
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
        ))}

        {currentSubItems.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400">
            {selectedCategoryId ? '등록된 항목이 없습니다.' : '카테고리를 선택하세요.'}
          </div>
        )}
      </div>
    </div>
  );
};
