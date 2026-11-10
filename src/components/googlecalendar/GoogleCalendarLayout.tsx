import React, { useState, useEffect } from 'react';
import { useFullCalendar } from '../../hooks/useFullCalendar';
import { useCalendarDragDrop } from '../../hooks/useCalendarDragDrop';
import { GoogleCalendarHeader } from './GoogleCalendarHeader';
import { GoogleCalendarDesktopView } from './GoogleCalendarDesktopView';
import { CalendarSideViewType } from './GoogleCalendarRightPanel';
import { GoogleCalendarEventDialog } from './GoogleCalendarEventDialog';
import { GoogleCalendarQuickCreateModal, QuickCreateState } from './GoogleCalendarQuickCreateModal';
import { GoogleCalendarContextMenu, ContextMenuState } from './GoogleCalendarContextMenu';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CalendarScheduleItem } from '../../types';
import { CalendarMobilePanel } from './GoogleCalendarMobileNavBar';
import { GoogleCalendarMobileView } from './GoogleCalendarMobileView';
import { getGoogleCalendarHeaderTitle, getTodayDateStr } from '../../utils/googleCalendarUtils';

export const GoogleCalendarLayout: React.FC = () => {
  const isMobileInit = typeof window !== 'undefined' && window.innerWidth < 1024;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [initialEditDialogMode, setInitialEditDialogMode] = useState<boolean>(false);
  const [sideViewType, setSideViewType] = useState<CalendarSideViewType>(() => {
    try {
      const s = localStorage.getItem('sb_cal_side_view_type') as CalendarSideViewType;
      if (['day', 'threeDay', 'todo', 'schedule'].includes(s)) return s;
    } catch {}
    return 'day';
  });
  const [mobilePanel, setMobilePanel] = useState<CalendarMobilePanel>(() => {
    try {
      const m = localStorage.getItem('sb_cal_mobile_panel') as CalendarMobilePanel;
      if (['month', 'detail', 'sidebar'].includes(m)) return m;
    } catch {}
    return isMobileInit ? 'detail' : 'month';
  });

  useEffect(() => {
    try {
      localStorage.setItem('sb_cal_side_view_type', sideViewType);
      localStorage.setItem('sb_cal_mobile_panel', mobilePanel);
    } catch {}
  }, [sideViewType, mobilePanel]);

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
    date: getTodayDateStr(),
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

  const { subItems, updateCalendarEvent, deleteCalendarEvent, setChecklistGroups, setTextGroups } = useWorkspace();

  const handleContextMenu = (item: CalendarScheduleItem, e: React.MouseEvent) => {
    setContextMenuState({ isOpen: true, x: e.clientX, y: e.clientY, item });
  };

  const handleContextColorChange = (item: CalendarScheduleItem, colorId: string) => {
    if (item.sourceType === 'calendar') {
      updateCalendarEvent(item.id, { categoryId: colorId });
    } else if (item.sourceType === 'checklist') {
      setChecklistGroups((prev) => prev.map((g) => g.id === item.groupId ? { ...g, items: g.items.map((i) => (i.id === item.id ? { ...i, colorId } : i)) } : g));
    } else if (item.sourceType === 'text') {
      setTextGroups((prev) => prev.map((g) => g.id === item.groupId ? { ...g, blocks: g.blocks.map((b) => (b.id === item.id ? { ...b, colorId } : b)) } : g));
    }
  };

  const handleContextEdit = (item: CalendarScheduleItem) => {
    setInitialEditDialogMode(true);
    setSelectedScheduleItem(item);
  };

  const handleContextDelete = (item: CalendarScheduleItem) => {
    if (item.sourceType === 'calendar') deleteCalendarEvent(item.id);
  };

  const headerTitle = getGoogleCalendarHeaderTitle(viewType, currentDateObj, selectedCalendarDate, filteredItems);
  const selectedSubItem = selectedScheduleItem ? subItems.find((s) => s.id === selectedScheduleItem.subItemId) : undefined;
  const selectedCategory = selectedSubItem
    ? categoryItems.find((c) => c.id === selectedSubItem.categoryId)
    : selectedScheduleItem ? categoryItems.find((c) => c.id === selectedScheduleItem.categoryId) : undefined;

  const handleOpenQuickCreate = (date: string, time?: string, isAllDay = false) => {
    setQuickCreateState({ isOpen: true, date, time: time || '10:00', isAllDay });
  };

  useEffect(() => {
    if (isMobileInit) setViewType('day');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 모바일 하단 홈 버튼 클릭 시 당일 일간뷰로 이동 이벤트 처리
  useEffect(() => {
    const handleGoTodayDay = () => {
      const todayStr = getTodayDateStr();
      setDateByString(todayStr);
      setSideViewType('day');
      setViewType('day');
      setMobilePanel('detail');
    };
    window.addEventListener('calendar-go-today-day', handleGoTodayDay);
    return () => window.removeEventListener('calendar-go-today-day', handleGoTodayDay);
  }, [setDateByString, setViewType]);

  const handleHeaderMenuToggle = () => {
    setIsSidebarOpen((prev) => !prev);
    setMobilePanel((prev) => (prev === 'sidebar' ? 'month' : 'sidebar'));
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-white select-none">
      {/* 1. 모바일 뷰 상단 헤더 (lg 미만) */}
      <div className="block lg:hidden shrink-0">
        <GoogleCalendarHeader
          onToggleSidebar={handleHeaderMenuToggle}
          title={headerTitle}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* 2. 데스크탑 뷰 (lg 이상): 1번 패널(지식보관소 카테고리 + 하단 미니달력) + 2·3·4번 패널(캘린더 헤더 및 메인 뷰) */}
      <GoogleCalendarDesktopView
        isSidebarOpen={isSidebarOpen}
        headerTitle={headerTitle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={handleHeaderMenuToggle}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        currentDateObj={currentDateObj}
        selectedCalendarDate={selectedCalendarDate}
        filteredItems={filteredItems}
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
        setDateByString={setDateByString}
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

      {/* 3. 모바일 뷰 (1024px 미만): 패널별 단일 뷰 드릴다운 & 탭 전환 */}
      <div className="flex lg:hidden flex-1 overflow-hidden">
        <GoogleCalendarMobileView
          mobilePanel={mobilePanel}
          onChangePanel={(panel) => {
            setMobilePanel(panel);
            setViewType(panel === 'detail' ? sideViewType : 'month');
          }}
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
          onPrevMonth={goToPrev}
          onNextMonth={goToNext}
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
