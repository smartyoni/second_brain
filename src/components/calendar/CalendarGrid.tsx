import React from 'react';
import { CalendarScheduleItem } from '../../types';

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number; // 0 ~ 11
  selectedDate: string; // YYYY-MM-DD
  scheduleItems: CalendarScheduleItem[];
  onSelectDate: (date: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentYear,
  currentMonth,
  selectedDate,
  scheduleItems,
  onSelectDate,
}) => {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 당월 첫날 요일 및 마지막 날짜 계산
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

  // 오늘 날짜 문자열
  const todayStr = new Date().toISOString().slice(0, 10);

  // 캘린더 그리드 타일 배열 생성
  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // 1. 이전 달 날짜들
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, d);
    const dateStr = prevMonthDate.toISOString().slice(0, 10);
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // 2. 이번 달 날짜들
  for (let d = 1; d <= lastDateOfMonth; d++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${mStr}-${dStr}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // 3. 다음 달 날짜들 (총 셀 35개 또는 42개로 맞춤)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthDate = new Date(currentYear, currentMonth + 1, d);
    const dateStr = nextMonthDate.toISOString().slice(0, 10);
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // 날짜별 일정 매핑
  const itemsByDate = scheduleItems.reduce<Record<string, CalendarScheduleItem[]>>((acc, item) => {
    if (!acc[item.dueDate]) acc[item.dueDate] = [];
    acc[item.dueDate].push(item);
    return acc;
  }, {});

  return (
    <div className="w-full bg-white select-none border-b border-slate-300 shrink-0">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-slate-300 text-center py-1 text-[11px] font-bold bg-slate-100">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`${
              idx === 0 ? 'text-red-600' : idx === 6 ? 'text-blue-600' : 'text-slate-800'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
        {days.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;
          const isSunday = idx % 7 === 0;
          const isSaturday = idx % 7 === 6;
          const dayItems = itemsByDate[cell.dateStr] || [];
          const hasIncomplete = dayItems.some((i) => !i.isCompleted);

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[58px] p-1 flex flex-col justify-between cursor-pointer transition-colors ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/50 text-slate-400'
                  : isSelected
                  ? 'bg-blue-100/70 font-bold'
                  : 'hover:bg-slate-100/70 text-slate-800'
              } ${isSelected ? 'ring-2 ring-blue-600 ring-inset z-10' : ''}`}
            >
              {/* 상단: 날짜 번호 및 오늘 뱃지 */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] inline-flex items-center justify-center w-5 h-5 rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold'
                      : !cell.isCurrentMonth
                      ? 'text-slate-300'
                      : isSunday
                      ? 'text-red-600'
                      : isSaturday
                      ? 'text-blue-600'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {dayItems.length > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-semibold ${
                      hasIncomplete
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {dayItems.length}
                  </span>
                )}
              </div>

              {/* 하단: 일정 마커들 (최대 2개 미리보기 및 점) */}
              <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                {dayItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className={`text-[9px] px-1 py-0.2 rounded truncate leading-tight font-semibold ${
                      item.isCompleted
                        ? 'line-through text-slate-400 bg-slate-100'
                        : item.sourceType === 'checklist'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                    title={item.title}
                  >
                    {item.title}
                  </div>
                ))}
                {dayItems.length > 2 && (
                  <span className="text-[8px] text-slate-400 pl-0.5 leading-none">
                    +{dayItems.length - 2}건
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
