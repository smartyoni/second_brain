import React, { useState } from 'react';
import { CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { GoogleCalendarRightPanel, CalendarSideViewType } from './GoogleCalendarRightPanel';
import { Calendar as CalendarIcon } from 'lucide-react';

interface GoogleCalendarMonthViewProps {
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  draggedItem: CalendarScheduleItem | null;
  sideViewType?: CalendarSideViewType;
  onSideViewTypeChange?: (type: CalendarSideViewType) => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: (isOpen: boolean) => void;
  onSelectDate: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onCellClick: (dateStr: string, time?: string, isAllDay?: boolean) => void;
  onDragStart: (item: CalendarScheduleItem, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnDate: (dateStr: string) => void;
  onDropOnTime?: (targetDate: string, targetTime: string) => void;
  onDropAllDay?: (targetDate: string) => void;
  onDragEnd: () => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const GoogleCalendarMonthView: React.FC<GoogleCalendarMonthViewProps> = ({
  currentDateObj,
  selectedDate,
  items,
  draggedItem,
  sideViewType: controlledSideViewType,
  onSideViewTypeChange: controlledOnSideViewTypeChange,
  isRightPanelOpen: controlledIsRightPanelOpen,
  onToggleRightPanel: controlledOnToggleRightPanel,
  onSelectDate,
  onSelectItem,
  onCellClick,
  onDragStart,
  onDragOver,
  onDropOnDate,
  onDropOnTime,
  onDropAllDay,
  onDragEnd,
  onContextMenu,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(true);
  const [internalSideViewType, setInternalSideViewType] = useState<CalendarSideViewType>('day');

  const isSideOpen = controlledIsRightPanelOpen !== undefined ? controlledIsRightPanelOpen : internalIsOpen;
  const setIsSideOpen = (open: boolean) => {
    if (controlledOnToggleRightPanel) {
      controlledOnToggleRightPanel(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const sideView = controlledSideViewType !== undefined ? controlledSideViewType : internalSideViewType;
  const setSideView = (type: CalendarSideViewType) => {
    if (controlledOnSideViewTypeChange) {
      controlledOnSideViewTypeChange(type);
    } else {
      setInternalSideViewType(type);
    }
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

  return (
    <div className="flex-1 flex flex-row h-full bg-white overflow-hidden select-none">
      {/* 1. 좌측 메인: 월간 캘린더 그리드 */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
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
            gridTemplateRows: `repeat(${totalWeeks}, minmax(105px, 1fr))`,
          }}
        >
          {days.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            const dayItems = itemsByDate.get(item.dateStr) || [];
            const isFirstDayOfMonth = item.dayNum === 1;

            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectDate(item.dateStr);
                  setIsSideOpen(true);
                }}
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
                className={`flex flex-col border-r border-b border-[#dadce0] p-1.5 transition-colors cursor-pointer min-h-[105px] overflow-hidden ${
                  isSelected ? 'bg-[#e8f0fe]/60 ring-2 ring-inset ring-[#1a73e8]' : 'hover:bg-[#f8f9fa]'
                }`}
              >
                {/* 날짜 헤더 */}
                <div className="flex items-center justify-between px-1 mb-1 shrink-0 h-6">
                  <span
                    className={`inline-flex items-center justify-center rounded-full text-xs transition-colors ${
                      isToday
                        ? 'w-6 h-6 bg-[#1a73e8] text-white font-bold'
                        : isFirstDayOfMonth
                        ? 'font-medium text-[#3c4043] px-1.5'
                        : item.isCurrentMonth
                        ? 'w-6 h-6 text-[#3c4043] font-normal'
                        : 'w-6 h-6 text-[#70757a] font-normal'
                    }`}
                  >
                    {isFirstDayOfMonth ? `${item.monthNum}월 1일` : item.dayNum}
                  </span>

                  {dayItems.length > 0 && (
                    <span className="text-[10px] text-[#70757a] font-medium bg-[#f1f3f4] px-1.5 py-0.2 rounded-full">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* 일정 목록 (드래그 가능) */}
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {dayItems.slice(0, 4).map((schedule) => {
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
                        className={`w-full rounded-xs px-1.5 py-0.5 text-[11px] font-semibold flex items-center transition-all cursor-grab active:cursor-grabbing truncate border border-slate-200/80 border-l-[3px] ${color.border} ${color.lightBg} text-slate-900 hover:brightness-95 hover:shadow-2xs ${
                          schedule.isCompleted ? 'line-through opacity-50 text-slate-500' : ''
                        } ${
                          isBeingDragged ? 'opacity-30 border-2 border-dashed border-blue-500' : ''
                        }`}
                        title={`${schedule.title} (${schedule.dueTime || '종일'}) - 드래그하여 날짜 이동`}
                      >
                        <span className="truncate">{schedule.title}</span>
                      </div>
                    );
                  })}

                  {dayItems.length > 4 && (
                    <div className="px-1.5 text-[10px] font-medium text-[#70757a] hover:bg-[#f1f3f4] rounded-xs cursor-pointer truncate mt-0.5">
                      +{dayItems.length - 4}개 더보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 우측: 일간 / 3일 / 주간 / 일정 뷰 사이드 패널 */}
      {isSideOpen ? (
        <GoogleCalendarRightPanel
          sideViewType={sideView}
          onSideViewTypeChange={setSideView}
          currentDateObj={currentDateObj}
          selectedDate={selectedDate}
          items={items}
          onSelectDate={onSelectDate}
          onSelectItem={onSelectItem}
          onCellClick={(dateStr, time, isAllDay) => onCellClick(dateStr, time, isAllDay)}
          draggedItem={draggedItem}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDropOnTime={onDropOnTime || (() => {})}
          onDropAllDay={onDropAllDay || (() => {})}
          onDragEnd={onDragEnd}
          onContextMenu={onContextMenu}
          onClose={() => setIsSideOpen(false)}
        />
      ) : (
        <div
          onClick={() => setIsSideOpen(true)}
          className="w-10 shrink-0 border-l border-[#dadce0] bg-[#fafafa] hover:bg-[#e8f0fe] transition-colors flex flex-col items-center pt-4 cursor-pointer text-[#5f6368] hover:text-[#1a73e8]"
          title="일정 뷰 패널 열기"
        >
          <CalendarIcon className="w-4 h-4 mb-3" />
          <span className="text-[11px] font-medium [writing-mode:vertical-rl] tracking-widest select-none">
            일정 뷰 열기
          </span>
        </div>
      )}
    </div>
  );
};
