import React from 'react';
import { X, ExternalLink, CheckCircle, Clock, FileText } from 'lucide-react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { getCategoryColor } from '../../utils/calendarUtils';

interface FullCalendarSchedulePopoverProps {
  item: CalendarScheduleItem;
  category?: CategoryItem;
  subItem?: SubItem;
  onClose: () => void;
  onToggleComplete: () => void;
  onJumpToSource: () => void;
}

export const FullCalendarSchedulePopover: React.FC<FullCalendarSchedulePopoverProps> = ({
  item,
  category,
  subItem,
  onClose,
  onToggleComplete,
  onJumpToSource,
}) => {
  const color = getCategoryColor(item.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-2xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 상단 헤더 */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full ${color.dot} shrink-0`} />
            <span className="text-xs font-bold text-slate-700 truncate">
              {category?.name || '미분류 카테고리'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 정보 */}
        <div className="p-4 space-y-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">
              {item.sourceType === 'checklist' ? '체크리스트 할 일' : '텍스트 블록 메모'}
            </span>
            <h3
              className={`text-sm font-bold text-slate-900 leading-snug break-words ${
                item.isCompleted ? 'line-through text-slate-400' : ''
              }`}
            >
              {item.title}
            </h3>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {item.dueDate} {item.dueTime ? `(${item.dueTime})` : '(종일)'}
              </span>
            </div>
            {subItem && (
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">문서: {subItem.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {item.sourceType === 'checklist' ? (
            <button
              type="button"
              onClick={onToggleComplete}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                item.isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{item.isCompleted ? '완료 취소' : '완료 체크'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onJumpToSource}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>해당 문서로 이동</span>
          </button>
        </div>
      </div>
    </div>
  );
};
