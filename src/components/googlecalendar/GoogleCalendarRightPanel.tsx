import React, { useRef } from 'react';
import {
  ShoppingBag,
  ListTodo,
  Clock,
  List,
} from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { GoogleCalendarDayView } from './GoogleCalendarDayView';
import { GoogleCalendarShoppingView } from './GoogleCalendarShoppingView';
import { GoogleCalendarScheduleView } from './GoogleCalendarScheduleView';
import { GoogleCalendarTodoView } from './GoogleCalendarTodoView';
import { GoogleCalendarRightPanelHeader } from './GoogleCalendarRightPanelHeader';
import {
  shiftDateBySideView,
  getSidePanelDateLabel,
  getTodayDateStr,
} from '../../utils/googleCalendarUtils';

export type CalendarSideViewType = 'day' | 'shopping' | 'todo' | 'schedule';

interface GoogleCalendarRightPanelProps {
  sideViewType: CalendarSideViewType;
  onSideViewTypeChange: (type: CalendarSideViewType) => void;
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
  onClose: () => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

export const GoogleCalendarRightPanel: React.FC<GoogleCalendarRightPanelProps> = ({
  sideViewType,
  onSideViewTypeChange,
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
  onClose,
  onContextMenu,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const formattedDate = getSidePanelDateLabel(sideViewType, currentDateObj, selectedDate);
  const todayStr = getTodayDateStr();
  const isToday = selectedDate === todayStr;
  const todoInProgressCount = items.filter((i) => !!i.isInProgress && !i.isCompleted).length;

  const handlePrev = () => {
    onSelectDate(shiftDateBySideView(selectedDate, sideViewType, 'prev'));
  };

  const handleNext = () => {
    onSelectDate(shiftDateBySideView(selectedDate, sideViewType, 'next'));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (sideViewType === 'todo' || sideViewType === 'shopping') return;
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (sideViewType === 'todo' || sideViewType === 'shopping') return;
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <aside className="w-full lg:w-[448px] shrink-0 bg-white border-l border-[#dadce0] flex flex-col h-full select-none shadow-sm z-10">
      {/* 1. 3번 패널 독립 헤더 (기존 최상단바가 독립 헤더로 승격) */}
      <GoogleCalendarRightPanelHeader
        sideViewType={sideViewType}
        formattedDate={formattedDate}
        selectedDate={selectedDate}
        isToday={isToday}
        onSelectDate={onSelectDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={() => onSelectDate(todayStr)}
        onAddSchedule={() => onCellClick(selectedDate, '10:00', false)}
        onClose={onClose}
        todoInProgressCount={todoInProgressCount}
      />

      {/* 2. 뷰 전환 세그먼트 탭: 최상단바가 헤더로 올라가 비어있는 상단 자리로 뷰전환바가 배치됨 */}
      <div className="hidden lg:block px-3 py-1.5 border-b border-[#dadce0] bg-[#fafafa] shrink-0">
        <div className="grid grid-cols-4 bg-[#f1f3f4] border border-[#dadce0] p-0.5 rounded-lg text-xs font-medium text-center">
          {(
            [
              { id: 'day', label: '일', Icon: Clock },
              { id: 'schedule', label: '일정', Icon: List },
              { id: 'shopping', label: '쇼핑', Icon: ShoppingBag },
              { id: 'todo', label: '진행중', Icon: ListTodo },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSideViewTypeChange(id)}
              className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                sideViewType === id
                  ? 'bg-white text-[#1a73e8] font-bold shadow-xs border border-[#dadce0]'
                  : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. 본문 서브 뷰 영역 (모바일 좌우 스와이프 날짜 이동 지원) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex flex-col h-full overflow-hidden bg-white"
      >
        {sideViewType === 'day' && (
          <GoogleCalendarDayView
            selectedDate={selectedDate}
            items={items}
            onSelectItem={onSelectItem}
            onCellClick={onCellClick}
            draggedItem={draggedItem}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDropOnTime={onDropOnTime}
            onDropAllDay={onDropAllDay}
            onDragEnd={onDragEnd}
            onContextMenu={onContextMenu}
          />
        )}

        {sideViewType === 'shopping' && <GoogleCalendarShoppingView />}

        {sideViewType === 'todo' && (
          <GoogleCalendarTodoView
            items={items}
            onSelectItem={onSelectItem}
            onContextMenu={onContextMenu}
            onCellClick={(dateStr) => onCellClick(dateStr, '10:00', false)}
          />
        )}

        {sideViewType === 'schedule' && (
          <GoogleCalendarScheduleView
            items={items}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onSelectItem={onSelectItem}
            onCellClick={(dateStr) => onCellClick(dateStr, '10:00', false)}
            onContextMenu={onContextMenu}
          />
        )}
      </div>
    </aside>
  );
};
