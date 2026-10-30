import React, { useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  CalendarDays,
  CalendarRange,
  Clock,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { GoogleCalendarDayView } from './GoogleCalendarDayView';
import { GoogleCalendarThreeDayView } from './GoogleCalendarThreeDayView';
import { GoogleCalendarWeekView } from './GoogleCalendarWeekView';
import { GoogleCalendarScheduleView } from './GoogleCalendarScheduleView';
import {
  shiftDateBySideView,
  getSidePanelDateLabel,
} from '../../utils/googleCalendarUtils';

export type CalendarSideViewType = 'day' | 'threeDay' | 'week' | 'schedule';

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
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formattedDate = getSidePanelDateLabel(sideViewType, currentDateObj, selectedDate);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  const handlePrev = () => {
    onSelectDate(shiftDateBySideView(selectedDate, sideViewType, 'prev'));
  };

  const handleNext = () => {
    onSelectDate(shiftDateBySideView(selectedDate, sideViewType, 'next'));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
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
      {/* 1. 상단 컨트롤 바 */}
      <div className="p-3 border-b border-[#dadce0] bg-[#fafafa] flex flex-col gap-2 shrink-0">
        {/* 상단 날짜 네비게이션 및 닫기 */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-full hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer shrink-0"
              title="이전 날짜 이동"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="relative flex items-center gap-1.5 px-1.5 py-0.5 rounded-md hover:bg-[#e8eaed] text-xs text-[#3c4043] font-semibold cursor-pointer truncate"
              title="클릭하여 날짜 직접 선택"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
              <span className="truncate">{formattedDate}</span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                className="sr-only"
              />
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer shrink-0"
              title="다음 날짜 이동"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors cursor-pointer shrink-0 ${
                isToday
                  ? 'bg-[#1a73e8] text-white'
                  : 'bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
              }`}
              title="오늘 날짜로 이동"
            >
              오늘
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onCellClick(selectedDate, '10:00', false)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
              title="새 일정 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>일정 추가</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors cursor-pointer"
              title="패널 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 서브 뷰 전환 세그먼트 탭 [ 일 | 3일 | 주 | 일정 ] */}
        <div className="grid grid-cols-4 bg-[#f1f3f4] border border-[#dadce0] p-0.5 rounded-lg text-xs font-medium text-center">
          {(
            [
              { id: 'day', label: '일', Icon: Clock },
              { id: 'threeDay', label: '3일', Icon: CalendarDays },
              { id: 'week', label: '주', Icon: CalendarRange },
              { id: 'schedule', label: '일정', Icon: List },
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

        {sideViewType === 'threeDay' && (
          <GoogleCalendarThreeDayView
            currentDateObj={currentDateObj}
            selectedDate={selectedDate}
            items={items}
            onSelectDate={onSelectDate}
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

        {sideViewType === 'week' && (
          <GoogleCalendarWeekView
            currentDateObj={currentDateObj}
            selectedDate={selectedDate}
            items={items}
            onSelectDate={onSelectDate}
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
