import React from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { FullCalendarViewType } from '../../hooks/useFullCalendar';
import { SubItem } from '../../types';

interface CalendarPanelHeaderProps {
  currentSubItem?: SubItem;
  eventsCount: number;
  viewType: FullCalendarViewType;
  onViewTypeChange: (type: FullCalendarViewType) => void;
  headerTitle: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarPanelHeader: React.FC<CalendarPanelHeaderProps> = ({
  currentSubItem,
  eventsCount,
  viewType,
  onViewTypeChange,
  headerTitle,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div className="shrink-0 select-none">
      {/* 1. 상단: 3번 패널 항목 연동 인디케이터 바 */}
      <div className="h-7 px-3 bg-blue-50/80 border-b border-blue-200 flex items-center justify-between text-[11px] text-blue-900">
        <div className="flex items-center gap-1.5 truncate">
          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold truncate">
            {currentSubItem ? currentSubItem.title : '전체 문서'}
          </span>
          <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded-full font-medium">
            항목 캘린더
          </span>
        </div>
        <span className="text-[10px] text-blue-700 font-semibold shrink-0">
          일정 {eventsCount}건
        </span>
      </div>

      {/* 2. 구글 캘린더 스타일 4번 패널 상단 헤더 */}
      <div className="h-11 px-3 bg-white border-b border-[#dadce0] flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={onToday}
            className="px-2 py-0.5 border border-[#dadce0] rounded text-[11px] font-medium text-[#3c4043] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
          >
            오늘
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={onPrev}
              className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] cursor-pointer"
              title="이전"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] cursor-pointer"
              title="다음"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-semibold text-[#3c4043] truncate ml-0.5">
            {headerTitle}
          </span>
        </div>

        {/* [ 월 | 주 | 3일 | 일 ] 구글 세그먼트 탭 */}
        <div className="flex items-center bg-[#f1f3f4] border border-[#dadce0] p-0.5 rounded text-[11px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => onViewTypeChange('month')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewType === 'month'
                ? 'bg-white text-[#1a73e8] font-bold shadow-2xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            월
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('week')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewType === 'week'
                ? 'bg-white text-[#1a73e8] font-bold shadow-2xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            주
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('threeDay')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewType === 'threeDay'
                ? 'bg-white text-[#1a73e8] font-bold shadow-2xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            3일
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('day')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewType === 'day'
                ? 'bg-white text-[#1a73e8] font-bold shadow-2xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            일
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange('schedule')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              viewType === 'schedule'
                ? 'bg-white text-[#1a73e8] font-bold shadow-2xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            일정
          </button>
        </div>
      </div>
    </div>
  );
};
