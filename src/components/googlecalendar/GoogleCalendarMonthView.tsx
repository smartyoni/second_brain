import React, { useState } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { CalendarSideViewType } from './GoogleCalendarRightPanel';
import { GoogleCalendarMonthGrid } from './GoogleCalendarMonthGrid';
import { GoogleCalendarMonthDayAgenda } from './GoogleCalendarMonthDayAgenda';
import { isItemOnDate } from '../../utils/calendarUtils';
import { shiftDateBySideView } from '../../utils/googleCalendarUtils';

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
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export const GoogleCalendarMonthView: React.FC<GoogleCalendarMonthViewProps> = ({
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
  onPrevMonth,
  onNextMonth,
}) => {
  // 모바일과 동일하게 3단계 접이식 아젠다 분할 뷰 ('closed' | 'half' | 'week')
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

  const handleSelectDate = (dateStr: string) => {
    onSelectDate(dateStr);
    // 날짜 선택 시 닫혀있었다면 반 접어서 아래에 당일 일정 표시
    if (agendaStage === 'closed') {
      setAgendaStage('half');
    }
  };

  const dayItems = items.filter((i) => isItemOnDate(i, selectedDate));

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-white select-none">
      {/* 1. 상단 월간 달력 (closed: 100%, half: 42%, week: 선택 주 1줄만 표시) */}
      <div
        className={`w-full overflow-hidden transition-all duration-200 flex flex-col ${
          agendaStage === 'week'
            ? 'h-auto shrink-0 border-b border-[#dadce0]'
            : agendaStage === 'half'
            ? 'h-[42%] border-b border-[#dadce0]'
            : 'h-full'
        }`}
      >
        <GoogleCalendarMonthGrid
          currentDateObj={currentDateObj}
          selectedDate={selectedDate}
          items={items}
          draggedItem={draggedItem}
          onSelectDate={handleSelectDate}
          onSelectItem={onSelectItem}
          onCellClick={onCellClick}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDropOnDate={onDropOnDate}
          onDragEnd={onDragEnd}
          onContextMenu={onContextMenu}
          onPrevMonth={isAgendaOpen ? handlePrevDay : onPrevMonth}
          onNextMonth={isAgendaOpen ? handleNextDay : onNextMonth}
          onSwipeUp={handleSwipeUp}
          onSwipeDown={handleSwipeDown}
          compact={isAgendaOpen}
          weekOnly={isWeekOnly}
        />

        {/* 월간 전체화면일 때 하단 당일 일정 보기 바 */}
        {!isAgendaOpen && (
          <button
            type="button"
            onClick={() => setAgendaStage('half')}
            className="w-full py-1.5 bg-[#f8f9fa] border-t border-[#dadce0] flex items-center justify-center gap-1.5 text-xs text-[#5f6368] hover:bg-[#e8eaed] active:bg-[#dadce0] transition-colors shrink-0 cursor-pointer"
            title="위로 올려 당일 일정 보기"
          >
            <ChevronUp className="w-4 h-4 text-[#1a73e8]" />
            <span className="font-medium text-[#3c4043]">위로 올려 당일 일정 보기</span>
          </button>
        )}
      </div>

      {/* 2. 하단 당일 일정 아젠다 시트 (half: 58%, week: 주간 1줄 제외한 나머지 전체) */}
      {isAgendaOpen && (
        <div
          className={`flex-1 w-full overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-200 flex flex-col ${
            agendaStage === 'week' ? 'min-h-0' : 'h-[58%]'
          }`}
        >
          {/* 웹용 접기/펼치기 제어 툴바 */}
          <div className="w-full bg-[#f8f9fa] border-b border-[#dadce0] px-4 py-1 flex items-center justify-between text-[11px] text-[#5f6368] shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#202124]">당일 상세 일정</span>
              <span className="text-[#dadce0]">|</span>
              <span className="text-[#1a73e8] font-medium">{selectedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAgendaStage((prev) => (prev === 'week' ? 'half' : 'week'))}
                className="px-2 py-0.5 rounded hover:bg-[#e8eaed] text-[11px] font-medium text-[#3c4043] transition-colors cursor-pointer flex items-center gap-1"
                title={isWeekOnly ? '달력 반 보기로 펼치기' : '주간 1줄만 남기고 일정 영역 확대'}
              >
                {isWeekOnly ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-[#1a73e8]" />
                    <span>달력 반 보기</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-[#1a73e8]" />
                    <span>달력 1줄만 보기</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAgendaStage('closed')}
                className="px-2 py-0.5 rounded hover:bg-[#fce8e6] text-[11px] font-medium text-[#d93025] transition-colors cursor-pointer flex items-center gap-1"
                title="일정 닫고 월간 전체 달력 보기"
              >
                <X className="w-3.5 h-3.5" />
                <span>닫기</span>
              </button>
            </div>
          </div>

          <GoogleCalendarMonthDayAgenda
            selectedDate={selectedDate}
            items={dayItems}
            onSelectItem={onSelectItem}
            onAddEvent={(dateStr) => onCellClick(dateStr)}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onSwipeUp={handleSwipeUp}
            onClose={() => setAgendaStage('closed')}
            className="w-full h-full flex flex-col select-none"
          />
        </div>
      )}
    </div>
  );
};
