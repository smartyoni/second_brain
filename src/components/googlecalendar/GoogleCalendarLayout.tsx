import React, { useState } from 'react';
import { useFullCalendar } from '../../hooks/useFullCalendar';
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
import { CalendarMobilePanel } from './GoogleCalendarMobileNavBar';
import { GoogleCalendarMobileView } from './GoogleCalendarMobileView';
import { getGoogleCalendarHeaderTitle } from '../../utils/googleCalendarUtils';

export const GoogleCalendarLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sideViewType, setSideViewType] = useState<CalendarSideViewType>('day');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [initialEditDialogMode, setInitialEditDialogMode] = useState<boolean>(false);
  const [mobilePanel, setMobilePanel] = useState<CalendarMobilePanel>('month');

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
    selectedCalendarDate,
    allItems,
    filteredItems,
    selectedFilterKeys,
    toggleFilterKey,
    selectAll,
    clearAll,
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

  const headerTitle = getGoogleCalendarHeaderTitle(
    viewType,
    currentDateObj,
    selectedCalendarDate,
    filteredItems
  );

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

  const handleHeaderMenuToggle = () => {
    setIsSidebarOpen((prev) => !prev);
    setMobilePanel((prev) => (prev === 'sidebar' ? 'month' : 'sidebar'));
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white select-none">
      {/* 1. 상단 글로벌 앱 헤더 */}
      <GoogleCalendarHeader
        onToggleSidebar={handleHeaderMenuToggle}
        title={headerTitle}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. 데스크탑 뷰 (1024px 이상): 3패널 상시 분할 레이아웃 */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
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
          onClearAll={clearAll}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
          onBackToWorkspace={() => setAppMode('workspace')}
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
              setViewType(isOpen ? sideViewType : 'month');
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

      {/* 3. 모바일 뷰 (1024px 미만): 패널별 단일 뷰 드릴다운 & 탭 전환 */}
      <div className="flex lg:hidden flex-1 overflow-hidden">
        <GoogleCalendarMobileView
          mobilePanel={mobilePanel}
          onChangePanel={setMobilePanel}
          currentDateObj={currentDateObj}
          selectedDate={selectedCalendarDate}
          items={filteredItems}
          draggedItem={draggedItem}
          sideViewType={sideViewType}
          onSideViewTypeChange={(type) => {
            setSideViewType(type);
            setViewType(type);
          }}
          onSelectDate={setDateByString}
          onSelectItem={setSelectedScheduleItem}
          onCellClick={(date, time, isAllDay) =>
            handleOpenQuickCreate(date, time || '10:00', isAllDay || false)
          }
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDropOnDate={handleDropOnDate}
          onDropOnTime={handleDropOnTime}
          onDropAllDay={handleDropAllDay}
          onDragEnd={handleDragEnd}
          onContextMenu={handleContextMenu}
          allItems={allItems}
          topCategories={topCategories}
          selectedFilterKeys={selectedFilterKeys}
          onToggleFilterKey={toggleFilterKey}
          onSelectAll={selectAll}
          onClearAll={clearAll}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
          onBackToWorkspace={() => setAppMode('workspace')}
        />
      </div>

      {/* 4. 일정 상세 팝오버 다이얼로그 */}
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

      {/* 5. 구글 캘린더 빠른 일정 생성 팝오버 */}
      <GoogleCalendarQuickCreateModal
        createState={quickCreateState}
        onClose={() =>
          setQuickCreateState((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* 6. 우클릭 컨텍스트 메뉴 (색상 선택 및 수정/삭제) */}
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
