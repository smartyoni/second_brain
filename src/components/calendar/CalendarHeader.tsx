import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarViewMode } from '../../types';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  title: string;
  totalEventsCount: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  title,
  totalEventsCount,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div className="h-10 px-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between select-none shrink-0 gap-2">
      {/* 좌측: 타이틀 및 이전/다음 이동 네비게이션 */}
      <div className="flex items-center gap-1.5 min-w-0">
        <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
          {title}
        </span>

        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            title="이전"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            title="다음"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 우측: [ 일간 | 3일 | 월간 ] 세그먼트 탭 + 오늘 버튼 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-slate-600 font-semibold hidden sm:inline mr-1">
          일정 <strong className="text-blue-700 font-bold">{totalEventsCount}</strong>
        </span>
        <div className="flex items-center bg-slate-200 border border-slate-300 p-0.5 rounded text-[11px] font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange('day')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            일간
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('threeDay')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewMode === 'threeDay'
                ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            3일
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            월간
          </button>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-800 rounded shadow-2xs transition-colors cursor-pointer"
        >
          오늘
        </button>
      </div>
    </div>
  );
};
