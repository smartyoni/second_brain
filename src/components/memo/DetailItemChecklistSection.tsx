import React from 'react';
import { ListChecks, Plus, Info, CheckSquare } from 'lucide-react';
import { useDetailItemChecklist } from '../../hooks/useDetailItemChecklist';
import { useDragSort } from '../../hooks/useDragSort';
import { DetailSubCheckItemRow } from './DetailSubCheckItemRow';
import { moveChecklistItem, getChecklistMoveBounds } from '../../utils/orderUtils';

export const DetailItemChecklistSection: React.FC = () => {
  const {
    targetItem,
    checklistItems,
    completedCount,
    totalCount,
    newItemText,
    setNewItemText,
    editingItemId,
    setEditingItemId,
    handleAddChecklistItem,
    handleToggleComplete,
    handleUpdateText,
    handleDeleteItem,
    handleReorderItems,
  } = useDetailItemChecklist();

  const {
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragSort(checklistItems, handleReorderItems);

  if (!targetItem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 text-slate-400 select-none text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <ListChecks className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-600 mb-1">
          선택된 항목이 없습니다.
        </p>
        <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
          3번 패널에서 항목을 클릭하면, 여기에 항목별 체크리스트를 추가하고 관리할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* 상단 헤더 바 (h-9 높이 + 핑크색 테마) */}
      <div className="h-9 flex items-center justify-between px-3 bg-pink-100 border-b border-pink-300 shrink-0 gap-2 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-pink-600 text-white shadow-2xs shrink-0">
            <ListChecks className="w-3 h-3" />
          </span>
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-bold text-pink-950 truncate">
              체크리스트
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-200/80 text-pink-900 font-semibold shrink-0">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleAddChecklistItem()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-white bg-pink-600 hover:bg-pink-700 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>항목 추가</span>
        </button>
      </div>

      {/* 빠른 입력 바 */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/40 shrink-0 flex items-center gap-1.5">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newItemText.trim()) {
              e.preventDefault();
              handleAddChecklistItem(newItemText);
            }
          }}
          placeholder="새 체크리스트 항목 입력 후 Enter..."
          className="flex-1 h-7 px-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
        />
        <button
          type="button"
          disabled={!newItemText.trim()}
          onClick={() => handleAddChecklistItem(newItemText)}
          className="h-7 px-2.5 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          추가
        </button>
      </div>

      {/* 체크리스트 목록 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {checklistItems.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {checklistItems.map((item) => {
              const { canMoveUp, canMoveDown } = getChecklistMoveBounds(
                checklistItems,
                item.id
              );
              return (
                <DetailSubCheckItemRow
                  key={item.id}
                  item={item}
                  isDragging={draggedId === item.id}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMove={(id, dir) =>
                    handleReorderItems(moveChecklistItem(checklistItems, id, dir))
                  }
                  forceEdit={editingItemId === item.id}
                  onClearForceEdit={() => {
                    if (editingItemId === item.id) setEditingItemId(null);
                  }}
                  onToggleComplete={handleToggleComplete}
                  onUpdateText={handleUpdateText}
                  onDelete={handleDeleteItem}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <CheckSquare className="w-6 h-6 text-slate-300 mb-1.5" />
            <p className="text-xs text-slate-500 font-medium">
              등록된 체크리스트가 없습니다.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              상단 입력창이나 [+ 항목 추가] 버튼으로 할 일을 추가하세요.
            </p>
          </div>
        )}
      </div>

      {/* 하단 정보 바 */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 select-none shrink-0">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          항목별 전속 체크리스트 (더블클릭 수정 · 드래그 정렬)
        </span>
        <span>
          완료 {completedCount} / 전체 {totalCount}
        </span>
      </div>
    </div>
  );
};
