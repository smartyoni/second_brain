import React from 'react';
import { CalendarScheduleItem } from '../../types';
import { getCategoryColor } from '../../utils/calendarUtils';

interface FullCalendarMonthViewProps {
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectDate: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
}

export const FullCalendarMonthView: React.FC<FullCalendarMonthViewProps> = ({
  currentDateObj,
  selectedDate,
  items,
  onSelectDate,
  onSelectItem,
}) => {
  const year = currentDateObj.getFullYear();
  const month = currentDateObj.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  // 일정 날짜별 그룹화
  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarScheduleItem[]>();
    items.forEach((item) => {
      const arr = map.get(item.dueDate) || [];
      arr.push(item);
      map.set(item.dueDate, arr);
    });
    return map;
  }, [items]);

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
  const totalWeeks = Math.ceil(days.length / 7);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      {/* 1. 요일 바 */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-white text-center py-2 text-xs font-bold text-slate-500 shrink-0 shadow-2xs">
        <span className="text-red-500">일요일</span>
        <span>월요일</span>
        <span>화요일</span>
        <span>수요일</span>
        <span>목요일</span>
        <span>금요일</span>
        <span className="text-blue-500">토요일</span>
      </div>

      {/* 2. 대형 캘린더 그리드 */}
      <div
        className="flex-1 grid grid-cols-7 gap-px bg-slate-200 overflow-y-auto"
        style={{
          gridTemplateRows: `repeat(${totalWeeks}, minmax(110px, 1fr))`,
        }}
      >
        {days.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          const dayItems = itemsByDate.get(item.dateStr) || [];
          const isSunday = idx % 7 === 0;
          const isSaturday = idx % 7 === 6;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex flex-col bg-white p-1.5 transition-colors cursor-pointer min-h-[110px] overflow-hidden ${
                isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''
              } ${!item.isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : 'hover:bg-slate-50/80'}`}
            >
              {/* 날짜 헤더 */}
              <div className="flex items-center justify-between mb-1 shrink-0">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isSunday
                      ? 'text-red-500'
                      : isSaturday
                      ? 'text-blue-500'
                      : item.isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {item.dayNum}
                </span>

                {dayItems.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-semibold px-1">
                    {dayItems.length}건
                  </span>
                )}
              </div>

              {/* 일정 칩 목록 */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
                {dayItems.map((schedule) => {
                  const color = getCategoryColor(schedule.categoryId);
                  return (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(schedule);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1.5 transition-all truncate shadow-2xs cursor-pointer ${
                        color.bg
                      } ${color.border} ${color.text} ${
                        schedule.isCompleted ? 'opacity-50 line-through' : 'hover:scale-[1.01]'
                      }`}
                      title={`${schedule.title} (${schedule.dueTime || '종일'})`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`} />
                      {schedule.dueTime && (
                        <span className="text-[10px] font-bold shrink-0 opacity-80">
                          {schedule.dueTime}
                        </span>
                      )}
                      <span className="truncate flex-1">{schedule.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
