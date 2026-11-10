import React from 'react';
import { CategoryPanel } from '../panels/CategoryPanel';
import { GoogleCalendarHeader } from './GoogleCalendarHeader';
import { GoogleCalendarMonthView } from './GoogleCalendarMonthView';
import { CalendarSideViewType } from './GoogleCalendarRightPanel';
import { CalendarScheduleItem } from '../../types';

interface GoogleCalendarDesktopViewProps {
  isSidebarOpen: boolean;
  headerTitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  currentDateObj: Date;
  selectedCalendarDate: string;
  filteredItems: CalendarScheduleItem[];
  sideViewType: CalendarSideViewType;
  onSideViewTypeChange: (type: CalendarSideViewType) => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: (isOpen: boolean) => void;
  setDateByString: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onCellClick: (date: string, time?: string, isAllDay?: boolean) => void;
  draggedItem: CalendarScheduleItem | null;
  onDragStart: (item: CalendarScheduleItem, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnDate: (dateStr: string) => void;
  onDropOnTime: (dateStr: string, timeStr: string) => void;
  onDropAllDay: (dateStr: string) => void;
  onDragEnd: () => void;
  onContextMenu: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

export const GoogleCalendarDesktopView: React.FC<GoogleCalendarDesktopViewProps> = ({
  isSidebarOpen,
  headerTitle,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onPrev,
  onNext,
  onToday,
  currentDateObj,
  selectedCalendarDate,
  filteredItems,
  sideViewType,
  onSideViewTypeChange,
  isRightPanelOpen,
  onToggleRightPanel,
  setDateByString,
  onSelectItem,
  onCellClick,
  draggedItem,
  onDragStart,
  onDragOver,
  onDropOnDate,
  onDropOnTime,
  onDropAllDay,
  onDragEnd,
  onContextMenu,
}) => {
  return (
    <div className="hidden lg:flex flex-1 overflow-hidden">
      {isSidebarOpen && (
        <aside className="w-[331px] shrink-0 h-full border-r border-[#dadce0] overflow-hidden bg-white">
          <CategoryPanel showMiniCalendar />
        </aside>
      )}

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white">
        <GoogleCalendarHeader
          onToggleSidebar={onToggleSidebar}
          title={headerTitle}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          <GoogleCalendarMonthView
            currentDateObj={currentDateObj}
            selectedDate={selectedCalendarDate}
            items={filteredItems}
            sideViewType={sideViewType}
            onSideViewTypeChange={onSideViewTypeChange}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={onToggleRightPanel}
            onSelectDate={setDateByString}
            onSelectItem={onSelectItem}
            onCellClick={onCellClick}
            draggedItem={draggedItem}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDropOnDate={onDropOnDate}
            onDropOnTime={onDropOnTime}
            onDropAllDay={onDropAllDay}
            onDragEnd={onDragEnd}
            onContextMenu={onContextMenu}
            onPrevMonth={onPrev}
            onNextMonth={onNext}
          />
        </div>
      </main>
    </div>
  );
};
