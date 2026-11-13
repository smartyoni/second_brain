import React, { useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  ShoppingBag,
  ListTodo,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarSideViewType } from './GoogleCalendarRightPanel';

interface GoogleCalendarRightPanelHeaderProps {
  sideViewType: CalendarSideViewType;
  formattedDate: string;
  selectedDate: string;
  isToday: boolean;
  onSelectDate: (dateStr: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddSchedule: () => void;
  onClose: () => void;
  todoInProgressCount: number;
}

export const GoogleCalendarRightPanelHeader: React.FC<GoogleCalendarRightPanelHeaderProps> = ({
  sideViewType,
  formattedDate,
  selectedDate,
  isToday,
  onSelectDate,
  onPrev,
  onNext,
  onToday,
  onAddSchedule,
  onClose,
  todoInProgressCount,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="h-9 px-2 sm:px-2.5 bg-white border-b border-[#dadce0] flex items-center justify-between select-none shrink-0 z-20">
      {sideViewType === 'todo' || sideViewType === 'shopping' ? (
        <>
          <div className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-[#3c4043] font-bold">
            {sideViewType === 'todo' ? (
              <>
                <ListTodo className="w-4 h-4 text-[#1a73e8]" />
                <span>진행중</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold">
                  {todoInProgressCount}
                </span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#1a73e8]" />
                <span>쇼핑</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors cursor-pointer"
            title="패널 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={onPrev}
              className="p-1 rounded-full hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer shrink-0"
              title="이전 날짜 이동"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="relative flex items-center gap-1.5 px-1.5 py-0.5 rounded-md hover:bg-[#e8eaed] text-xs text-[#3c4043] font-semibold cursor-pointer truncate"
              title="클릭하여 날짜 직접 선택"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
              <span className="truncate">{formattedDate}</span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                className="sr-only"
              />
            </div>

            <button
              type="button"
              onClick={onNext}
              className="p-1 rounded-full hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer shrink-0"
              title="다음 날짜 이동"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToday}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors cursor-pointer shrink-0 ${
                isToday
                  ? 'bg-[#1a73e8] text-white'
                  : 'bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
              }`}
              title="오늘 날짜로 이동"
            >
              오늘
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onAddSchedule}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
              title="새 일정 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>일정 추가</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors cursor-pointer"
              title="패널 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </header>
  );
};
