import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FullCalendarViewType } from '../../hooks/useFullCalendar';
import { useCalendarDragDrop } from '../../hooks/useCalendarDragDrop';
import { CalendarPanelHeader } from './CalendarPanelHeader';
import { GoogleCalendarMonthView } from '../googlecalendar/GoogleCalendarMonthView';
import { GoogleCalendarWeekView } from '../googlecalendar/GoogleCalendarWeekView';
import { GoogleCalendarThreeDayView } from '../googlecalendar/GoogleCalendarThreeDayView';
import { GoogleCalendarDayView } from '../googlecalendar/GoogleCalendarDayView';
import { GoogleCalendarScheduleView } from '../googlecalendar/GoogleCalendarScheduleView';
import { GoogleCalendarEventDialog } from '../googlecalendar/GoogleCalendarEventDialog';
import {
  GoogleCalendarQuickCreateModal,
  QuickCreateState,
} from '../googlecalendar/GoogleCalendarQuickCreateModal';
import { CalendarScheduleItem } from '../../types';

export const CalendarPanel: React.FC = () => {
  const {
    selectedCalendarDate,
    setSelectedCalendarDate,
    getAllScheduleItems,
    toggleCheckItemCompleted,
    jumpToSourceItem,
    subItems,
    categoryItems,
    panel3State,
  } = useWorkspace();

  // 기본 뷰는 '일간(day)'
  const [viewType, setViewType] = useState<FullCalendarViewType>('day');
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<CalendarScheduleItem | null>(null);

  // 구글 캘린더 빠른 일정 생성 팝오버 상태
  const [quickCreateState, setQuickCreateState] = useState<QuickCreateState>({
    isOpen: false,
    date: selectedCalendarDate,
    time: '10:00',
    isAllDay: false,
  });

  const {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDropOnDate,
    handleDropOnTime,
    handleDropAllDay,
    handleDragEnd,
  } = useCalendarDragDrop();

  // 3번 패널에서 현재 선택된 하위 항목(문서)
  const currentSubItem = subItems.find((s) => s.id === panel3State.subItemId);

  // 3번 패널의 선택 항목에 속한 일정 필터링
  const allScheduleList = getAllScheduleItems();
  const allItems = currentSubItem
    ? allScheduleList.filter((item) => item.subItemId === currentSubItem.id)
    : allScheduleList;

  // 날짜 계산
  const currentDateObj = new Date(selectedCalendarDate);
  const isValidDate = !isNaN(currentDateObj.getTime());
  const currentYear = isValidDate ? currentDateObj.getFullYear() : new Date().getFullYear();
  const currentMonth = isValidDate ? currentDateObj.getMonth() : new Date().getMonth();

  let headerTitle = '';
  if (viewType === 'month') {
    headerTitle = `${currentYear}년 ${currentMonth + 1}월`;
  } else if (viewType === 'week') {
    const dayOfWeek = currentDateObj.getDay();
    const sunday = new Date(currentDateObj);
    sunday.setDate(sunday.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6);
    headerTitle = `${sunday.getMonth() + 1}.${sunday.getDate()} ~ ${saturday.getMonth() + 1}.${saturday.getDate()}`;
  } else if (viewType === 'threeDay') {
    const endObj = new Date(currentDateObj);
    endObj.setDate(endObj.getDate() + 2);
    headerTitle = `${currentDateObj.getMonth() + 1}.${currentDateObj.getDate()} ~ ${endObj.getMonth() + 1}.${endObj.getDate()}`;
  } else if (viewType === 'schedule') {
    const dates = allItems.map((i) => i.dueDate).filter(Boolean).sort();
    if (dates.length > 0) {
      const minDate = new Date(dates[0]);
      const maxDate = new Date(dates[dates.length - 1]);
      if (!isNaN(minDate.getTime()) && !isNaN(maxDate.getTime())) {
        const minStr = `${minDate.getFullYear()}.${minDate.getMonth() + 1}`;
        const maxStr = `${maxDate.getFullYear()}.${maxDate.getMonth() + 1}`;
        headerTitle = minStr === maxStr ? minStr : `${minStr} ~ ${maxStr}`;
      } else {
        headerTitle = `${currentYear}.${currentMonth + 1}`;
      }
    } else {
      headerTitle = `${currentYear}.${currentMonth + 1}`;
    }
  } else {
    headerTitle = isValidDate
      ? currentDateObj.toLocaleDateString('ko-KR', {
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      : selectedCalendarDate;
  }

  // 이전/다음 이동 핸들러
  const handlePrev = () => {
    const d = new Date(currentDateObj);
    if (viewType === 'month' || viewType === 'schedule') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewType === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewType === 'threeDay') {
      d.setDate(d.getDate() - 3);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedCalendarDate(d.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const d = new Date(currentDateObj);
    if (viewType === 'month' || viewType === 'schedule') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewType === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewType === 'threeDay') {
      d.setDate(d.getDate() + 3);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedCalendarDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedCalendarDate(new Date().toISOString().slice(0, 10));
  };

  const handleOpenQuickCreate = (date: string, time?: string, isAllDay = false) => {
    setQuickCreateState({
      isOpen: true,
      date,
      time: time || '10:00',
      isAllDay,
    });
  };

  const selectedCategory = selectedScheduleItem
    ? categoryItems.find((c) => c.id === selectedScheduleItem.categoryId)
    : undefined;

  const selectedSubItem = selectedScheduleItem
    ? subItems.find((s) => s.id === selectedScheduleItem.subItemId)
    : undefined;

  return (
    <div className="flex flex-col h-full bg-white select-none border-l border-slate-300 overflow-hidden">
      {/* 1. 상단 인디케이터 + 구글 캘린더 세그먼트 헤더 */}
      <CalendarPanelHeader
        currentSubItem={currentSubItem}
        eventsCount={allItems.length}
        viewType={viewType}
        onViewTypeChange={setViewType}
        headerTitle={headerTitle}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* 2. 본문 뷰 (통합캘린더와 동일한 구글 캘린더 뷰 컴포넌트) */}
      <div className="flex-1 overflow-hidden relative">
        {viewType === 'month' && (
          <GoogleCalendarMonthView
            currentDateObj={currentDateObj}
            selectedDate={selectedCalendarDate}
            items={allItems}
            onSelectDate={setSelectedCalendarDate}
            onSelectItem={setSelectedScheduleItem}
            onCellClick={(date) => handleOpenQuickCreate(date, '10:00', true)}
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDropOnDate={handleDropOnDate}
            onDragEnd={handleDragEnd}
          />
        )}

        {viewType === 'week' && (
          <GoogleCalendarWeekView
            currentDateObj={currentDateObj}
            selectedDate={selectedCalendarDate}
            items={allItems}
            onSelectDate={setSelectedCalendarDate}
            onSelectItem={setSelectedScheduleItem}
            onCellClick={(date, time, isAllDay) =>
              handleOpenQuickCreate(date, time, isAllDay || false)
            }
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDropOnTime={handleDropOnTime}
            onDropAllDay={handleDropAllDay}
            onDragEnd={handleDragEnd}
          />
        )}

        {viewType === 'threeDay' && (
          <GoogleCalendarThreeDayView
            currentDateObj={currentDateObj}
            selectedDate={selectedCalendarDate}
            items={allItems}
            onSelectDate={setSelectedCalendarDate}
            onSelectItem={setSelectedScheduleItem}
            onCellClick={(date, time, isAllDay) =>
              handleOpenQuickCreate(date, time, isAllDay || false)
            }
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDropOnTime={handleDropOnTime}
            onDropAllDay={handleDropAllDay}
            onDragEnd={handleDragEnd}
          />
        )}

        {viewType === 'day' && (
          <GoogleCalendarDayView
            selectedDate={selectedCalendarDate}
            items={allItems}
            onSelectItem={setSelectedScheduleItem}
            onCellClick={(date, time, isAllDay) =>
              handleOpenQuickCreate(date, time, isAllDay || false)
            }
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDropOnTime={handleDropOnTime}
            onDropAllDay={handleDropAllDay}
            onDragEnd={handleDragEnd}
          />
        )}

        {viewType === 'schedule' && (
          <GoogleCalendarScheduleView
            items={allItems}
            selectedDate={selectedCalendarDate}
            onSelectDate={setSelectedCalendarDate}
            onSelectItem={setSelectedScheduleItem}
            onCellClick={(date) => handleOpenQuickCreate(date, '10:00', true)}
          />
        )}
      </div>

      {/* 3. 일정 상세 다이얼로그 (구글 캘린더 다이얼로그) */}
      {selectedScheduleItem && (
        <GoogleCalendarEventDialog
          item={selectedScheduleItem}
          category={selectedCategory}
          subItem={selectedSubItem}
          onClose={() => setSelectedScheduleItem(null)}
          onToggleComplete={() =>
            toggleCheckItemCompleted(
              selectedScheduleItem.groupId || '',
              selectedScheduleItem.id
            )
          }
          onJumpToSource={() => jumpToSourceItem(selectedScheduleItem)}
        />
      )}

      {/* 4. 빠른 일정 생성 팝오버 (구글 캘린더 모달) */}
      <GoogleCalendarQuickCreateModal
        createState={quickCreateState}
        onClose={() =>
          setQuickCreateState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};
