import { useState } from 'react';
import {
  CalendarScheduleItem,
  ChecklistGroupData,
  TextGroupData,
  SubItem,
  CategoryItem,
  PanelDetailState,
  CalendarEvent,
} from '../types';

export const useCalendarSchedule = (
  checklistGroups: ChecklistGroupData[],
  setChecklistGroups: React.Dispatch<React.SetStateAction<ChecklistGroupData[]>>,
  textGroups: TextGroupData[],
  setTextGroups: React.Dispatch<React.SetStateAction<TextGroupData[]>>,
  subItems: SubItem[],
  categoryItems: CategoryItem[],
  updateActivePanelState: (updater: (prev: PanelDetailState) => PanelDetailState) => void
) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // 캘린더 자체 독립 일정들
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'cal-event-1',
      title: '구글 캘린더 연동 회의',
      dueDate: new Date().toISOString().slice(0, 10),
      dueTime: '10:00',
      isCompleted: false,
      categoryId: categoryItems[0]?.id || 'cat-1',
      description: '캘린더 자체 일정 등록 및 드래그 시간 이동 검증',
      eventType: 'event',
    },
    {
      id: 'cal-event-2',
      title: '주간 업무 정리 (종일)',
      dueDate: new Date().toISOString().slice(0, 10),
      isCompleted: false,
      categoryId: categoryItems[1]?.id || 'cat-2',
      description: '세컨드브레인 지식 정리 및 주간 회고',
      eventType: 'task',
    },
  ]);

  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt))
    );
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  const toggleCalendarEventCompleted = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, isCompleted: !evt.isCompleted } : evt))
    );
  };

  const updateCheckItemDueDate = (
    groupId: string,
    itemId: string,
    dueDate?: string,
    dueTime?: string
  ) => {
    setChecklistGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: g.items.map((i) => (i.id === itemId ? { ...i, dueDate, dueTime } : i)),
            }
          : g
      )
    );
  };

  const updateTextBlockDueDate = (
    groupId: string,
    blockId: string,
    dueDate?: string,
    dueTime?: string
  ) => {
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              blocks: g.blocks.map((b) => (b.id === blockId ? { ...b, dueDate, dueTime } : b)),
            }
          : g
      )
    );
  };

  const toggleCheckItemCompleted = (groupId: string, itemId: string) => {
    setChecklistGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: g.items.map((i) =>
                i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
              ),
            }
          : g
      )
    );
  };

  const getAllScheduleItems = (): CalendarScheduleItem[] => {
    const list: CalendarScheduleItem[] = [];

    // 1. 체크리스트 항목들 수집
    checklistGroups.forEach((group) => {
      const subItem = subItems.find((s) => s.id === group.subItemId);
      const category = subItem ? categoryItems.find((c) => c.id === subItem.categoryId) : null;
      group.items.forEach((item) => {
        if (item.dueDate) {
          list.push({
            id: item.id,
            title: item.text,
            dueDate: item.dueDate,
            dueTime: item.dueTime,
            isCompleted: item.isCompleted,
            sourceType: 'checklist',
            subItemId: group.subItemId,
            groupId: group.id,
            categoryId: category?.id || '',
            topCategoryId: category?.topCategoryId || '',
          });
        }
      });
    });

    // 2. 텍스트 블록 항목들 수집
    textGroups.forEach((group) => {
      const subItem = subItems.find((s) => s.id === group.subItemId);
      const category = subItem ? categoryItems.find((c) => c.id === subItem.categoryId) : null;
      group.blocks.forEach((block) => {
        if (block.dueDate) {
          const firstLine = block.text.split('\n')[0].trim();
          list.push({
            id: block.id,
            title: firstLine || group.name,
            dueDate: block.dueDate,
            dueTime: block.dueTime,
            sourceType: 'text',
            subItemId: group.subItemId,
            groupId: group.id,
            categoryId: category?.id || '',
            topCategoryId: category?.topCategoryId || '',
          });
        }
      });
    });

    // 3. 캘린더 자체 독립 일정들 수집
    calendarEvents.forEach((evt) => {
      const category = categoryItems.find((c) => c.id === evt.categoryId);
      list.push({
        id: evt.id,
        title: evt.title,
        dueDate: evt.dueDate,
        dueTime: evt.dueTime,
        endTime: evt.endTime,
        isCompleted: evt.isCompleted,
        sourceType: 'calendar',
        subItemId: '',
        groupId: '',
        categoryId: evt.categoryId || categoryItems[0]?.id || '',
        topCategoryId: category?.topCategoryId || '',
        description: evt.description,
      });
    });

    return list.sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));
  };

  const jumpToSourceItem = (item: CalendarScheduleItem) => {
    if (item.sourceType === 'calendar') return;
    if (item.topCategoryId && item.categoryId && item.subItemId) {
      updateActivePanelState((prev) => ({
        ...prev,
        topCategoryId: item.topCategoryId,
        categoryId: item.categoryId,
        subItemId: item.subItemId,
        activeTab: item.sourceType === 'checklist' ? 'check' : 'text',
      }));
    }
  };

  return {
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
    jumpToSourceItem,
  };
};
