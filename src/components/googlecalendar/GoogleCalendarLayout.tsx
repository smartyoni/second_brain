import React, { useState } from 'react';
import { useFullCalendar, FullCalendarViewType } from '../../hooks/useFullCalendar';
import { useCalendarDragDrop } from '../../hooks/useCalendarDragDrop';
import { GoogleCalendarHeader } from './GoogleCalendarHeader';
import { GoogleCalendarSidebar } from './GoogleCalendarSidebar';
import { GoogleCalendarMonthView } from './GoogleCalendarMonthView';
import { CalendarSideViewType } from './GoogleCalendarRightPanel';
import { GoogleCalendarEventDialog } from './GoogleCalendarEventDialog';
import {
  GoogleCalendarQuickCreateModal,
  QuickCreateState,
} from './GoogleCalendarQuickCreateModal';
import {
  GoogleCalendarContextMenu,
  ContextMenuState,
} from './GoogleCalendarContextMenu';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CalendarScheduleItem } from '../../types';

export const GoogleCalendarLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sideViewType, setSideViewType] = useState<CalendarSideViewType>('day');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [initialEditDialogMode, setInitialEditDialogMode] = useState<boolean>(false);

  // 우클릭 컨텍스트 메뉴 상태
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  });

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
    selectedFilterKeys,
    toggleFilterKey,
    selectAll,
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
    topCategories,
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

  const { subItems, updateCalendarEvent, deleteCalendarEvent } = useWorkspace();

  const handleContextMenu = (item: CalendarScheduleItem, e: React.MouseEvent) => {
    setContextMenuState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleContextColorChange = (item: CalendarScheduleItem, colorId: string) => {
    if (item.sourceType === 'calendar') {
      updateCalendarEvent(item.id, { categoryId: colorId });
    }
  };

  const handleContextEdit = (item: CalendarScheduleItem) => {
    setInitialEditDialogMode(true);
    setSelectedScheduleItem(item);
  };

  const handleContextDelete = (item: CalendarScheduleItem) => {
    if (item.sourceType === 'calendar') {
      deleteCalendarEvent(item.id);
    }
  };

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

  const handleHeaderViewTypeChange = (type: FullCalendarViewType) => {
    if (type === 'month') {
      setIsRightPanelOpen(false);
      setViewType('month');
    } else {
      setIsRightPanelOpen(true);
      setSideViewType(type);
      setViewType(type);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white select-none">
      {/* 1. 상단 글로벌 앱 헤더 (세그먼트 탭 [ 월 | 주 | 3일 | 일 | 일정 ] 포함) */}
      <GoogleCalendarHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        viewType={viewType}
        onViewTypeChange={handleHeaderViewTypeChange}
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
          topCategories={topCategories}
          selectedFilterKeys={selectedFilterKeys}
          onToggleFilterKey={toggleFilterKey}
          onSelectAll={selectAll}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
          onOpenCreateModal={() =>
            handleOpenQuickCreate(selectedCalendarDate, '10:00', false)
          }
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <GoogleCalendarMonthView
            currentDateObj={currentDateObj}
            selectedDate={selectedCalendarDate}
            items={filteredItems}
            sideViewType={sideViewType}
            onSideViewTypeChange={(type) => {
              setSideViewType(type);
              setViewType(type);
            }}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={(isOpen) => {
              setIsRightPanelOpen(isOpen);
              if (!isOpen) {
                setViewType('month');
              } else {
                setViewType(sideViewType);
              }
            }}
            onSelectDate={setDateByString}
            onSelectItem={setSelectedScheduleItem}
            onCellClick={(date, time, isAllDay) =>
              handleOpenQuickCreate(date, time || '10:00', isAllDay || false)
            }
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDropOnDate={handleDropOnDate}
            onDropOnTime={handleDropOnTime}
            onDropAllDay={handleDropAllDay}
            onDragEnd={handleDragEnd}
            onContextMenu={handleContextMenu}
          />
        </main>
      </div>

      {/* 3. 일정 상세 팝오버 다이얼로그 */}
      {selectedScheduleItem && (
        <GoogleCalendarEventDialog
          item={selectedScheduleItem}
          category={selectedCategory}
          subItem={selectedSubItem}
          initialEditMode={initialEditDialogMode}
          onClose={() => {
            setSelectedScheduleItem(null);
            setInitialEditDialogMode(false);
          }}
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

      {/* 5. 우클릭 컨텍스트 메뉴 (색상 선택 및 수정/삭제) */}
      <GoogleCalendarContextMenu
        state={contextMenuState}
        onClose={() =>
          setContextMenuState((prev) => ({ ...prev, isOpen: false, item: null }))
        }
        onColorChange={handleContextColorChange}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
      />
    </div>
  );
};
