import React from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  CalendarDays,
  CalendarRange,
  Clock,
  List,
} from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { GoogleCalendarDayView } from './GoogleCalendarDayView';
import { GoogleCalendarThreeDayView } from './GoogleCalendarThreeDayView';
import { GoogleCalendarWeekView } from './GoogleCalendarWeekView';
import { GoogleCalendarScheduleView } from './GoogleCalendarScheduleView';

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
  const dateObj = new Date(selectedDate);
  const isValid = !isNaN(dateObj.getTime());
  const formattedDate = isValid
    ? dateObj.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : selectedDate;

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  return (
    <aside className="w-[448px] shrink-0 bg-white border-l border-[#dadce0] flex flex-col h-full select-none shadow-sm z-10">
      {/* 1. 상단 컨트롤 바 */}
      <div className="p-3 border-b border-[#dadce0] bg-[#fafafa] flex flex-col gap-2 shrink-0">
        {/* 상단 타이틀 및 닫기 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#3c4043] font-semibold">
            <CalendarIcon className="w-4 h-4 text-[#1a73e8]" />
            <span>{formattedDate}</span>
            {isToday && (
              <span className="px-1.5 py-0.2 bg-[#1a73e8] text-white text-[10px] font-bold rounded-full">
                오늘
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
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
          <button
            type="button"
            onClick={() => onSideViewTypeChange('day')}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              sideViewType === 'day'
                ? 'bg-white text-[#1a73e8] font-bold shadow-xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>일</span>
          </button>
          <button
            type="button"
            onClick={() => onSideViewTypeChange('threeDay')}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              sideViewType === 'threeDay'
                ? 'bg-white text-[#1a73e8] font-bold shadow-xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
            }`}
          >
            <CalendarDays className="w-3 h-3" />
            <span>3일</span>
          </button>
          <button
            type="button"
            onClick={() => onSideViewTypeChange('week')}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              sideViewType === 'week'
                ? 'bg-white text-[#1a73e8] font-bold shadow-xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
            }`}
          >
            <CalendarRange className="w-3 h-3" />
            <span>주</span>
          </button>
          <button
            type="button"
            onClick={() => onSideViewTypeChange('schedule')}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              sideViewType === 'schedule'
                ? 'bg-white text-[#1a73e8] font-bold shadow-xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
            }`}
          >
            <List className="w-3 h-3" />
            <span>일정</span>
          </button>
        </div>
      </div>

      {/* 2. 본문 서브 뷰 영역 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
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
          <div className="flex-1 flex flex-col h-full overflow-x-auto overflow-y-hidden">
            <div className="min-w-[480px] flex-1 flex flex-col h-full">
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
            </div>
          </div>
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
