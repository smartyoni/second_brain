import React, { createContext, useContext, useState } from 'react';
import {
  ActivePanel,
  DetailTab,
  PanelDetailState,
  MobileStep,
  WorkspaceContextType,
  AppMode,
  CalendarScheduleItem,
} from '../types';
import { useCalendarSchedule } from '../hooks/useCalendarSchedule';
import { useWorkspaceData } from '../hooks/useWorkspaceData';
import { useQuickMemoData } from '../hooks/useQuickMemoData';

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('workspace');
  const [jumpedFromCalendar, setJumpedFromCalendar] = useState<boolean>(false);
  const [mobileStep, setMobileStep] = useState<MobileStep>('category');
  const [activePanel, setActivePanel] = useState<ActivePanel>('panel-3');

  const [panel3State, setPanel3State] = useState<PanelDetailState>({
    topCategoryId: 'top-1',
    categoryId: null,
    subItemId: null,
    activeTab: 'text',
  });

  const [panel4State, setPanel4State] = useState<PanelDetailState>({
    topCategoryId: 'top-1',
    categoryId: null,
    subItemId: null,
    activeTab: 'text',
  });

  const getCurrentActiveState = () => (activePanel === 'panel-3' ? panel3State : panel4State);

  const updateActivePanelState = (updater: (prev: PanelDetailState) => PanelDetailState) => {
    if (activePanel === 'panel-3') {
      setPanel3State(updater);
    } else {
      setPanel4State(updater);
    }
  };

  const selectTopCategory = (topId: string) => {
    const firstCat = categoryItems.find((c) => c.topCategoryId === topId);
    const firstSub = firstCat ? subItems.find((s) => s.categoryId === firstCat.id) : null;
    updateActivePanelState((prev) => ({
      ...prev,
      topCategoryId: topId,
      categoryId: firstCat ? firstCat.id : null,
      subItemId: firstSub ? firstSub.id : null,
    }));
  };

  const selectCategory = (catId: string) => {
    const firstSub = subItems.find((s) => s.categoryId === catId);
    updateActivePanelState((prev) => ({
      ...prev,
      categoryId: catId,
      subItemId: firstSub ? firstSub.id : null,
    }));
    setMobileStep('subitem');
  };

  const selectSubItem = (subId: string) => {
    updateActivePanelState((prev) => ({
      ...prev,
      subItemId: subId,
    }));
    setMobileStep('detail');
  };

  const setPanelDetailTab = (panel: ActivePanel, tab: DetailTab) => {
    if (panel === 'panel-3') {
      setPanel3State((prev) => ({ ...prev, activeTab: tab }));
    } else {
      setPanel4State((prev) => ({ ...prev, activeTab: tab }));
    }
  };

  // 1. 도메인 아이템 데이터 (카테고리, 서브아이템, 텍스트/체크 그룹)
  const {
    topCategories,
    setTopCategories,
    categoryGroups,
    setCategoryGroups,
    categoryItems,
    setCategoryItems,
    subItems,
    setSubItems,
    textGroups,
    setTextGroups,
    checklistGroups,
    setChecklistGroups,
    updateTopCategoryName,
    toggleGroupExpanded,
    addCategoryItem,
    addSubItem,
    addTextGroup,
    addChecklistGroup,
  } = useWorkspaceData(selectCategory, selectSubItem);

  // 2. 퀵메모 데이터 및 핸들러
  const { quickMemos, setQuickMemos, addQuickMemo, deleteQuickMemo } = useQuickMemoData(
    categoryItems,
    setCategoryItems,
    setSubItems,
    setTextGroups,
    updateActivePanelState
  );

  // 3. 캘린더 및 일정 연동
  const {
    selectedCalendarDate,
    setSelectedCalendarDate,
    calendarEvents,
    selectedDetailItem,
    setSelectedDetailItem,
    updateCheckItemMemo,
    updateTextBlockMemo,
    setCalendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEventCompleted,
    updateCheckItemDueDate,
    updateTextBlockDueDate,
    toggleCheckItemCompleted,
    getAllScheduleItems,
    jumpToSourceItem: baseJumpToSourceItem,
  } = useCalendarSchedule(
    checklistGroups,
    setChecklistGroups,
    textGroups,
    setTextGroups,
    subItems,
    categoryItems,
    updateActivePanelState
  );

  const jumpToSourceItem = (item: CalendarScheduleItem) => {
    baseJumpToSourceItem(item);
    setJumpedFromCalendar(true);
  };

  const returnToCalendar = () => {
    setAppMode('calendar');
    setJumpedFromCalendar(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        appMode,
        setAppMode,
        mobileStep,
        setMobileStep,
        activePanel,
        setActivePanel,
        panel3State,
        panel4State,
        getCurrentActiveState,
        setPanelDetailTab,
        selectTopCategory,
        selectCategory,
        selectSubItem,
        topCategories,
        setTopCategories,
        categoryGroups,
        setCategoryGroups,
        categoryItems,
        setCategoryItems,
        subItems,
        setSubItems,
        textGroups,
        setTextGroups,
        checklistGroups,
        setChecklistGroups,
        quickMemos,
        setQuickMemos,
        calendarEvents,
        selectedDetailItem,
    setSelectedDetailItem,
    updateCheckItemMemo,
    updateTextBlockMemo,
    setCalendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEventCompleted,
        jumpedFromCalendar,
        setJumpedFromCalendar,
        returnToCalendar,
        selectedCalendarDate,
        setSelectedCalendarDate,
        updateCheckItemDueDate,
        updateTextBlockDueDate,
        toggleCheckItemCompleted,
        getAllScheduleItems,
        jumpToSourceItem,
        addQuickMemo,
        deleteQuickMemo,
        updateTopCategoryName,
        toggleGroupExpanded,
        addCategoryItem,
        addSubItem,
        addTextGroup,
        addChecklistGroup,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
