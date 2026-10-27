import React from 'react';
import { CalendarScheduleItem } from '../../types';
import { getCategoryColor } from '../../utils/calendarUtils';
import { Clock } from 'lucide-react';

interface FullCalendarWeekViewProps {
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectDate: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
}

export const FullCalendarWeekView: React.FC<FullCalendarWeekViewProps> = ({
  currentDateObj,
  selectedDate,
  items,
  onSelectDate,
  onSelectItem,
}) => {
  // 이번 주 일요일 구하기
  const dayOfWeek = currentDateObj.getDay(); // 0(일) ~ 6(토)
  const sunday = new Date(currentDateObj);
  sunday.setDate(sunday.getDate() - dayOfWeek);

  const weekDays: { dateStr: string; dayNum: number; dayName: string }[] = [];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    weekDays.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: dayNames[i],
    });
  }

  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarScheduleItem[]>();
    items.forEach((item) => {
      const arr = map.get(item.dueDate) || [];
      arr.push(item);
      map.set(item.dueDate, arr);
    });
    return map;
  }, [items]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      {/* 주간 7개 컬럼 그리드 */}
      <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200 bg-white overflow-y-auto">
        {weekDays.map((col, idx) => {
          const isSelected = col.dateStr === selectedDate;
          const isToday = col.dateStr === todayStr;
          const dayItems = itemsByDate.get(col.dateStr) || [];
          const isSunday = idx === 0;
          const isSaturday = idx === 6;

          return (
            <div
              key={col.dateStr}
              onClick={() => onSelectDate(col.dateStr)}
              className={`flex flex-col h-full transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              {/* 컬럼 상단 헤더 */}
              <div
                className={`p-3 text-center border-b border-slate-200 shrink-0 ${
                  isToday ? 'bg-blue-50' : 'bg-slate-50'
                }`}
              >
                <div
                  className={`text-[11px] font-bold ${
                    isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-slate-500'
                  }`}
                >
                  {col.dayName}요일
                </div>
                <div
                  className={`mt-1 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                    isToday ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-800'
                  }`}
                >
                  {col.dayNum}
                </div>
              </div>

              {/* 일정 리스트 본문 */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {dayItems.length === 0 ? (
                  <div className="text-center py-6 text-slate-300 text-[11px]">일정 없음</div>
                ) : (
                  dayItems.map((schedule) => {
                    const color = getCategoryColor(schedule.categoryId);
                    return (
                      <div
                        key={schedule.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(schedule);
                        }}
                        className={`p-2.5 rounded-lg border text-xs shadow-2xs cursor-pointer transition-transform hover:scale-[1.01] ${
                          color.bg
                        } ${color.border} ${
                          schedule.isCompleted ? 'opacity-50 line-through' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{schedule.dueTime || '종일'}</span>
                        </div>
                        <div className={`font-semibold leading-snug break-words ${color.text}`}>
                          {schedule.title}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
