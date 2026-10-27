import React from 'react';
import { CalendarScheduleItem } from '../../types';
import {
  getGoogleCategoryColor,
  TIMELINE_HOURS,
  TIMELINE_HOUR_HEIGHT,
  formatGoogleHourLabel,
} from '../../utils/googleCalendarUtils';
import { parseTimeToMinutes } from '../../utils/calendarUtils';

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
}) => {
  const dayItems = items.filter((i) => i.dueDate === selectedDate);
  const allDayItems = dayItems.filter((i) => !i.dueTime);
  const timedItems = dayItems.filter((i) => !!i.dueTime);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  const dateObj = new Date(selectedDate);
  const dayName = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })
    : '';
  const dayNum = !isNaN(dateObj.getTime()) ? dateObj.getDate() : '';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const redLineTop = (currentMinutes / 60) * TIMELINE_HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* 1. 상단 일자 헤더 */}
      <div className="flex border-b border-[#dadce0] bg-white shrink-0 pr-4">
        <div className="w-20 shrink-0 flex items-end justify-center pb-2 text-[10px] text-[#70757a] border-r border-[#dadce0]">
          GMT+9
        </div>
        <div className="flex-1 py-3 px-6 flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold ${
              isToday ? 'bg-[#1a73e8] text-white shadow-2xs' : 'text-[#3c4043]'
            }`}
          >
            {dayNum}
          </div>
          <div>
            <span className="text-sm font-medium text-[#70757a]">{dayName}요일</span>
            <span className="text-xs text-[#70757a] ml-2">일정 {dayItems.length}개</span>
          </div>
        </div>
      </div>

      {/* 2. 상단 종일 일정 슬롯 */}
      <div className="flex border-b border-[#dadce0] bg-[#fafafa] shrink-0 min-h-[38px] pr-4">
        <div className="w-20 shrink-0 flex items-center justify-center text-[10px] text-[#70757a] border-r border-[#dadce0] font-medium">
          종일
        </div>
        <div
          onClick={() => onCellClick(selectedDate, undefined, true)}
          onDragOver={onDragOver}
          onDrop={(e) => {
            e.preventDefault();
            onDropAllDay(selectedDate);
          }}
          className="flex-1 p-1.5 flex flex-wrap gap-1.5 min-h-[36px] hover:bg-blue-50/20 transition-colors cursor-pointer"
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
                className={`px-2 py-0.5 rounded-xs text-[11px] font-medium text-white shadow-2xs cursor-grab active:cursor-grabbing ${
                  color.bg
                } ${schedule.isCompleted ? 'line-through opacity-50' : 'hover:opacity-90'} ${
                  isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                }`}
              >
                {schedule.title}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 24시간 타임라인 */}
      <div className="flex-1 overflow-y-auto flex relative">
        {/* 좌측 시간 라벨 */}
        <div className="w-20 shrink-0 select-none border-r border-[#dadce0]">
          {TIMELINE_HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: `${TIMELINE_HOUR_HEIGHT}px` }}
              className="text-[10px] text-[#70757a] text-right pr-3 relative -top-2"
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
                onClick={() => onCellClick(selectedDate, timeStr, false)}
                onDragOver={onDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropOnTime(selectedDate, timeStr);
                }}
                className="border-b border-[#f1f3f4] hover:bg-blue-50/20 transition-colors cursor-pointer"
                title={`${timeStr} 클릭하여 일정 추가`}
              />
            );
          })}

          {/* 현재 시각 빨간선 */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: `${redLineTop}px` }}
            >
              <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-[#ea4335]" />
              <div className="flex-1 h-[2px] bg-[#ea4335]" />
            </div>
          )}

          {/* 일정 블록들 */}
          {timedItems.map((schedule) => {
            const color = getGoogleCategoryColor(schedule.categoryId);
            const min = parseTimeToMinutes(schedule.dueTime) ?? 9 * 60;
            const top = (min / 60) * TIMELINE_HOUR_HEIGHT;
            const height = 44;
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
                style={{ top: `${top}px`, height: `${height}px` }}
                className={`absolute left-2 right-6 rounded-md px-3 py-1.5 text-xs cursor-grab active:cursor-grabbing shadow-xs transition-opacity z-10 ${
                  color.bg
                } ${color.text} ${
                  schedule.isCompleted ? 'opacity-50 line-through' : 'hover:opacity-90'
                } ${
                  isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                }`}
                title={`${schedule.title} (${schedule.dueTime}) - 드래그하여 시간 이동`}
              >
                <div className="text-[10px] font-medium opacity-90 truncate">
                  {schedule.dueTime}
                </div>
                <div className="font-semibold truncate text-sm">
                  {schedule.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
