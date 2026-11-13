import React from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface GoogleCalendarHeaderProps {
  onToggleSidebar: () => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const GoogleCalendarHeader: React.FC<GoogleCalendarHeaderProps> = ({
  onToggleSidebar,
  title,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <header className="h-9 px-2 sm:px-2.5 bg-white border-b border-[#dadce0] flex items-center justify-between select-none shrink-0 z-30">
      {/* 좌측: 햄버거 메뉴 + 오늘 버튼 + 이전/다음 + 날짜 타이틀 */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1 sm:p-1.5 rounded hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
          title="기본 메뉴"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToday}
          className="px-2.5 py-0.5 border border-[#dadce0] rounded text-xs font-medium text-[#3c4043] hover:bg-[#f1f3f4] transition-colors cursor-pointer ml-0.5"
        >
          오늘
        </button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onPrev}
            className="p-1 rounded hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
            title="이전"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1 rounded hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
            title="다음"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-xs sm:text-sm font-semibold text-[#3c4043] tracking-tight ml-1.5 truncate">
          {title}
        </h2>
      </div>
    </header>
  );
};
