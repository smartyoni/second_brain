import React from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { FullCalendarViewType } from '../../hooks/useFullCalendar';

interface FullCalendarHeaderProps {
  viewType: FullCalendarViewType;
  onViewTypeChange: (type: FullCalendarViewType) => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredCount: number;
}

export const FullCalendarHeader: React.FC<FullCalendarHeaderProps> = ({
  viewType,
  onViewTypeChange,
  title,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  onSearchChange,
  filteredCount,
}) => {
  return (
    <header className="h-14 px-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 select-none gap-4">
      {/* 1. 좌측: 네비게이션 및 타이틀 */}
      <div className="flex items-center gap-3 shrink-0">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight min-w-36">
          {title}
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors cursor-pointer"
          >
            오늘
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={onPrev}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              title="이전"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              title="다음"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 중앙: 일정 실시간 검색창 */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="일정 검색 (할 일, 메모, 마감일)..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. 우측: 뷰 전환 세그먼트 (월간 / 주간 / 일간) & 건수 */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-500 font-medium">
          조회 <strong className="text-blue-700 font-bold">{filteredCount}</strong>건
        </span>

        <div className="flex items-center bg-slate-100 border border-slate-300 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => onViewTypeChange('month')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              viewType === 'month'
                ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            월간
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('week')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              viewType === 'week'
                ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            주간
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('day')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              viewType === 'day'
                ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            일간
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('schedule')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              viewType === 'schedule'
                ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            일정
          </button>
        </div>
      </div>
    </header>
  );
};
