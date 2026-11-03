import React, { useState } from 'react';
import { ListChecks, Plus, CheckSquare, Square, Trash2 } from 'lucide-react';
import { CalendarScheduleItem, SubCheckItem } from '../../types';
import { SmartText } from '../shared/SmartText';

interface GoogleCalendarSubChecklistProps {
  item: CalendarScheduleItem;
  checklist: SubCheckItem[];
  onUpdateChecklist: (updater: (prev: SubCheckItem[]) => SubCheckItem[]) => void;
}

export const GoogleCalendarSubChecklist: React.FC<GoogleCalendarSubChecklistProps> = ({
  checklist,
  onUpdateChecklist,
}) => {
  const [newText, setNewText] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    const newId = `subcheck-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    onUpdateChecklist((prev) => {
      const newItem: SubCheckItem = {
        id: newId,
        text: trimmed,
        isCompleted: false,
        order: prev.length,
      };
      // 미완료 항목들 끝, 완료된 항목들 위에 추가
      const incomplete = prev.filter((i) => !i.isCompleted);
      const completed = prev.filter((i) => i.isCompleted);
      return [...incomplete, newItem, ...completed].map((it, idx) => ({ ...it, order: idx }));
    });
    setNewText('');
  };

  const handleToggle = (id: string) => {
    onUpdateChecklist((prev) => {
      const updated = prev.map((it) =>
        it.id === id ? { ...it, isCompleted: !it.isCompleted } : it
      );
      // 완료된 항목은 하단으로 자동 정렬
      const incomplete = updated.filter((i) => !i.isCompleted);
      const completed = updated.filter((i) => i.isCompleted);
      return [...incomplete, ...completed].map((it, idx) => ({ ...it, order: idx }));
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateChecklist((prev) => prev.filter((it) => it.id !== id).map((it, idx) => ({ ...it, order: idx })));
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. 빠른 입력 바 */}
      <form onSubmit={handleAdd} className="p-3 border-b border-[#dadce0] bg-[#fafafa] flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="새 하위할일 입력 후 Enter..."
          className="flex-1 h-8 px-2.5 text-xs text-[#3c4043] bg-white border border-[#dadce0] rounded-md outline-none focus:border-[#1a73e8] placeholder-[#70757a]"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="h-8 px-3 rounded-md text-xs font-medium bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>추가</span>
        </button>
      </form>

      {/* 2. 체크리스트 목록 영역 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[210px] max-h-[420px] md:max-h-[480px]">
        {checklist.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center text-[#70757a]">
            <ListChecks className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-xs">등록된 하위할일이 없습니다.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">상단 입력창에서 할 일을 추가해 보세요.</p>
          </div>
        ) : (
          checklist.map((sub) => (
            <div
              key={sub.id}
              onClick={() => handleToggle(sub.id)}
              className={`group flex items-start gap-2 p-2 rounded-md transition-colors cursor-pointer border ${
                sub.isCompleted
                  ? 'bg-slate-50/80 border-transparent text-[#70757a]'
                  : 'hover:bg-blue-50/40 border-slate-100 hover:border-blue-100 text-[#3c4043]'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(sub.id);
                }}
                className="mt-0.5 shrink-0 text-[#1a73e8] cursor-pointer"
              >
                {sub.isCompleted ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 group-hover:text-[#1a73e8]" />
                )}
              </button>

              <div
                className={`flex-1 text-xs leading-relaxed break-words min-w-0 ${
                  sub.isCompleted ? 'line-through text-slate-400' : 'font-normal'
                }`}
              >
                <SmartText text={sub.text} />
              </div>

              <button
                type="button"
                onClick={(e) => handleDelete(sub.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer shrink-0"
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
