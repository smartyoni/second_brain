import React, { createContext, useContext, useState } from 'react';
import {
  TopCategory,
  CategoryGroup,
  CategoryItem,
  SubItem,
  TextGroupData,
  ChecklistGroupData,
  ActivePanel,
  DetailTab,
  PanelDetailState,
  MobileStep,
  QuickMemo,
  WorkspaceContextType,
  AppMode,
  CalendarScheduleItem,
} from '../types';
import {
  initialTopCategories,
  initialGroups,
  initialCategories,
  initialSubItems,
  initialTextGroups,
  initialChecklistGroups,
  initialQuickMemos,
} from './initialData';
import { useCalendarSchedule } from '../hooks/useCalendarSchedule';

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('workspace');
  const [jumpedFromCalendar, setJumpedFromCalendar] = useState<boolean>(false);
  const [mobileStep, setMobileStep] = useState<MobileStep>('category');
  const [activePanel, setActivePanel] = useState<ActivePanel>('panel-3');

  const [panel3State, setPanel3State] = useState<PanelDetailState>({
    topCategoryId: 'top-3',
    categoryId: 'cat-4',
    subItemId: 'sub-1',
    activeTab: 'text',
  });

  const [panel4State, setPanel4State] = useState<PanelDetailState>({
    topCategoryId: 'top-3',
    categoryId: 'cat-2',
    subItemId: 'sub-5',
    activeTab: 'text',
  });

  const [topCategories, setTopCategories] = useState<TopCategory[]>(initialTopCategories);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>(initialGroups);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(initialCategories);
  const [subItems, setSubItems] = useState<SubItem[]>(initialSubItems);
  const [textGroups, setTextGroups] = useState<TextGroupData[]>(initialTextGroups);
  const [checklistGroups, setChecklistGroups] = useState<ChecklistGroupData[]>(initialChecklistGroups);
  const [quickMemos, setQuickMemos] = useState<QuickMemo[]>(initialQuickMemos);

  const getCurrentActiveState = () => (activePanel === 'panel-3' ? panel3State : panel4State);

  const updateActivePanelState = (updater: (prev: PanelDetailState) => PanelDetailState) => {
    if (activePanel === 'panel-3') {
      setPanel3State(updater);
    } else {
      setPanel4State(updater);
    }
  };

  const {
    selectedCalendarDate,
    setSelectedCalendarDate,
    calendarEvents,
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

  const updateTopCategoryName = (id: string, name: string) => {
    if (id === 'top-1') return; // 1*1 퀵메모는 이름 변경 불가
    setTopCategories((prev) => prev.map((item) => (item.id === id ? { ...item, name } : item)));
  };

  const toggleGroupExpanded = (groupId: string) => {
    setCategoryGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g))
    );
  };

  const addCategoryItem = (topCategoryId: string, groupId?: string) => {
    const newItem: CategoryItem = {
      id: `cat-${Date.now()}`,
      topCategoryId,
      groupId,
      name: '새 카테고리',
      itemCount: 0,
      order: categoryItems.length,
    };
    setCategoryItems((prev) => [...prev, newItem]);
    selectCategory(newItem.id);
  };

  const addSubItem = (categoryId: string) => {
    const newSub: SubItem = {
      id: `sub-${Date.now()}`,
      categoryId,
      title: '새 항목',
      order: subItems.length,
    };
    setSubItems((prev) => [...prev, newSub]);
    selectSubItem(newSub.id);
  };

  const addTextGroup = (subItemId: string) => {
    const newGroup: TextGroupData = {
      id: `tg-${Date.now()}`,
      subItemId,
      name: '새 텍스트그룹',
      isExpanded: true,
      order: textGroups.length,
      blocks: [{ id: `b-${Date.now()}`, text: '', order: 0 }],
    };
    setTextGroups((prev) => [...prev, newGroup]);
  };

  const addChecklistGroup = (subItemId: string) => {
    const newGroup: ChecklistGroupData = {
      id: `cg-${Date.now()}`,
      subItemId,
      name: '새 체크그룹',
      isExpanded: true,
      order: checklistGroups.length,
      items: [{ id: `ci-${Date.now()}`, text: '새 할 일', isCompleted: false, order: 0 }],
    };
    setChecklistGroups((prev) => [...prev, newGroup]);
  };

  const addQuickMemo = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const now = new Date();
    const yearMonth = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월`;
    const ymId = `cat-qm-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    let targetCatId = ymId;
    const existingCat = categoryItems.find((c) => c.topCategoryId === 'top-1' && c.name === yearMonth);
    if (!existingCat) {
      setCategoryItems((prev) => [{ id: ymId, topCategoryId: 'top-1', name: yearMonth, itemCount: 1, order: 0 }, ...prev]);
    } else {
      targetCatId = existingCat.id;
      setCategoryItems((prev) => prev.map((c) => (c.id === existingCat.id ? { ...c, itemCount: c.itemCount + 1 } : c)));
    }

    const firstLine = trimmed.split('\n')[0].trim();
    const title = firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
    const newSubId = `sub-qm-${Date.now()}`;
    setSubItems((prev) => [{ id: newSubId, categoryId: targetCatId, title: title || '새 퀵메모', order: 0 }, ...prev]);

    setTextGroups((prev) => [
      { id: `tg-qm-${Date.now()}`, subItemId: newSubId, name: '퀵메모 원본', isExpanded: true, order: 0, blocks: [{ id: `tb-${Date.now()}`, text: trimmed, order: 0 }] },
      ...prev,
    ]);

    setQuickMemos((prev) => [
      { id: `qm-${Date.now()}`, content: trimmed, createdAt: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);

    // 5. 방금 작성한 메모로 즉시 선택 활성화!
    updateActivePanelState((prev) => ({
      ...prev,
      topCategoryId: 'top-1',
      categoryId: targetCatId,
      subItemId: newSubId,
      activeTab: 'text',
    }));
  };

  const deleteQuickMemo = (id: string) => {
    setQuickMemos((prev) => prev.filter((m) => m.id !== id));
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
