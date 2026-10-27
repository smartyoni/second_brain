import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDragSort } from '../../hooks/useDragSort';
import { TopCategory } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';

export const TopCategoryGrid: React.FC = () => {
  const {
    topCategories,
    setTopCategories,
    getCurrentActiveState,
    selectTopCategory,
    updateTopCategoryName,
  } = useWorkspace();

  const currentTopId = getCurrentActiveState().topCategoryId;
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragSort(topCategories, (newItems: TopCategory[]) => {
    // 1*1 퀵메모(top-1)는 항상 index 0 자리에 고정
    const top1 = topCategories.find((t) => t.id === 'top-1') || { id: 'top-1', name: '퀵메모', index: 0 };
    const others = newItems.filter((t) => t.id !== 'top-1');
    const reindexed = [{ ...top1, name: '퀵메모', index: 0 }, ...others.map((item, idx) => ({ ...item, index: idx + 1 }))];
    setTopCategories(reindexed);
  });

  return (
    <div className="w-full p-0 border-b border-slate-400 bg-white shrink-0 select-none">
      {/* gap과 외부 padding을 모두 0으로 제거하고 균일한 5열 그리드로 확장 */}
      <div className="grid grid-cols-5 gap-0 text-[11px] w-full">
        {topCategories.slice(0, 15).map((cat, index) => {
          const isQuickMemo = cat.id === 'top-1' || index === 0;
          const isSelected = cat.id === currentTopId;
          const isDragged = cat.id === draggedId;
          const isEditing = editingId === cat.id;

          // 행별 배경 톤 구분 (채도와 명암비를 높여 훨씬 선명하게 구분)
          const rowClass = isQuickMemo
            ? 'bg-blue-100 hover:bg-blue-200/90 text-blue-950 font-bold'
            : index < 5
            ? 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 font-semibold'
            : index < 10
            ? 'bg-emerald-100 hover:bg-emerald-200/90 text-emerald-950 font-semibold'
            : 'bg-purple-100 hover:bg-purple-200/90 text-purple-950 font-semibold';

          // 오른쪽 끝 열(4, 9, 14)은 border-r 제외, 마지막 행(10~14)은 border-b 제외
          const isRightEdge = (index + 1) % 5 === 0;
          const isBottomEdge = index >= 10;

          return (
            <div
              key={cat.id}
              draggable={!isEditing && !isQuickMemo}
              onDragStart={(e) => {
                if (isQuickMemo) return;
                handleDragStart(cat.id, e);
              }}
              onDragOver={(e) => {
                if (isQuickMemo) return;
                handleDragOver(e);
              }}
              onDrop={(e) => {
                if (isQuickMemo) return;
                handleDrop(cat.id, e);
              }}
              onDragEnd={handleDragEnd}
              onClick={() => selectTopCategory(cat.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (isQuickMemo) return; // 퀵메모는 이름 수정 불가 (하드코딩 고정)
                setEditingId(cat.id);
              }}
              className={`h-8 px-0.5 flex items-center justify-center text-center font-medium cursor-pointer transition-colors truncate ${rowClass} ${
                !isRightEdge ? 'border-r border-slate-300' : ''
              } ${!isBottomEdge ? 'border-b border-slate-300' : ''} ${
                isSelected
                  ? 'bg-white text-blue-700 font-bold ring-2 ring-blue-600 ring-inset z-10 shadow-xs'
                  : ''
              } ${isDragged ? 'opacity-40 bg-slate-200' : ''}`}
            >
              {isQuickMemo ? (
                <span className="truncate text-[11px] px-1 font-bold">퀵메모</span>
              ) : (
                <InlineEditableText
                  value={cat.name}
                  isEditing={isEditing}
                  onSave={(newName) => {
                    updateTopCategoryName(cat.id, newName);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                  className="truncate text-[11px] px-1"
                  inputClassName="text-[11px] h-6 py-0 px-1 text-center"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
