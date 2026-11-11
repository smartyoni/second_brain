import React, { useState, useMemo } from 'react';
import { ListChecks, Plus, CheckSquare } from 'lucide-react';
import { CalendarScheduleItem, SubCheckItem } from '../../types';
import { useDragSort } from '../../hooks/useDragSort';
import { DetailSubCheckItemRow } from '../memo/DetailSubCheckItemRow';
import { moveChecklistItem, getChecklistMoveBounds } from '../../utils/orderUtils';

interface GoogleCalendarSubChecklistProps {
  item: CalendarScheduleItem;
  checklist: SubCheckItem[];
  onUpdateChecklist: (updater: (prev: SubCheckItem[]) => SubCheckItem[]) => void;
}

export const GoogleCalendarSubChecklist: React.FC<GoogleCalendarSubChecklistProps> = ({
  checklist,
  onUpdateChecklist,
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // 미완료 상단, 완료 하단 정렬된 체크리스트 아이템
  const checklistItems = useMemo(() => {
    return [...checklist].sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [checklist]);

  const completedCount = checklistItems.filter((i) => i.isCompleted).length;
  const totalCount = checklistItems.length;

  const validLines = newItemText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const hasMultipleLines = validLines.length > 1;

  // 체크리스트 항목 추가 (미완료 목록 하단, 완료된 항목들 상단에 배치)
  const handleAddChecklistItem = (customText?: string) => {
    const trimmed = customText !== undefined ? customText.trim() : newItemText.trim();
    const isDirectButtonAdd = customText === undefined && !trimmed;
    const textToUse = trimmed || '새 체크 항목';
    const newId = `subcheck-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    onUpdateChecklist((prev) => {
      const newItem: SubCheckItem = {
        id: newId,
        text: textToUse,
        isCompleted: false,
        order: 0,
      };
      const incomplete = prev.filter((i) => !i.isCompleted);
      const completed = prev.filter((i) => i.isCompleted);
      return [...incomplete, newItem, ...completed].map((it, idx) => ({ ...it, order: idx }));
    });

    if (isDirectButtonAdd) {
      setEditingItemId(newId);
    } else {
      setNewItemText('');
    }
  };

  // 줄바꿈된 여러 줄을 개별 체크리스트 항목으로 일괄 추가
  const handleAddMultipleItems = (multiLineText?: string) => {
    const raw = multiLineText !== undefined ? multiLineText : newItemText;
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return;

    onUpdateChecklist((prev) => {
      const newItems: SubCheckItem[] = lines.map((line, idx) => ({
        id: `subcheck-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        text: line,
        isCompleted: false,
        order: 0,
      }));
      const incomplete = prev.filter((i) => !i.isCompleted);
      const completed = prev.filter((i) => i.isCompleted);
      return [...incomplete, ...newItems, ...completed].map((it, idx) => ({ ...it, order: idx }));
    });

    setNewItemText('');
  };

  // 완료 토글 (완료된 항목은 하단으로 이동)
  const handleToggleComplete = (subId: string) => {
    onUpdateChecklist((prev) => {
      const toggled = prev.map((it) =>
        it.id === subId ? { ...it, isCompleted: !it.isCompleted } : it
      );
      const incomplete = toggled.filter((i) => !i.isCompleted);
      const completed = toggled.filter((i) => i.isCompleted);
      return [
        ...incomplete,
        ...completed.filter((i) => i.id !== subId),
        ...completed.filter((i) => i.id === subId),
      ].map((it, idx) => ({ ...it, order: idx }));
    });
  };

  // 내용 수정
  const handleUpdateText = (subId: string, newText: string) => {
    const cleaned = newText.trim();
    if (!cleaned) return;
    onUpdateChecklist((prev) =>
      prev.map((it) => (it.id === subId ? { ...it, text: cleaned } : it))
    );
  };

  // 삭제
  const handleDeleteItem = (subId: string) => {
    onUpdateChecklist((prev) =>
      prev.filter((it) => it.id !== subId).map((it, idx) => ({ ...it, order: idx }))
    );
  };

  // 순서 재정렬
  const handleReorderItems = (reordered: SubCheckItem[]) => {
    onUpdateChecklist(() => {
      const incomplete = reordered.filter((i) => !i.isCompleted);
      const completed = reordered.filter((i) => i.isCompleted);
      return [...incomplete, ...completed].map((it, idx) => ({ ...it, order: idx }));
    });
  };

  const {
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragSort(checklistItems, handleReorderItems);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* 상단 헤더 바 */}
      <div className="h-9 flex items-center justify-between px-3 bg-pink-100 border-b border-pink-300 shrink-0 gap-2 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-pink-600 text-white shadow-2xs shrink-0">
            <ListChecks className="w-3 h-3" />
          </span>
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-bold text-pink-950 truncate">
              하위할일
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

      {/* 빠른 입력 바 (멀티라인/줄바꿈 입력 지원) */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 shrink-0 flex flex-col gap-1.5">
        <div className="flex items-start gap-1.5">
          <textarea
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (newItemText.trim()) {
                  handleAddChecklistItem(newItemText);
                }
              }
            }}
            rows={2}
            placeholder="새 하위할일 입력 (Enter 줄바꿈, Ctrl+Enter 추가)..."
            className="flex-1 min-h-[50px] max-h-[140px] px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-md outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-100 placeholder:text-slate-400 resize-y leading-relaxed font-sans"
          />
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              disabled={!newItemText.trim()}
              onClick={() => handleAddChecklistItem(newItemText)}
              className="h-7 px-2.5 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              title="Ctrl+Enter로 추가"
            >
              추가
            </button>
            {hasMultipleLines && (
              <button
                type="button"
                onClick={() => handleAddMultipleItems(newItemText)}
                className="h-7 px-2 rounded-md text-[10px] font-semibold bg-pink-600 hover:bg-pink-700 text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="줄마다 개별 체크 항목으로 일괄 추가"
              >
                줄별 추가
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
          <span>Enter 줄바꿈 · Ctrl+Enter 추가</span>
          {hasMultipleLines && (
            <span className="text-pink-600 font-semibold">
              {validLines.length}줄 입력됨 ([줄별 추가]로 각각 등록 가능)
            </span>
          )}
        </div>
      </div>

      {/* 체크리스트 목록 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {checklistItems.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {checklistItems.map((cItem) => {
              const { canMoveUp, canMoveDown } = getChecklistMoveBounds(
                checklistItems,
                cItem.id
              );
              return (
                <DetailSubCheckItemRow
                  key={cItem.id}
                  item={cItem}
                  isDragging={draggedId === cItem.id}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMove={(id, dir) =>
                    handleReorderItems(moveChecklistItem(checklistItems, id, dir))
                  }
                  forceEdit={editingItemId === cItem.id}
                  onClearForceEdit={() => {
                    if (editingItemId === cItem.id) setEditingItemId(null);
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
              등록된 하위할일이 없습니다.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              상단 입력창이나 [+ 항목 추가] 버튼으로 할 일을 추가하세요.
            </p>
          </div>
        )}
      </div>

      {/* 하단 정보 바 */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 select-none shrink-0">
        <span>{totalCount}개 중 {completedCount}개 완료</span>
        <span>더블클릭 인라인 편집 · 드래그 순서 변경</span>
      </div>
    </div>
  );
};
