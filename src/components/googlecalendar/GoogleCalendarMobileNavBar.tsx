import React from 'react';
import { CalendarDays, Clock, SlidersHorizontal } from 'lucide-react';

export type CalendarMobilePanel = 'month' | 'detail' | 'sidebar';

interface GoogleCalendarMobileNavBarProps {
  activePanel: CalendarMobilePanel;
  onChangePanel: (panel: CalendarMobilePanel) => void;
  selectedDate: string;
}

export const GoogleCalendarMobileNavBar: React.FC<GoogleCalendarMobileNavBarProps> = ({
  activePanel,
  onChangePanel,
  selectedDate,
}) => {
  const dateObj = new Date(selectedDate);
  const dateLabel = !isNaN(dateObj.getTime())
    ? `${dateObj.getMonth() + 1}.${dateObj.getDate()}`
    : '';

  return (
    <nav className="h-14 bg-white border-t border-[#dadce0] flex items-center justify-around px-2 shrink-0 select-none z-20 shadow-md lg:hidden">
      {/* 1. 메뉴 / 필터 패널 */}
      <button
        type="button"
        onClick={() => onChangePanel('sidebar')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
          activePanel === 'sidebar'
            ? 'text-[#1a73e8] font-semibold'
            : 'text-[#5f6368] hover:text-[#202124]'
        }`}
      >
        <SlidersHorizontal className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">메뉴·필터</span>
      </button>

      {/* 2. 월간 달력 패널 */}
      <button
        type="button"
        onClick={() => onChangePanel('month')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
          activePanel === 'month'
            ? 'text-[#1a73e8] font-semibold'
            : 'text-[#5f6368] hover:text-[#202124]'
        }`}
      >
        <CalendarDays className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">월간 달력</span>
      </button>

      {/* 3. 상세 일정 패널 */}
      <button
        type="button"
        onClick={() => onChangePanel('detail')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
          activePanel === 'detail'
            ? 'text-[#1a73e8] font-semibold'
            : 'text-[#5f6368] hover:text-[#202124]'
        }`}
      >
        <div className="relative">
          <Clock className="w-5 h-5 mb-0.5" />
          {dateLabel && (
            <span className="absolute -top-1 -right-4 px-1 py-0.2 bg-[#e8f0fe] text-[#1a73e8] text-[9px] font-bold rounded-full border border-[#d2e3fc]">
              {dateLabel}
            </span>
          )}
        </div>
        <span className="text-[11px] leading-tight">상세 일정</span>
      </button>
    </nav>
  );
};
