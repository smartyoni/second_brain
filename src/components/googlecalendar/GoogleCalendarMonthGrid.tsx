import React, { useRef } from 'react';
import { CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { getKoreanHoliday } from '../../utils/koreanHolidays';
import { SmartText } from '../shared/SmartText';

export interface GoogleCalendarMonthGridProps {
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  draggedItem: CalendarScheduleItem | null;
  onSelectDate: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onCellClick: (dateStr: string, time?: string, isAllDay?: boolean) => void;
  onDragStart: (item: CalendarScheduleItem, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnDate: (dateStr: string) => void;
  onDragEnd: () => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
  onDateClickMobile?: (dateStr: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  compact?: boolean;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const GoogleCalendarMonthGrid: React.FC<GoogleCalendarMonthGridProps> = ({
  currentDateObj,
  selectedDate,
  items,
  draggedItem,
  onSelectDate,
  onSelectItem,
  onCellClick,
  onDragStart,
  onDragOver,
  onDropOnDate,
  onDragEnd,
  onContextMenu,
  onDateClickMobile,
  onPrevMonth,
  onNextMonth,
  compact = false,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        onNextMonth?.();
      } else {
        onPrevMonth?.();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const year = currentDateObj.getFullYear();
  const month = currentDateObj.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarScheduleItem[]>();
    items.forEach((item) => {
      const arr = map.get(item.dueDate) || [];
      arr.push(item);
      map.set(item.dueDate, arr);
    });
    return map;
  }, [items]);

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; monthNum: number }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false, monthNum: m });
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true, monthNum: month + 1 });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false, monthNum: m });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalWeeks = Math.ceil(days.length / 7);

  const handleCellSelect = (dateStr: string) => {
    onSelectDate(dateStr);
    if (onDateClickMobile) {
      onDateClickMobile(dateStr);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white select-none touch-pan-y"
    >
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-[#dadce0] text-center text-[11px] font-medium text-[#70757a] py-2 shrink-0 bg-[#fafafa]">
        {WEEKDAYS.map((day, idx) => (
          <span key={day} className={idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : ''}>
            {day}
          </span>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div
        className="flex-1 grid grid-cols-7 border-l border-[#dadce0] overflow-y-auto"
        style={{
          gridTemplateRows: compact
            ? `repeat(${totalWeeks}, minmax(0, 1fr))`
            : `repeat(${totalWeeks}, minmax(90px, 1fr))`,
        }}
      >
        {days.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          const dayItems = itemsByDate.get(item.dateStr) || [];
          const isFirstDayOfMonth = item.dayNum === 1;
          const holiday = getKoreanHoliday(item.dateStr);
          const colIdx = idx % 7;
          const isSunday = colIdx === 0;
          const isSaturday = colIdx === 6;
          const isHolidayOrSunday = isSunday || !!holiday;

          return (
            <div
              key={idx}
              onClick={() => handleCellSelect(item.dateStr)}
              onDoubleClick={() => onCellClick(item.dateStr)}
              onContextMenu={(e) => {
                e.preventDefault();
                onSelectDate(item.dateStr);
                onCellClick(item.dateStr);
              }}
              onDragOver={onDragOver}
              onDrop={(e) => {
                e.preventDefault();
                onDropOnDate(item.dateStr);
              }}
              className={`flex flex-col border-r border-b border-[#dadce0] transition-colors cursor-pointer overflow-hidden ${
                compact ? 'p-0.5 min-h-0 h-full' : 'p-1 sm:p-1.5 min-h-[90px]'
              } ${
                isSelected ? 'bg-[#e8f0fe]/60 ring-2 ring-inset ring-[#1a73e8]' : 'hover:bg-[#f8f9fa]'
              }`}
            >
              {/* 날짜 헤더 */}
              <div
                className={`flex items-center justify-between px-0.5 mb-0.5 shrink-0 ${
                  compact ? 'h-4' : 'h-6'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center rounded-full transition-colors ${
                      compact ? 'w-5 h-5 text-[11px]' : 'w-6 h-6 text-xs'
                    } ${
                      isToday
                        ? 'bg-[#1a73e8] text-white font-bold'
                        : isHolidayOrSunday
                        ? item.isCurrentMonth
                          ? 'text-red-500 font-bold'
                          : 'text-red-300 font-normal'
                        : isSaturday
                        ? item.isCurrentMonth
                          ? 'text-blue-500 font-medium'
                          : 'text-blue-300 font-normal'
                        : isFirstDayOfMonth && !compact
                        ? 'font-medium text-[#3c4043] px-1'
                        : item.isCurrentMonth
                        ? 'text-[#3c4043] font-normal'
                        : 'text-[#70757a] font-normal'
                    }`}
                  >
                    {isFirstDayOfMonth && !compact ? `${item.monthNum}월 1일` : item.dayNum}
                  </span>

                  {holiday && item.isCurrentMonth && !compact && (
                    <span
                      className="text-[10px] text-red-500 font-semibold truncate max-w-[46px] sm:max-w-[70px]"
                      title={holiday.name}
                    >
                      {holiday.name}
                    </span>
                  )}
                </div>

                {dayItems.length > 0 && !compact && (
                  <span className="text-[10px] text-[#70757a] font-medium bg-[#f1f3f4] px-1 sm:px-1.5 py-0.2 rounded-full">
                    {dayItems.length}
                  </span>
                )}
              </div>

              {/* 일정 목록 (컴팩트 모드: 컬러 점(Dot) / 일반 모드: 일정 바) */}
              {compact ? (
                <div className="flex-1 flex items-center justify-center gap-0.5 flex-wrap px-0.5 overflow-hidden">
                  {dayItems.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        getGoogleCategoryColor(s.categoryId).bg
                      }`}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[8px] text-[#70757a] font-bold">
                      +{dayItems.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {dayItems.slice(0, 3).map((schedule) => {
                    const color = getGoogleCategoryColor(schedule.categoryId);
                    const isBeingDragged = draggedItem?.id === schedule.id;

                    return (
                      <div
                        key={schedule.id}
                        draggable
                        onDragStart={(e) => onDragStart(schedule, e)}
                        onDragEnd={onDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(schedule);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onContextMenu?.(schedule, e);
                        }}
                        className={`w-full rounded-xs px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold flex items-center transition-all cursor-grab active:cursor-grabbing truncate border border-slate-200/80 border-l-[3px] ${color.border} ${color.lightBg} text-slate-900 hover:brightness-95 hover:shadow-2xs ${
                          schedule.isCompleted ? 'line-through opacity-50 text-slate-500' : ''
                        } ${
                          isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                        }`}
                        title={`${schedule.title} (${schedule.dueTime || '종일'})`}
                      >
                        <span className="truncate">
                          <SmartText text={schedule.title} />
                        </span>
                      </div>
                    );
                  })}

                  {dayItems.length > 3 && (
                    <div className="px-1 text-[9px] sm:text-[10px] font-medium text-[#70757a] hover:bg-[#f1f3f4] rounded-xs cursor-pointer truncate mt-0.5">
                      +{dayItems.length - 3}개 더보기
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
