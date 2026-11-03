import React from 'react';
import { CalendarScheduleItem } from '../../types';
import {
  getGoogleCategoryColor,
  TIMELINE_HOURS,
  TIMELINE_HOUR_HEIGHT,
  formatGoogleHourLabel,
  computeOverlappingLayout,
  getTimelineColumnDate,
  getSlotRealDate,
  getNowTimelinePosition,
  getTodayDateStr,
  parseLocalDate,
} from '../../utils/googleCalendarUtils';
import { getKoreanHoliday } from '../../utils/koreanHolidays';
import { SmartText } from '../shared/SmartText';

interface GoogleCalendarDayViewProps {
  selectedDate: string;
  items: CalendarScheduleItem[];
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

export const GoogleCalendarDayView: React.FC<GoogleCalendarDayViewProps> = ({
  selectedDate,
  items,
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
  const allDayItems = items.filter((i) => i.dueDate === selectedDate && !i.dueTime);
  const timedItems = items.filter(
    (i) => !!i.dueTime && getTimelineColumnDate(i.dueDate, i.dueTime) === selectedDate
  );
  const dayItems = [...allDayItems, ...timedItems];

  const todayStr = getTodayDateStr();
  const isToday = selectedDate === todayStr;
  const holiday = getKoreanHoliday(selectedDate);

  const dateObj = parseLocalDate(selectedDate);
  const dayOfWeek = !isNaN(dateObj.getTime()) ? dateObj.getDay() : -1;
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isHolidayOrSunday = isSunday || !!holiday;

  const dayName = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })
    : '';
  const dayNum = !isNaN(dateObj.getTime()) ? dateObj.getDate() : '';

  const nowPos = getNowTimelinePosition(TIMELINE_HOUR_HEIGHT);
  const redLineTop = nowPos.top;
  const isNowColumn = selectedDate === nowPos.dateStr;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* 1. 상단 일자 헤더 (높이 축소 및 1개 라인 배치) */}
      <div className="flex border-b border-[#dadce0] bg-white shrink-0 h-9">
        <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center text-[10px] text-[#70757a] border-r border-[#dadce0] font-medium">
          GMT+9
        </div>
        <div className="flex-1 px-3 sm:px-4 flex items-center gap-2 overflow-hidden">
          <span
            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold shrink-0 ${
              isToday
                ? 'bg-[#1a73e8] text-white shadow-2xs'
                : isHolidayOrSunday
                ? 'text-red-500'
                : isSaturday
                ? 'text-blue-500'
                : 'text-[#3c4043]'
            }`}
          >
            {dayNum}
          </span>
          <span className={`text-xs font-semibold shrink-0 ${isHolidayOrSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-[#3c4043]'}`}>
            {dayName}요일
          </span>
          {holiday && (
            <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-1.5 py-0.2 rounded-full border border-red-200 shrink-0">
              {holiday.name}
            </span>
          )}
          <span className="text-xs text-[#70757a] shrink-0">· 일정 {dayItems.length}개</span>
        </div>
      </div>

      {/* 2. 상단 종일 일정 슬롯 (높이 확장: 기존 헤더 높이만큼 넉넉하게 변경) */}
      <div className="flex border-b border-[#dadce0] bg-[#fafafa] shrink-0 min-h-[58px]">
        <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center text-[10px] text-[#70757a] border-r border-[#dadce0] font-medium">
          종일
        </div>
        <div
          onClick={() => onCellClick(selectedDate, undefined, true)}
          onDragOver={onDragOver}
          onDrop={(e) => {
            e.preventDefault();
            onDropAllDay(selectedDate);
          }}
          className="flex-1 p-1.5 flex flex-wrap gap-1.5 min-h-[58px] hover:bg-blue-50/20 transition-colors cursor-pointer overflow-y-auto"
          title="클릭하여 종일 일정 등록 / 드래그하여 이동"
        >
          {allDayItems.map((schedule) => {
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
                className={`px-2 py-0.5 rounded-xs text-[11px] font-medium text-white shadow-2xs cursor-grab active:cursor-grabbing ${
                  color.bg
                } ${schedule.isCompleted ? 'line-through opacity-50' : 'hover:opacity-90'} ${
                  isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                }`}
              >
                <SmartText text={schedule.title} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 24시간 타임라인 */}
      <div className="flex-1 overflow-y-auto flex relative">
        {/* 좌측 시간 라벨 (상단 종일/GMT 영역과 동일하게 w-16 sm:w-20 적용) */}
        <div className="w-16 sm:w-20 shrink-0 select-none border-r border-[#dadce0]">
          {TIMELINE_HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: `${TIMELINE_HOUR_HEIGHT}px` }}
              className="text-[10px] text-[#70757a] text-right pr-2 sm:pr-3 relative -top-2"
            >
              {formatGoogleHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* 1개 컬럼 메인 영역 */}
        <div className="flex-1 relative">
          {/* 가로 시간 슬롯 드롭 존들 & 클릭하여 일정 등록 */}
          {TIMELINE_HOURS.map((hour) => {
            const timeStr = `${String(hour).padStart(2, '0')}:00`;
            return (
              <div
                key={hour}
                style={{ height: `${TIMELINE_HOUR_HEIGHT}px` }}
                onClick={() => onCellClick(getSlotRealDate(selectedDate, hour), timeStr, false)}
                onDragOver={onDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropOnTime(getSlotRealDate(selectedDate, hour), timeStr);
                }}
                className="border-b border-[#f1f3f4] hover:bg-blue-50/20 transition-colors cursor-pointer"
                title={`${timeStr} 클릭하여 일정 추가`}
              />
            );
          })}

          {/* 현재 시각 빨간선 */}
          {isNowColumn && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: `${redLineTop}px` }}
            >
              <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-[#ea4335]" />
              <div className="flex-1 h-[2px] bg-[#ea4335]" />
            </div>
          )}

          {/* 일정 블록들 (구글 캘린더 스타일 시간 겹침 오버랩 레이아웃) */}
          {computeOverlappingLayout(timedItems, TIMELINE_HOUR_HEIGHT, 60).map(
            ({ item: schedule, top, height, leftPercent, widthPercent }) => {
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
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `calc(${leftPercent}% + 2px)`,
                    width: `calc(${widthPercent}% - 4px)`,
                  }}
                  className={`absolute rounded-md px-2.5 py-1 text-xs cursor-grab active:cursor-grabbing shadow-xs transition-opacity z-10 overflow-hidden ${
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
                  <div className="font-semibold truncate text-xs leading-tight">
                    <SmartText text={schedule.title} />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
