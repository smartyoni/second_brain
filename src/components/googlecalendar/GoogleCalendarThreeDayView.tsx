import React, { useRef, useEffect } from 'react';
import { CalendarScheduleItem } from '../../types';
import {
  getGoogleCategoryColor,
  TIMELINE_HOURS,
  TIMELINE_HOUR_HEIGHT,
  formatGoogleHourLabel,
  computeOverlappingLayout,
  getSlotRealDate,
  getNowTimelinePosition,
  getTodayDateStr,
  formatLocalDateStr,
  isItemOnDate,
} from '../../utils/googleCalendarUtils';
import { SmartText } from '../shared/SmartText';

interface GoogleCalendarThreeDayViewProps {
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectDate: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onCellClick: (dateStr: string, time?: string, isAllDay?: boolean) => void;
  draggedItem: CalendarScheduleItem | null;
  onDragStart: (item: CalendarScheduleItem, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnTime: (targetDate: string, targetTime: string) => void;
  onDropAllDay: (targetDate: string) => void;
  onDragEnd: () => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

export const GoogleCalendarThreeDayView: React.FC<GoogleCalendarThreeDayViewProps> = ({
  currentDateObj,
  selectedDate,
  items,
  onSelectDate,
  onSelectItem,
  onCellClick,
  draggedItem,
  onDragStart,
  onDragOver,
  onDropOnTime,
  onDropAllDay,
  onDragEnd,
  onContextMenu,
}) => {
  const threeDays: { dateStr: string; dayNum: number; dayName: string }[] = [];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  for (let i = 0; i < 3; i++) {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() + i);
    const dateStr = formatLocalDateStr(d);
    threeDays.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: dayNames[d.getDay()],
    });
  }

  const todayStr = getTodayDateStr();
  const nowPos = getNowTimelinePosition(TIMELINE_HOUR_HEIGHT);
  const redLineTop = nowPos.top;

  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // 07:00가 화면 최상단에 고정되어 보여지도록 자동 스크롤
  useEffect(() => {
    const scrollTo7AM = () => {
      if (timelineScrollRef.current) {
        timelineScrollRef.current.scrollTop = 7 * TIMELINE_HOUR_HEIGHT;
      }
    };
    scrollTo7AM();
    const rafId = requestAnimationFrame(scrollTo7AM);
    return () => cancelAnimationFrame(rafId);
  }, [currentDateObj, selectedDate]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* 1. 상단 고정: GMT 헤더 + 3개 날짜 컬럼 (높이 축소 및 1개 라인화) */}
      <div className="flex border-b border-[#dadce0] bg-white shrink-0 h-9">
        <div className="w-16 shrink-0 flex items-center justify-center text-[10px] text-[#70757a] border-r border-[#dadce0] font-medium">
          GMT+9
        </div>
        <div className="flex-1 grid grid-cols-3 divide-x divide-[#dadce0]">
          {threeDays.map((col) => {
            const isToday = col.dateStr === todayStr;
            const isSelected = col.dateStr === selectedDate;
            const isSunday = col.dayName === '일';
            const isSaturday = col.dayName === '토';
            const colItems = items.filter((i) => isItemOnDate(i, col.dateStr));

            return (
              <div
                key={col.dateStr}
                onClick={() => onSelectDate(col.dateStr)}
                className={`h-9 flex items-center justify-center gap-1.5 px-1 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#e8f0fe]/40' : 'hover:bg-[#f8f9fa]'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full text-xs transition-colors shrink-0 ${
                    isToday
                      ? 'w-5 h-5 bg-[#1a73e8] text-white font-bold'
                      : isSunday
                      ? 'w-5 h-5 text-red-500 font-medium'
                      : isSaturday
                      ? 'w-5 h-5 text-blue-500 font-medium'
                      : 'w-5 h-5 text-[#3c4043] font-medium'
                  }`}
                >
                  {col.dayNum}
                </span>
                <span
                  className={`text-xs font-medium truncate ${
                    isToday
                      ? 'text-[#1a73e8] font-bold'
                      : isSunday
                      ? 'text-red-500'
                      : isSaturday
                      ? 'text-blue-500'
                      : 'text-[#70757a]'
                  }`}
                >
                  {col.dayName}요일
                </span>
                <span className="text-[10px] text-[#70757a] shrink-0 font-normal">
                  ({colItems.length})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 상단 고정 종일(All-day) 일정 슬롯 행 (높이 확장) */}
      <div className="flex border-b border-[#dadce0] bg-[#fafafa] shrink-0 min-h-[58px]">
        <div className="w-16 shrink-0 flex items-center justify-center text-[10px] text-[#70757a] border-r border-[#dadce0] font-medium">
          종일
        </div>
        <div className="flex-1 grid grid-cols-3 divide-x divide-[#dadce0]">
          {threeDays.map((col) => {
            const allDayItems = items.filter(
              (i) => (!i.dueTime || (i.isInProgress && !i.isCompleted)) && isItemOnDate(i, col.dateStr)
            );
            return (
              <div
                key={col.dateStr}
                onClick={() => onCellClick(col.dateStr, undefined, true)}
                onDragOver={onDragOver}
                onDrop={(e) => { e.preventDefault(); onDropAllDay(col.dateStr); }}
                className="p-1.5 space-y-1 min-h-[58px] hover:bg-blue-50/20 transition-colors cursor-pointer"
                title="클릭하여 종일 일정 등록 / 드래그하여 이동"
              >
                {allDayItems.map((schedule) => {
                  const color = getGoogleCategoryColor(schedule.categoryId, schedule.isInProgress && !schedule.isCompleted);
                  const isBeingDragged = draggedItem?.id === schedule.id;
                  return (
                    <div
                      key={schedule.id}
                      draggable
                      onDragStart={(e) => onDragStart(schedule, e)}
                      onDragEnd={onDragEnd}
                      onClick={(e) => { e.stopPropagation(); onSelectItem(schedule); }}
                      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(schedule, e); }}
                      className={`px-2 py-0.5 rounded-xs text-[11px] font-medium text-white truncate shadow-2xs cursor-grab active:cursor-grabbing flex items-center gap-1 ${
                        color.bg
                      } ${schedule.isCompleted ? 'line-through opacity-50' : 'hover:opacity-90'} ${
                        isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                      }`}
                    >
                      {schedule.isInProgress && !schedule.isCompleted && (
                        <span className="px-1 py-0.2 rounded-xs bg-black/20 text-[9px] font-bold shrink-0">진행</span>
                      )}
                      <SmartText text={schedule.title} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 스크롤 24시간 타임라인 그리드 (3개 컬럼) */}
      <div ref={timelineScrollRef} className="flex-1 overflow-y-auto flex relative">
        {/* 좌측 시간 라벨 */}
        <div className="w-16 shrink-0 select-none border-r border-[#dadce0]">
          {TIMELINE_HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: `${TIMELINE_HOUR_HEIGHT}px` }}
              className="text-[10px] text-[#70757a] text-right pr-2 relative -top-2"
            >
              {formatGoogleHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* 3개 컬럼 메인 영역 */}
        <div className="flex-1 grid grid-cols-3 divide-x divide-[#dadce0] relative">
          {threeDays.map((col) => {
            const timedItems = items.filter(
              (i) => !!i.dueTime && !(i.isInProgress && !i.isCompleted) && isItemOnDate(i, col.dateStr)
            );

            return (
              <div key={col.dateStr} className="relative h-full">
                {/* 24시간 슬롯 드롭 존들 & 클릭하여 일정 등록 */}
                {TIMELINE_HOURS.map((hour) => {
                  const timeStr = `${String(hour).padStart(2, '0')}:00`;
                  return (
                    <div
                      key={hour}
                      style={{ height: `${TIMELINE_HOUR_HEIGHT}px` }}
                      onClick={() => onCellClick(getSlotRealDate(col.dateStr, hour), timeStr, false)}
                      onDragOver={onDragOver}
                      onDrop={(e) => {
                        e.preventDefault();
                        onDropOnTime(getSlotRealDate(col.dateStr, hour), timeStr);
                      }}
                      className="border-b border-[#f1f3f4] hover:bg-blue-50/20 transition-colors cursor-pointer"
                      title={`${col.dateStr} ${timeStr} 클릭하여 일정 추가`}
                    />
                  );
                })}

                {/* 현재 시각 빨간선 */}
                {col.dateStr === nowPos.dateStr && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: `${redLineTop}px` }}
                  >
                    <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-[#ea4335]" />
                    <div className="flex-1 h-[2px] bg-[#ea4335]" />
                  </div>
                )}

                {/* 해당 일자의 시간제 일정 블록들 (구글 캘린더 스타일 오버랩 레이아웃) */}
                {computeOverlappingLayout(timedItems, TIMELINE_HOUR_HEIGHT, 60).map(
                  ({ item: schedule, top, height, leftPercent, widthPercent }) => {
                    const color = getGoogleCategoryColor(schedule.categoryId, schedule.isInProgress && !schedule.isCompleted);
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
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${leftPercent}% + 1px)`,
                          width: `calc(${widthPercent}% - 2px)`,
                        }}
                        className={`absolute rounded-sm px-2 py-0.5 text-xs cursor-grab active:cursor-grabbing shadow-xs transition-opacity z-10 overflow-hidden ${
                          color.bg
                        } ${color.text} ${
                          schedule.isCompleted ? 'opacity-50 line-through' : 'hover:opacity-90'
                        } ${
                          isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                        }`}
                        title={`${schedule.title} (${schedule.dueTime}) - 드래그하여 시간 이동`}
                      >
                        <div className="text-[10px] font-medium opacity-90 truncate leading-none mb-0.5">
                          {schedule.dueTime}
                        </div>
                        <div className="font-semibold truncate leading-tight text-[11px]">
                          <SmartText text={schedule.title} />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
