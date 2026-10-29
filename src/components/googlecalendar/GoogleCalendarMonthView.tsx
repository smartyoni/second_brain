import React, { useState } from 'react';
import { CalendarScheduleItem } from '../../types';
import { GoogleCalendarRightPanel, CalendarSideViewType } from './GoogleCalendarRightPanel';
import { GoogleCalendarMonthGrid } from './GoogleCalendarMonthGrid';
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

  return (
    <div className="flex-1 flex flex-row h-full bg-white overflow-hidden select-none">
      {/* 1. 좌측 메인: 월간 캘린더 그리드 */}
      <GoogleCalendarMonthGrid
        currentDateObj={currentDateObj}
        selectedDate={selectedDate}
        items={items}
        draggedItem={draggedItem}
        onSelectDate={(d) => {
          onSelectDate(d);
          setIsSideOpen(true);
        }}
        onSelectItem={onSelectItem}
        onCellClick={onCellClick}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDropOnDate={onDropOnDate}
        onDragEnd={onDragEnd}
        onContextMenu={onContextMenu}
      />

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
