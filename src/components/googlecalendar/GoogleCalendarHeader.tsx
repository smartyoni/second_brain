import React from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Settings,
} from 'lucide-react';

interface GoogleCalendarHeaderProps {
  onToggleSidebar: () => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const GoogleCalendarHeader: React.FC<GoogleCalendarHeaderProps> = ({
  onToggleSidebar,
  title,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  onSearchChange,
}) => {
  const todayNum = new Date().getDate();

  return (
    <header className="h-16 px-4 bg-white border-b border-[#dadce0] flex items-center justify-between select-none shrink-0 z-30">
      {/* 1. 좌측: 햄버거 메뉴 + 로고 + 네비게이션 + 날짜 */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2.5 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
          title="기본 메뉴"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 구글 캘린더 로고 스타일 */}
        <div className="flex items-center gap-2 cursor-pointer pr-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white shadow-2xs">
            <span className="text-[9px] font-bold leading-none uppercase">CAL</span>
            <span className="text-xs font-black leading-none mt-0.5">{todayNum}</span>
          </div>
          <span className="text-xl font-normal text-[#3c4043] tracking-tight hidden sm:inline">
            캘린더
          </span>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="px-4 py-2 border border-[#dadce0] rounded-md text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] transition-colors cursor-pointer ml-2"
        >
          오늘
        </button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onPrev}
            className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
            title="이전"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
            title="다음"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-normal text-[#3c4043] tracking-tight ml-2">
          {title}
        </h2>
      </div>

      {/* 2. 중앙: 구글 스타일 검색바 */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <div className="relative flex items-center bg-[#f1f3f4] focus-within:bg-white focus-within:shadow-md border focus-within:border-transparent border-transparent rounded-lg transition-all">
          <div className="pl-3.5 pr-2 text-[#5f6368]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="검색"
            className="w-full py-2.5 text-sm bg-transparent outline-none text-[#3c4043] placeholder-[#5f6368]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1.5 mr-2 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. 우측: 설정 + 프로필 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hidden sm:flex cursor-pointer"
          title="설정"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* 사용자 아바타 */}
        <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs ml-1 shadow-2xs">
          SB
        </div>
      </div>
    </header>
  );
};
