import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDragSort } from '../../hooks/useDragSort';
import { SubItem } from '../../types';
import { SubItemHeader } from '../subitem/SubItemHeader';
import { SubItemRow } from '../subitem/SubItemRow';
import { moveScopedItem } from '../../utils/orderUtils';

export const SubItemPanel: React.FC = () => {
  const {
    categoryItems,
    subItems,
    setSubItems,
    getCurrentActiveState,
    selectSubItem,
    addSubItem,
  } = useWorkspace();

  const selectedCategoryId = getCurrentActiveState().categoryId;
  const selectedSubItemId = getCurrentActiveState().subItemId;

  const currentCategory = categoryItems.find((c) => c.id === selectedCategoryId);
  const currentSubItems = subItems.filter((s) => s.categoryId === selectedCategoryId);

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
