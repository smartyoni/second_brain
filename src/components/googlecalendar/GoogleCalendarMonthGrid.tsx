import React, { useRef } from 'react';
import { CalendarScheduleItem } from '../../types';
import { getTodayDateStr, getDatesInRange } from '../../utils/googleCalendarUtils';
import { GoogleCalendarMonthCell, MonthGridDayInfo } from './GoogleCalendarMonthCell';

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
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  compact?: boolean;
  weekOnly?: boolean;
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
  onSwipeUp,
  onSwipeDown,
  compact = false,
  weekOnly = false,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwipingRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    // 10px 이상 움직이면 스와이프 상태로 간주하여 클릭 방지
    if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (absX > 40 && absX > absY) {
      // 좌우 스와이프: 월 이동
      if (diffX < 0) {
        onNextMonth?.();
      } else {
        onPrevMonth?.();
      }
    } else if (absY > 35 && absY > absX) {
      // 상하 스와이프: 월간뷰 접기 / 펼치기
      if (diffY < 0) {
        // 위로 스와이프 -> 뷰 접기 (아젠다 펼치기)
        onSwipeUp?.();
      } else {
        // 아래로 스와이프 -> 뷰 펼치기 (아젠다 닫기)
        onSwipeDown?.();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    // 잠시 후 스와이프 플래그 초기화
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 50);
  };

  const year = currentDateObj.getFullYear();
  const month = currentDateObj.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const todayStr = getTodayDateStr();

  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarScheduleItem[]>();
    items.forEach((item) => {
      const dates =
        item.isInProgress && !item.isCompleted
          ? [todayStr]
          : getDatesInRange(item.dueDate, item.endDate);
      dates.forEach((dStr) => {
        const arr = map.get(dStr) || [];
        arr.push(item);
        map.set(dStr, arr);
      });
    });
    return map;
  }, [items, todayStr]);

  const days: MonthGridDayInfo[] = [];

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

  const totalWeeks = Math.ceil(days.length / 7);

  // 주간 접힘 모드(weekOnly): 선택된 날짜가 속한 주 7일만 표시
  const visibleDays = React.useMemo(() => {
    if (!weekOnly) return days;
    const selectedIdx = days.findIndex((d) => d.dateStr === selectedDate);
    if (selectedIdx === -1) return days.slice(0, 7);
    const weekIdx = Math.floor(selectedIdx / 7);
    return days.slice(weekIdx * 7, weekIdx * 7 + 7);
  }, [weekOnly, days, selectedDate]);

  const handleCellSelect = (dateStr: string) => {
    if (isSwipingRef.current) return;
    onSelectDate(dateStr);
    if (onDateClickMobile) {
      onDateClickMobile(dateStr);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white select-none touch-pan-y"
    >
      {/* 요일 헤더 */}
      <div
        className={`grid grid-cols-7 border-b border-[#dadce0] text-center font-medium text-[#70757a] shrink-0 bg-[#fafafa] ${
          compact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'
        }`}
      >
        {WEEKDAYS.map((day, idx) => (
          <span
            key={day}
            className={idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : ''}
          >
            {day}
          </span>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div
        className="flex-1 grid grid-cols-7 border-l border-[#dadce0] overflow-y-auto"
        style={{
          gridTemplateRows: weekOnly
            ? 'minmax(48px, auto)'
            : compact
            ? `repeat(${totalWeeks}, minmax(0, 1fr))`
            : `repeat(${totalWeeks}, minmax(90px, 1fr))`,
        }}
      >
        {visibleDays.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          const dayItems = itemsByDate.get(item.dateStr) || [];
          const colIdx = idx % 7;

          return (
            <GoogleCalendarMonthCell
              key={idx}
              item={item}
              isSelected={isSelected}
              isToday={isToday}
              dayItems={dayItems}
              colIdx={colIdx}
              compact={compact}
              draggedItem={draggedItem}
              onCellSelect={handleCellSelect}
              onCellClick={onCellClick}
              onSelectItem={onSelectItem}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDropOnDate={onDropOnDate}
              onDragEnd={onDragEnd}
              onContextMenu={onContextMenu}
            />
          );
        })}
      </div>
    </div>
  );
};
