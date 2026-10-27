import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDragSort } from '../../hooks/useDragSort';
import { AccountBar } from '../category/AccountBar';
import { TopCategoryGrid } from '../category/TopCategoryGrid';
import { CategoryToolbar } from '../category/CategoryToolbar';
import { CategoryGroupAccordion } from '../category/CategoryGroupAccordion';
import { QuickMemoBar } from '../category/QuickMemoBar';
import { QuickMemoModal } from '../category/QuickMemoModal';
import { QuickMemoMonthList } from '../category/QuickMemoMonthList';
import { QuickMemoSegment } from '../../types';

export const CategoryPanel: React.FC = () => {
  const {
    categoryGroups,
    setCategoryGroups,
    categoryItems,
    setCategoryItems,
    getCurrentActiveState,
    selectCategory,
    addCategoryItem,
    quickMemos,
    addQuickMemo,
    selectTopCategory,
  } = useWorkspace();

  const [activeSegment, setActiveSegment] = useState<QuickMemoSegment>('memo');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentTopId = getCurrentActiveState().topCategoryId;
  const isQuickMemoTab = currentTopId === 'top-1';
  const selectedCategoryId = getCurrentActiveState().categoryId;

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

  const handleExpandAll = () => {
    setCategoryGroups((prev) => prev.map((g) => ({ ...g, isExpanded: true })));
  };

  const handleCollapseAll = () => {
    setCategoryGroups((prev) => prev.map((g) => ({ ...g, isExpanded: false })));
  };

  const handleAddGroup = () => {
    if (!currentTopId) return;
    const newGroup = {
      id: `grp-${Date.now()}`,
      topCategoryId: currentTopId,
      name: '새 그룹',
      isExpanded: true,
      order: categoryGroups.length,
    };
    setCategoryGroups((prev) => [...prev, newGroup]);
  };

  const handleAddCategory = () => {
    if (!currentTopId) return;
    addCategoryItem(currentTopId);
  };

  const unclassifiedItems = currentItems.filter((c) => !c.groupId);

  return (
    <div className="flex flex-col h-full bg-white select-none relative">
      <AccountBar />
      <TopCategoryGrid />

      {/* 어떤 탭을 선택해도 상시 나타나는 퀵메모 바 */}
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

          <div className="flex-1 overflow-y-auto">
            {currentGroups.map((group) => {
              const groupItems = currentItems.filter((c) => c.groupId === group.id);
              return (
                <CategoryGroupAccordion
                  key={group.id}
                  group={group}
                  items={groupItems}
                  selectedCategoryId={selectedCategoryId}
                  draggedCategoryId={draggedCategoryId}
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
                    setCategoryGroups((prev) => prev.filter((g) => g.id !== id));
                    setCategoryItems((prev) =>
                      prev.map((c) => (c.groupId === id ? { ...c, groupId: undefined } : c))
                    );
                  }}
                  onAddCategoryToGroup={(id) => {
                    if (currentTopId) addCategoryItem(currentTopId, id);
                  }}
                  onSelectCategory={selectCategory}
                  onUpdateCategoryName={(id, name) =>
                    setCategoryItems((prev) =>
                      prev.map((c) => (c.id === id ? { ...c, name } : c))
                    )
                  }
                  onDeleteCategory={(id) =>
                    setCategoryItems((prev) => prev.filter((c) => c.id !== id))
                  }
                  onCategoryDragStart={onCategoryDragStart}
                  onCategoryDragOver={onCategoryDragOver}
                  onCategoryDrop={onCategoryDrop}
                  onCategoryDragEnd={onCategoryDragEnd}
                />
              );
            })}

            {unclassifiedItems.length > 0 && (
              <CategoryGroupAccordion
                group={{
                  id: 'grp-unclassified',
                  topCategoryId: currentTopId || '',
                  name: '미분류 카테고리',
                  isExpanded: true,
                  order: 9999,
                }}
                items={unclassifiedItems}
                selectedCategoryId={selectedCategoryId}
                draggedCategoryId={draggedCategoryId}
                onToggleExpand={() => {}}
                onUpdateGroupName={() => {}}
                onDeleteGroup={() => {}}
                onAddCategoryToGroup={() => currentTopId && addCategoryItem(currentTopId)}
                onSelectCategory={selectCategory}
                onUpdateCategoryName={(id, name) =>
                  setCategoryItems((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, name } : c))
                  )
                }
                onDeleteCategory={(id) =>
                  setCategoryItems((prev) => prev.filter((c) => c.id !== id))
                }
                onCategoryDragStart={onCategoryDragStart}
                onCategoryDragOver={onCategoryDragOver}
                onCategoryDrop={onCategoryDrop}
                onCategoryDragEnd={onCategoryDragEnd}
              />
            )}
          </div>
        </>
      )}

      {/* 퀵메모 작성 모달 */}
      <QuickMemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addQuickMemo}
      />
    </div>
  );
};
