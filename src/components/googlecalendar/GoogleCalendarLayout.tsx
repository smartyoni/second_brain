import React, { useState } from 'react';
import { useFullCalendar } from '../../hooks/useFullCalendar';
import { useCalendarDragDrop } from '../../hooks/useCalendarDragDrop';
import { GoogleCalendarHeader } from './GoogleCalendarHeader';
import { GoogleCalendarSidebar } from './GoogleCalendarSidebar';
import { GoogleCalendarMonthView } from './GoogleCalendarMonthView';
import { GoogleCalendarWeekView } from './GoogleCalendarWeekView';
import { GoogleCalendarThreeDayView } from './GoogleCalendarThreeDayView';
import { GoogleCalendarDayView } from './GoogleCalendarDayView';
import { GoogleCalendarScheduleView } from './GoogleCalendarScheduleView';
import { GoogleCalendarEventDialog } from './GoogleCalendarEventDialog';
import {
  GoogleCalendarQuickCreateModal,
  QuickCreateState,
} from './GoogleCalendarQuickCreateModal';
import { useWorkspace } from '../../context/WorkspaceContext';

export const GoogleCalendarLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 구글 캘린더 빠른 일정 생성 팝오버 상태
  const [quickCreateState, setQuickCreateState] = useState<QuickCreateState>({
    isOpen: false,
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    isAllDay: false,
  });

  const {
    viewType,
    setViewType,
    currentDateObj,
    currentYear,
    currentMonth,
    selectedCalendarDate,
    allItems,
    filteredItems,
    selectedCategoryIds,
    toggleCategoryFilter,
    selectAllCategories,
    showCompleted,
    setShowCompleted,
    searchQuery,
    setSearchQuery,
    selectedScheduleItem,
    setSelectedScheduleItem,
    goToPrev,
    goToNext,
    goToToday,
    setDateByString,
    toggleCheckItemCompleted,
    handleJumpToSource,
    categoryItems,
    setAppMode,
  } = useFullCalendar();

  const {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDropOnDate,
    handleDropOnTime,
    handleDropAllDay,
    handleDragEnd,
  } = useCalendarDragDrop();

  const { subItems } = useWorkspace();

  let headerTitle = '';
  if (viewType === 'month') {
    headerTitle = `${currentYear}년 ${currentMonth + 1}월`;
  } else if (viewType === 'week') {
    const dayOfWeek = currentDateObj.getDay();
    const sunday = new Date(currentDateObj);
    sunday.setDate(sunday.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6);
    headerTitle = `${sunday.getMonth() + 1}월 ${sunday.getDate()}일 ~ ${saturday.getMonth() + 1}월 ${saturday.getDate()}일`;
  } else if (viewType === 'threeDay') {
    const endObj = new Date(currentDateObj);
    endObj.setDate(endObj.getDate() + 2);
    headerTitle = `${currentDateObj.getMonth() + 1}월 ${currentDateObj.getDate()}일 ~ ${endObj.getMonth() + 1}월 ${endObj.getDate()}일`;
  } else if (viewType === 'schedule') {
    const dates = filteredItems.map((i) => i.dueDate).filter(Boolean).sort();
    if (dates.length > 0) {
      const minDate = new Date(dates[0]);
      const maxDate = new Date(dates[dates.length - 1]);
      if (!isNaN(minDate.getTime()) && !isNaN(maxDate.getTime())) {
        const minStr = `${minDate.getFullYear()}년 ${minDate.getMonth() + 1}월`;
        const maxStr = `${maxDate.getFullYear()}년 ${maxDate.getMonth() + 1}월`;
        headerTitle = minStr === maxStr ? minStr : `${minStr} ~ ${maxStr}`;
      } else {
        headerTitle = `${currentYear}년 ${currentMonth + 1}월`;
      }
    } else {
      headerTitle = `${currentYear}년 ${currentMonth + 1}월`;
    }
  } else {
    headerTitle = !isNaN(currentDateObj.getTime())
      ? currentDateObj.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      : selectedCalendarDate;
  }

  const selectedCategory = selectedScheduleItem
    ? categoryItems.find((c) => c.id === selectedScheduleItem.categoryId)
    : undefined;

  const selectedSubItem = selectedScheduleItem
    ? subItems.find((s) => s.id === selectedScheduleItem.subItemId)
    : undefined;

  const handleOpenQuickCreate = (date: string, time?: string, isAllDay = false) => {
    setQuickCreateState({
      isOpen: true,
      date,
      time: time || '10:00',
      isAllDay,
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white select-none">
      {/* 1. 상단 글로벌 앱 헤더 (세그먼트 탭 [ 월 | 주 | 3일 | 일 ] 포함) */}
      <GoogleCalendarHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        viewType={viewType}
        onViewTypeChange={setViewType}
        title={headerTitle}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBackToWorkspace={() => setAppMode('workspace')}
      />

      {/* 2. 본문 영역 */}
      <div className="flex-1 flex overflow-hidden">
        <GoogleCalendarSidebar
          isOpen={isSidebarOpen}
          currentDateObj={currentDateObj}
          selectedDate={selectedCalendarDate}
          onSelectDate={setDateByString}
          allItems={allItems}
          categoryItems={categoryItems}
          selectedCategoryIds={selectedCategoryIds}
          onToggleCategoryFilter={toggleCategoryFilter}
          onSelectAllCategories={selectAllCategories}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
          onOpenCreateModal={() =>
            handleOpenQuickCreate(selectedCalendarDate, '10:00', false)
          }
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {viewType === 'month' && (
            <GoogleCalendarMonthView
              currentDateObj={currentDateObj}
              selectedDate={selectedCalendarDate}
              items={filteredItems}
              onSelectDate={setDateByString}
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
              items={filteredItems}
              onSelectDate={setDateByString}
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
              items={filteredItems}
              onSelectDate={setDateByString}
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
              items={filteredItems}
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
              items={filteredItems}
              selectedDate={selectedCalendarDate}
              onSelectDate={setDateByString}
              onSelectItem={setSelectedScheduleItem}
              onCellClick={(date) => handleOpenQuickCreate(date, '10:00', true)}
            />
          )}
        </main>
      </div>

      {/* 3. 일정 상세 팝오버 다이얼로그 */}
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
          onJumpToSource={() => handleJumpToSource(selectedScheduleItem)}
        />
      )}

      {/* 4. 구글 캘린더 빠른 일정 생성 팝오버 */}
      <GoogleCalendarQuickCreateModal
        createState={quickCreateState}
        onClose={() =>
          setQuickCreateState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};
