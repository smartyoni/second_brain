import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { SubItem } from '../../types';

interface GanttChartHeaderProps {
  currentSubItem?: SubItem;
  startDateStr: string;
  endDateStr: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const GanttChartHeader: React.FC<GanttChartHeaderProps> = ({
  currentSubItem,
  startDateStr,
  endDateStr,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex items-center justify-center w-6 h-6 rounded bg-indigo-600 text-white shadow-2xs shrink-0">
          <Calendar className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-800 truncate">
              {currentSubItem ? currentSubItem.title : '중분류 미선택'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-semibold shrink-0">
              간트 타임라인
            </span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {startDateStr} ~ {endDateStr}
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToday}
          className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-2xs transition-colors cursor-pointer"
        >
          오늘
        </button>
        <button
          type="button"
          onClick={onPrev}
          title="7일 전으로 이동"
          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 hover:border-slate-300 rounded shadow-2xs transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          title="7일 후로 이동"
          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 hover:border-slate-300 rounded shadow-2xs transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
