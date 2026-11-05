import React, { useState } from 'react';
import { CalendarScheduleItem, TopCategory } from '../../types';
import { isItemOnDate } from '../../utils/calendarUtils';
import { CalendarMobilePanel, GoogleCalendarMobileNavBar } from './GoogleCalendarMobileNavBar';
import { GoogleCalendarMonthGrid } from './GoogleCalendarMonthGrid';
import { GoogleCalendarMonthDayAgenda } from './GoogleCalendarMonthDayAgenda';
import { GoogleCalendarRightPanel, CalendarSideViewType } from './GoogleCalendarRightPanel';
import { GoogleCalendarSidebar } from './GoogleCalendarSidebar';

interface GoogleCalendarMobileViewProps {
  mobilePanel: CalendarMobilePanel;
  onChangePanel: (panel: CalendarMobilePanel) => void;
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  draggedItem: CalendarScheduleItem | null;
  sideViewType: CalendarSideViewType;
  onSideViewTypeChange: (type: CalendarSideViewType) => void;
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
  allItems: CalendarScheduleItem[];
  topCategories: TopCategory[];
  selectedFilterKeys: string[];
  onToggleFilterKey: (key: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  onBackToWorkspace?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export const GoogleCalendarMobileView: React.FC<GoogleCalendarMobileViewProps> = ({
  mobilePanel,
  onChangePanel,
  currentDateObj,
  selectedDate,
  items,
  draggedItem,
  sideViewType,
  onSideViewTypeChange,
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
  allItems,
  topCategories,
  selectedFilterKeys,
  onToggleFilterKey,
  onSelectAll,
  onClearAll,
  showCompleted,
  onToggleShowCompleted,
  onBackToWorkspace,
  onPrevMonth,
  onNextMonth,
}) => {
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);

  const handleDateClickMobile = (dateStr: string) => {
    onSelectDate(dateStr);
    setIsAgendaOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-white">
      {/* 1. 패널 본문 영역 */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* 패널 A: 월간 달력 (접이식 아젠다 분할 뷰 지원) */}
        {mobilePanel === 'month' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            {/* 상단 월간 달력 (아젠다 열림 시 위로 접혀 45% 높이, 닫힘 시 100% 전체화면) */}
            <div
              className={`w-full overflow-hidden transition-all duration-200 flex flex-col ${
                isAgendaOpen ? 'h-[46%] border-b border-[#dadce0]' : 'h-full'
              }`}
            >
              <GoogleCalendarMonthGrid
                currentDateObj={currentDateObj}
                selectedDate={selectedDate}
                items={items}
                draggedItem={draggedItem}
                onSelectDate={onSelectDate}
                onSelectItem={onSelectItem}
                onCellClick={onCellClick}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDropOnDate={onDropOnDate}
                onDragEnd={onDragEnd}
                onContextMenu={onContextMenu}
                onDateClickMobile={handleDateClickMobile}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                compact={isAgendaOpen}
              />
            </div>

            {/* 하단 당일 일정 아젠다 시트 (isAgendaOpen일 때 54% 높이로 펼쳐짐) */}
            {isAgendaOpen && (
              <div className="flex-1 h-[54%] w-full overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-200">
                <GoogleCalendarMonthDayAgenda
                  selectedDate={selectedDate}
                  items={items.filter((i) => isItemOnDate(i, selectedDate))}
                  onSelectItem={onSelectItem}
                  onAddEvent={(dateStr) => onCellClick(dateStr)}
                  onClose={() => setIsAgendaOpen(false)}
                  className="w-full h-full flex flex-col select-none"
                />
              </div>
            )}
          </div>
        )}

        {/* 패널 B: 상세 일정 (일간/3일/주간/일정 뷰) */}
        {mobilePanel === 'detail' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <GoogleCalendarRightPanel
                sideViewType={sideViewType}
                onSideViewTypeChange={onSideViewTypeChange}
                currentDateObj={currentDateObj}
                selectedDate={selectedDate}
                items={items}
                onSelectDate={onSelectDate}
                onSelectItem={onSelectItem}
                onCellClick={onCellClick}
                draggedItem={draggedItem}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDropOnTime={onDropOnTime || (() => {})}
                onDropAllDay={onDropAllDay || (() => {})}
                onDragEnd={onDragEnd}
                onClose={() => onChangePanel('month')}
                onContextMenu={onContextMenu}
              />
            </div>
          </div>
        )}

        {/* 패널 C: 메뉴 & 필터 (미니 달력, 15칸 그리드, 지식보관소 이동) */}
        {mobilePanel === 'sidebar' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <GoogleCalendarSidebar
                isOpen={true}
                currentDateObj={currentDateObj}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  onSelectDate(d);
                  onChangePanel('detail');
                }}
                allItems={allItems}
                topCategories={topCategories}
                selectedFilterKeys={selectedFilterKeys}
                onToggleFilterKey={onToggleFilterKey}
                onSelectAll={onSelectAll}
                onClearAll={onClearAll}
                showCompleted={showCompleted}
                onToggleShowCompleted={onToggleShowCompleted}
                onBackToWorkspace={onBackToWorkspace}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. 모바일 5개 뷰 전환 바 (월간 / 일 / 3일 / 주 / 일정) */}
      <GoogleCalendarMobileNavBar
        activePanel={mobilePanel}
        sideViewType={sideViewType}
        onChangePanel={onChangePanel}
        onSideViewTypeChange={onSideViewTypeChange}
      />
    </div>
  );
};
