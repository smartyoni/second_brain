import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GoogleMiniCalendarProps {
  currentDateObj: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const GoogleMiniCalendar: React.FC<GoogleMiniCalendarProps> = ({
  currentDateObj,
  selectedDate,
  onSelectDate,
}) => {
  const [navDate, setNavDate] = React.useState<Date>(new Date(currentDateObj));

  const year = navDate.getFullYear();
  const month = navDate.getMonth();

  const handlePrevMonth = () => {
    setNavDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(year, month + 1, 1));
  };

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full select-none text-xs px-1">
      {/* 년월 + 이전/다음 */}
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="font-medium text-[#3c4043] text-sm">
          {year}년 {month + 1}월
        </span>
        <div className="flex items-center">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#70757a] mb-1">
        <span>일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>

      {/* 일자 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {days.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-[11px] font-normal transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#d2e3fc] text-[#174ea6] font-bold'
                  : isToday
                  ? 'bg-[#1a73e8] text-white font-bold'
                  : item.isCurrentMonth
                  ? 'text-[#3c4043] hover:bg-[#f1f3f4]'
                  : 'text-[#80868b] hover:bg-[#f1f3f4]'
              }`}
            >
              {item.dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};
