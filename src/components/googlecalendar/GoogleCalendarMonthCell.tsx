import React from 'react';
import { CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { getKoreanHoliday } from '../../utils/koreanHolidays';
import { getLunarDate } from '../../utils/lunarCalendar';
import { SmartText } from '../shared/SmartText';

export interface MonthGridDayInfo {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  monthNum: number;
}

interface GoogleCalendarMonthCellProps {
  item: MonthGridDayInfo;
  isSelected: boolean;
  isToday: boolean;
  dayItems: CalendarScheduleItem[];
  colIdx: number;
  compact: boolean;
  draggedItem: CalendarScheduleItem | null;
  onCellSelect: (dateStr: string) => void;
  onCellClick: (dateStr: string, time?: string, isAllDay?: boolean) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onDragStart: (item: CalendarScheduleItem, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnDate: (dateStr: string) => void;
  onDragEnd: () => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

export const GoogleCalendarMonthCell: React.FC<GoogleCalendarMonthCellProps> = ({
  item,
  isSelected,
  isToday,
  dayItems,
  colIdx,
  compact,
  draggedItem,
  onCellSelect,
  onCellClick,
  onSelectItem,
  onDragStart,
  onDragOver,
  onDropOnDate,
  onDragEnd,
  onContextMenu,
}) => {
  const isFirstDayOfMonth = item.dayNum === 1;
  const holiday = getKoreanHoliday(item.dateStr);
  const lunar = getLunarDate(item.dateStr);
  const isSunday = colIdx === 0;
  const isSaturday = colIdx === 6;
  const isHolidayOrSunday = isSunday || !!holiday;

  return (
    <div
      onClick={() => onCellSelect(item.dateStr)}
      onDoubleClick={() => onCellClick(item.dateStr)}
      onContextMenu={(e) => {
        e.preventDefault();
        onCellSelect(item.dateStr);
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
        className={`flex items-center justify-between px-0.5 shrink-0 ${
          compact ? 'h-3.5 mb-0' : 'h-6 mb-0.5'
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={`inline-flex items-center justify-center rounded-full transition-colors ${
              compact ? 'w-4 h-4 text-[10px]' : 'w-6 h-6 text-xs'
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

          {/* 음력 날짜 표기 */}
          {lunar && !compact && (
            <span
              className={`text-[9px] sm:text-[10px] tracking-tight shrink-0 font-medium ${
                item.isCurrentMonth ? 'text-purple-600' : 'text-purple-300'
              }`}
              title={lunar.fullText}
            >
              (<span className="hidden sm:inline">음 </span>{lunar.text})
            </span>
          )}

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
                getGoogleCategoryColor(s.categoryId, s.isInProgress && !s.isCompleted).bg
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
            const color = getGoogleCategoryColor(
              schedule.categoryId,
              schedule.isInProgress && !schedule.isCompleted
            );
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
                title={`${schedule.title} (${schedule.dueTime || '종일'}${schedule.isInProgress && !schedule.isCompleted ? ' · 진행중' : ''})`}
              >
                <span className="truncate flex items-center gap-1">
                  {schedule.isInProgress && !schedule.isCompleted && (
                    <span className="px-1 py-0.2 rounded-xs bg-blue-100 text-blue-700 text-[9px] font-bold shrink-0">
                      진행
                    </span>
                  )}
                  {schedule.sourceType === 'subcheck' && (
                    <span className="text-[9px] font-bold text-emerald-800 shrink-0">
                      ↳
                    </span>
                  )}
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
};
