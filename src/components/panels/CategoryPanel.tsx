import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDragSort } from '../../hooks/useDragSort';
import { AccountBar } from '../category/AccountBar';
import { TopCategoryGrid } from '../category/TopCategoryGrid';
import { CategoryToolbar } from '../category/CategoryToolbar';
import { CategoryGroupList } from '../category/CategoryGroupList';
import { QuickMemoBar } from '../category/QuickMemoBar';
import { QuickMemoModal } from '../category/QuickMemoModal';
import { QuickMemoMonthList } from '../category/QuickMemoMonthList';
import { GoogleMiniCalendar } from '../googlecalendar/GoogleMiniCalendar';
import { QuickMemoSegment } from '../../types';
import { moveScopedItem } from '../../utils/orderUtils';
import { parseLocalDate } from '../../utils/calendarUtils';
import {
  FIXED_TODO_GROUP_IDS,
  FIXED_TODO_CATEGORY_IDS,
  FIXED_PROJECT_GROUP_IDS,
} from '../../context/initialData';

interface CategoryPanelProps {
  showMiniCalendar?: boolean;
}

export const CategoryPanel: React.FC<CategoryPanelProps> = ({ showMiniCalendar }) => {
  const {
    appMode,
    categoryGroups,
    setCategoryGroups,
    categoryItems,
    setCategoryItems,
    setSubItems,
    getCurrentActiveState,
    selectCategory,
    addCategoryItem,
    quickMemos,
    addQuickMemo,
    selectTopCategory,
    selectedCalendarDate,
    setSelectedCalendarDate,
  } = useWorkspace();

  const [activeSegment, setActiveSegment] = useState<QuickMemoSegment>('memo');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentTopId = getCurrentActiveState().topCategoryId;
  const isQuickMemoTab = currentTopId === 'top-1';
  const selectedCategoryId = getCurrentActiveState().categoryId;

  // 캘린더 모드이거나 props로 명시된 경우 미니달력 표시
  const isMiniCalendarVisible = showMiniCalendar ?? (appMode === 'calendar');

  const currentDateObj = useMemo(() => {
    return parseLocalDate(selectedCalendarDate);
  }, [selectedCalendarDate]);

  // 현재 선택된 대분류에 속한 그룹 및 카테고리 필터링
  const currentGroups = categoryGroups.filter((g) => g.topCategoryId === currentTopId);
  const currentItems = categoryItems.filter((c) => c.topCategoryId === currentTopId);

  // 카테고리 드래그 훅
  const {
    draggedId: draggedCategoryId,
    handleDragStart: onCategoryDragStart,
    handleDragOver: onCategoryDragOver,
    handleDrop: onCategoryDrop,
    handleDragEnd: onCategoryDragEnd,
  } = useDragSort(currentItems, (reordered) => {
    setCategoryItems((prev) => {
      const others = prev.filter((c) => c.topCategoryId !== currentTopId);
      return [...others, ...reordered];
    });
  });

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const handleExpandAll = () => {
    setCategoryGroups((prev) => prev.map((g) => ({ ...g, isExpanded: true })));
  };

  const handleCollapseAll = () => {
    setCategoryGroups((prev) => prev.map((g) => ({ ...g, isExpanded: false })));
  };

  const handleAddGroup = () => {
    if (!currentTopId) return;
    const newId = `grp-${Date.now()}`;
    const newGroup = {
      id: newId,
      topCategoryId: currentTopId,
      name: '',
      isExpanded: true,
      order: categoryGroups.length,
    };
    setCategoryGroups((prev) => [...prev, newGroup]);
    setEditingGroupId(newId);
  };

  const handleAddCategory = () => {
    if (!currentTopId) return;
    const newId = addCategoryItem(currentTopId);
    if (newId) {
      setEditingCategoryId(newId);
    }
  };

  const groupTargets = currentGroups.map((g) => ({ id: g.id, name: g.name }));
  const handleMoveCategoryToGroup = (catId: string, groupId: string) =>
    setCategoryItems((prev) => {
      const target = prev.find((c) => c.id === catId);
      if (!target) return prev;
      return [...prev.filter((c) => c.id !== catId), { ...target, groupId }];
    });

  const handleDropSubItem = (subItemId: string, targetCategoryId: string) =>
    setSubItems((prev) =>
      prev.map((s) => (s.id === subItemId ? { ...s, categoryId: targetCategoryId } : s))
    );

  const unclassifiedItems = currentItems.filter((c) => !c.groupId);

  return (
    <div className="flex flex-col h-full bg-white select-none relative">
      <AccountBar />

      {/* 어떤 탭을 선택해도 상시 나타나는 퀵메모 바 (기능탭 상단 배치) */}
      <QuickMemoBar
        activeSegment={activeSegment}
        isQuickMemoTab={isQuickMemoTab}
        onSelectSegment={(segment) => {
          setActiveSegment(segment);
          if (segment === 'move' && !isQuickMemoTab) {
            selectTopCategory('top-1');
          }
        }}
        onOpenModal={() => setIsModalOpen(true)}
        memoCount={quickMemos.length}
      />

      {/* 데스크탑(lg 이상): 1번 패널 상단 배치 유지 */}
      <div className="hidden lg:block shrink-0">
        <TopCategoryGrid />
      </div>

      {isQuickMemoTab ? (
        <QuickMemoMonthList
          selectedCategoryId={selectedCategoryId}
          onSelectMonth={selectCategory}
        />
      ) : (
        <>
          <CategoryToolbar
            totalCount={currentItems.length}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            onAddGroup={handleAddGroup}
            onAddCategory={handleAddCategory}
          />

          <CategoryGroupList
            currentTopId={currentTopId}
            currentGroups={currentGroups}
            currentItems={currentItems}
            unclassifiedItems={unclassifiedItems}
            selectedCategoryId={selectedCategoryId}
            draggedCategoryId={draggedCategoryId}
            groupTargets={groupTargets}
            onMoveGroup={(id, dir) =>
              setCategoryGroups((prev) =>
                moveScopedItem(prev, (g) => g.topCategoryId === currentTopId, id, dir)
              )
            }
            onMoveCategory={(catId, dir, gId) =>
              setCategoryItems((prev) =>
                moveScopedItem(
                  prev,
                  (c) => c.topCategoryId === currentTopId && (gId ? c.groupId === gId : !c.groupId),
                  catId,
                  dir
                )
              )
            }
            onMoveCategoryToGroup={handleMoveCategoryToGroup}
            onDropSubItem={handleDropSubItem}
            onToggleExpand={(id) =>
              setCategoryGroups((prev) =>
                prev.map((g) => (g.id === id ? { ...g, isExpanded: !g.isExpanded } : g))
              )
            }
            onUpdateGroupName={(id, name) =>
              setCategoryGroups((prev) =>
                prev.map((g) => (g.id === id ? { ...g, name } : g))
              )
            }
            onDeleteGroup={(id) => {
              if (FIXED_TODO_GROUP_IDS.has(id) || FIXED_PROJECT_GROUP_IDS.has(id)) return;
              setCategoryGroups((prev) => prev.filter((g) => g.id !== id));
              setCategoryItems((prev) =>
                prev.map((c) => (c.groupId === id ? { ...c, groupId: undefined } : c))
              );
            }}
            onAddCategoryToGroup={(id) => {
              if (currentTopId) {
                const newCatId = addCategoryItem(currentTopId, id || undefined);
                if (newCatId) {
                  setEditingCategoryId(newCatId);
                }
              }
            }}
            onSelectCategory={selectCategory}
            onUpdateCategoryName={(id, name) =>
              setCategoryItems((prev) =>
                prev.map((c) => (c.id === id ? { ...c, name } : c))
              )
            }
            onDeleteCategory={(id) => {
              if (FIXED_TODO_CATEGORY_IDS.has(id)) return;
              setCategoryItems((prev) => prev.filter((c) => c.id !== id));
            }}
            onCategoryDragStart={onCategoryDragStart}
            onCategoryDragOver={onCategoryDragOver}
            onCategoryDrop={onCategoryDrop}
            onCategoryDragEnd={onCategoryDragEnd}
            editingGroupId={editingGroupId}
            onStartEditGroup={(id) => setEditingGroupId(id)}
            onEndEditGroup={() => setEditingGroupId(null)}
            editingCategoryId={editingCategoryId}
            onStartEditCategory={(id) => setEditingCategoryId(id)}
            onEndEditCategory={() => setEditingCategoryId(null)}
          />
        </>
      )}

      {/* 1번 패널 가장 하단 구글 미니달력 (캘린더 모드 등 활성화 시) */}
      {isMiniCalendarVisible && (
        <div className="shrink-0 border-t border-slate-200 bg-white py-2 px-1">
          <GoogleMiniCalendar
            currentDateObj={currentDateObj}
            selectedDate={selectedCalendarDate}
            onSelectDate={setSelectedCalendarDate}
          />
        </div>
      )}

      {/* 모바일(lg 미만): 하단 네비게이터바 바로 위로 5*3열 기능탭 배치 */}
      <div className="block lg:hidden shrink-0 border-t border-slate-300 bg-white z-10">
        <TopCategoryGrid />
      </div>

      {/* 퀵메모 작성 모달 */}
      <QuickMemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addQuickMemo}
      />
    </div>
  );
};
