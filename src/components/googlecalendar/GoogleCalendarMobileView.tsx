import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { CalendarScheduleItem, TopCategory } from '../../types';
import { isItemOnDate } from '../../utils/calendarUtils';
import { shiftDateBySideView } from '../../utils/googleCalendarUtils';
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
  const [agendaStage, setAgendaStage] = useState<'closed' | 'half' | 'week'>('closed');

  const isAgendaOpen = agendaStage !== 'closed';
  const isWeekOnly = agendaStage === 'week';

  const handleSwipeUp = () => {
    setAgendaStage((prev) => (prev === 'closed' ? 'half' : 'week'));
  };

  const handleSwipeDown = () => {
    setAgendaStage((prev) => (prev === 'week' ? 'half' : 'closed'));
  };

  const handlePrevDay = () => {
    onSelectDate(shiftDateBySideView(selectedDate, 'day', 'prev'));
  };

  const handleNextDay = () => {
    onSelectDate(shiftDateBySideView(selectedDate, 'day', 'next'));
  };

  const handleDateClickMobile = (dateStr: string) => {
    onSelectDate(dateStr);
    // 날짜 선택 시 자동으로 접히지 않고 선택 날짜만 갱신 (상/하 스와이프로 접고 펼침)
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-white">
      {/* 1. 패널 본문 영역 */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* 패널 A: 월간 달력 (3단계 접이식 아젠다 분할 뷰: closed -> half -> week) */}
        {mobilePanel === 'month' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            {/* 상단 월간 달력 (closed: 100%, half: 32%, week: 선택 주 1줄만 표시) */}
            <div
              className={`w-full overflow-hidden transition-all duration-200 flex flex-col ${
                agendaStage === 'week'
                  ? 'h-auto shrink-0 border-b border-[#dadce0]'
                  : agendaStage === 'half'
                  ? 'h-[32%] border-b border-[#dadce0]'
                  : 'h-full'
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
                onPrevMonth={isAgendaOpen ? handlePrevDay : onPrevMonth}
                onNextMonth={isAgendaOpen ? handleNextDay : onNextMonth}
                onSwipeUp={handleSwipeUp}
                onSwipeDown={handleSwipeDown}
                compact={isAgendaOpen}
                weekOnly={isWeekOnly}
              />

              {/* 월간 전체화면일 때 하단 스와이프/탭 힌트 바 */}
              {!isAgendaOpen && (
                <button
                  type="button"
                  onClick={() => setAgendaStage('half')}
                  className="w-full py-1 bg-[#f8f9fa] border-t border-[#dadce0] flex items-center justify-center gap-1 text-[11px] text-[#5f6368] hover:bg-[#e8eaed] active:bg-[#dadce0] transition-colors shrink-0 cursor-pointer"
                  title="위로 스와이프하거나 탭하여 당일 일정 보기"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>위로 올려 당일 일정 보기</span>
                </button>
              )}
            </div>

            {/* 하단 당일 일정 아젠다 시트 (half: 68%, week: 주간 1줄 제외한 나머지 전체) */}
            {isAgendaOpen && (
              <div
                className={`flex-1 w-full overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-200 ${
                  agendaStage === 'week' ? 'min-h-0' : 'h-[68%]'
                }`}
              >
                <GoogleCalendarMonthDayAgenda
                  selectedDate={selectedDate}
                  items={items.filter((i) => isItemOnDate(i, selectedDate))}
                  onSelectItem={onSelectItem}
                  onAddEvent={(dateStr) => onCellClick(dateStr)}
                  onPrevDay={handlePrevDay}
                  onNextDay={handleNextDay}
                  onSwipeUp={handleSwipeUp}
                  onClose={handleSwipeDown}
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
