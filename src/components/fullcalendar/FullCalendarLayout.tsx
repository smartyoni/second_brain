import React from 'react';
import { useFullCalendar } from '../../hooks/useFullCalendar';
import { FullCalendarSidebar } from './FullCalendarSidebar';
import { FullCalendarHeader } from './FullCalendarHeader';
import { FullCalendarMonthView } from './FullCalendarMonthView';
import { FullCalendarWeekView } from './FullCalendarWeekView';
import { FullCalendarDayView } from './FullCalendarDayView';
import { GoogleCalendarScheduleView } from '../googlecalendar/GoogleCalendarScheduleView';
import { FullCalendarSchedulePopover } from './FullCalendarSchedulePopover';
import { useWorkspace } from '../../context/WorkspaceContext';

export const FullCalendarLayout: React.FC = () => {
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

  const { subItems } = useWorkspace();

  // 헤더 타이틀 계산
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

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white select-none">
      {/* 1. 좌측 캘린더 사이드바 */}
      <FullCalendarSidebar
        onBackToWorkspace={() => setAppMode('workspace')}
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
      />

      {/* 2. 우측 캘린더 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        <FullCalendarHeader
          viewType={viewType}
          onViewTypeChange={setViewType}
          title={headerTitle}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredCount={filteredItems.length}
        />

        <div className="flex-1 overflow-hidden relative">
          {viewType === 'month' && (
            <FullCalendarMonthView
              currentDateObj={currentDateObj}
              selectedDate={selectedCalendarDate}
              items={filteredItems}
              onSelectDate={setDateByString}
              onSelectItem={setSelectedScheduleItem}
            />
          )}

          {viewType === 'week' && (
            <FullCalendarWeekView
              currentDateObj={currentDateObj}
              selectedDate={selectedCalendarDate}
              items={filteredItems}
              onSelectDate={setDateByString}
              onSelectItem={setSelectedScheduleItem}
            />
          )}

          {viewType === 'day' && (
            <FullCalendarDayView
              selectedDate={selectedCalendarDate}
              items={filteredItems}
              onSelectItem={setSelectedScheduleItem}
              onToggleComplete={toggleCheckItemCompleted}
            />
          )}

          {viewType === 'schedule' && (
            <GoogleCalendarScheduleView
              items={filteredItems}
              selectedDate={selectedCalendarDate}
              onSelectDate={setDateByString}
              onSelectItem={setSelectedScheduleItem}
            />
          )}
        </div>
      </main>

      {/* 3. 일정 상세 팝오버 */}
      {selectedScheduleItem && (
        <FullCalendarSchedulePopover
          item={selectedScheduleItem}
          category={selectedCategory}
          subItem={selectedSubItem}
          onClose={() => setSelectedScheduleItem(null)}
          onToggleComplete={() =>
            toggleCheckItemCompleted(
              selectedScheduleItem.groupId,
              selectedScheduleItem.id
            )
          }
          onJumpToSource={() => handleJumpToSource(selectedScheduleItem)}
        />
      )}
    </div>
  );
};
