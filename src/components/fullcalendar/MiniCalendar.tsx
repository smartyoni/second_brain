import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  currentDateObj: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDateObj,
  selectedDate,
  onSelectDate,
}) => {
  const [navDate, setNavDate] = React.useState<Date>(new Date(currentDateObj));

  const year = navDate.getFullYear();
  const month = navDate.getMonth(); // 0 ~ 11

  const handlePrevMonth = () => {
    setNavDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(year, month + 1, 1));
  };

  // 이번 달 1일 요일 (0: 일 ~ 6: 토)
  const firstDay = new Date(year, month, 1).getDay();
  // 이번 달 총 일수
  const lastDate = new Date(year, month + 1, 0).getDate();
  // 지난 달 총 일수
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // 이전 달 채우기
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // 이번 달
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // 다음 달 채우기 (총 35 or 42칸)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg select-none text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-800">
          {year}년 {month + 1}월
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
        <span className="text-red-500">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span className="text-blue-500">토</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              className={`h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold'
                  : isToday
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : item.isCurrentMonth
                  ? 'text-slate-800 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-50'
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
