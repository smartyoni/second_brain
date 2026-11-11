import { useState } from 'react';
import { getTodayDateStr } from '../utils/calendarUtils';
import { extractAllScheduleItems } from '../utils/calendarScheduleExtractor';
import {
  CalendarScheduleItem,
  ChecklistGroupData,
  TextGroupData,
  SubItem,
  CategoryItem,
  PanelDetailState,
  CalendarEvent,
  SelectedDetailItemInfo,
  SubCheckItem,
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
    getTodayDateStr()
  );

  // 4번 패널 하단 메모 연동용 선택 아이템
  const [selectedDetailItem, setSelectedDetailItem] = useState<SelectedDetailItemInfo | null>(null);

  // 캘린더 자체 독립 일정들
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

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
      prev.map((evt) => {
        if (evt.id !== id) return evt;
        const nextCompleted = !evt.isCompleted;
        return {
          ...evt,
          isCompleted: nextCompleted,
          isInProgress: nextCompleted ? false : evt.isInProgress,
        };
      })
    );
  };

  const updateCheckItemDueDate = (
    groupId: string,
    itemId: string,
    dueDate?: string,
    dueTime?: string,
    endDate?: string
  ) => {
    setChecklistGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: g.items.map((i) => (i.id === itemId ? { ...i, dueDate, dueTime, endDate } : i)),
            }
          : g
      )
    );
  };

  const updateTextBlockDueDate = (
    groupId: string,
    blockId: string,
    dueDate?: string,
    dueTime?: string,
    endDate?: string
  ) => {
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              blocks: g.blocks.map((b) => (b.id === blockId ? { ...b, dueDate, dueTime, endDate } : b)),
            }
          : g
      )
    );
  };

  const updateCheckItemMemo = (groupId: string, itemId: string, memo: string) => {
    setChecklistGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: g.items.map((i) => (i.id === itemId ? { ...i, memo } : i)),
            }
          : g
      )
    );
  };

  const updateTextBlockMemo = (groupId: string, blockId: string, memo: string) => {
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              blocks: g.blocks.map((b) => (b.id === blockId ? { ...b, memo } : b)),
            }
          : g
      )
    );
  };

  const toggleCheckItemCompleted = (groupId: string, itemId: string) => {
    setChecklistGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const toggled = g.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                isCompleted: !i.isCompleted,
                isInProgress: !i.isCompleted ? false : i.isInProgress,
              }
            : i
        );
        const incomplete = toggled.filter((i) => !i.isCompleted);
        const completed = toggled.filter((i) => i.isCompleted);
        const nextItems = [
          ...incomplete,
          ...completed.filter((i) => i.id !== itemId),
          ...completed.filter((i) => i.id === itemId),
        ].map((item, idx) => ({ ...item, order: idx }));
        return { ...g, items: nextItems };
      })
    );
  };

  const getAllScheduleItems = (): CalendarScheduleItem[] => {
    return extractAllScheduleItems({
      checklistGroups,
      textGroups,
      calendarEvents,
      subItems,
      categoryItems,
    });
  };

  const jumpToSourceItem = (item: CalendarScheduleItem) => {
    if (item.sourceType === 'calendar') return;
    const subItem = subItems.find((s) => s.id === item.subItemId);
    const realCategoryId = subItem?.categoryId || item.categoryId;
    if (item.topCategoryId && realCategoryId && item.subItemId) {
      updateActivePanelState((prev) => ({
        ...prev,
        topCategoryId: item.topCategoryId,
        categoryId: realCategoryId,
        subItemId: item.subItemId,
        activeTab: item.sourceType === 'checklist' ? 'check' : 'text',
      }));
    }
  };

  // 일정 항목 전속 하위할일(체크리스트) 업데이트 헬퍼
  const updateItemChecklist = (
    item: CalendarScheduleItem,
    updater: (prev: SubCheckItem[]) => SubCheckItem[]
  ) => {
    if (item.sourceType === 'calendar') {
      setCalendarEvents((prev) => prev.map((e) => e.id === item.id ? { ...e, checklist: updater(e.checklist || []) } : e));
    } else if (item.sourceType === 'checklist') {
      setChecklistGroups((prev) => prev.map((g) => g.id === item.groupId ? {
        ...g, items: g.items.map((i) => i.id === item.id ? { ...i, checklist: updater(i.checklist || []) } : i)
      } : g));
    } else if (item.sourceType === 'text') {
      setTextGroups((prev) => prev.map((g) => g.id === item.groupId ? {
        ...g, blocks: g.blocks.map((b) => b.id === item.id ? { ...b, checklist: updater(b.checklist || []) } : b)
      } : g));
    }
  };

  // 특정 하위할일(SubCheckItem) 직접 업데이트 헬퍼 (완료 토글, 일정 변경, 수정 등)
  const updateSubCheckItem = (
    subCheckId: string,
    updater: (sub: SubCheckItem) => SubCheckItem
  ) => {
    setCalendarEvents((prev) =>
      prev.map((e) =>
        e.checklist?.some((c) => c.id === subCheckId)
          ? { ...e, checklist: e.checklist.map((c) => (c.id === subCheckId ? updater(c) : c)) }
          : e
      )
    );
    setChecklistGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) =>
          i.checklist?.some((c) => c.id === subCheckId)
            ? { ...i, checklist: i.checklist.map((c) => (c.id === subCheckId ? updater(c) : c)) }
            : i
        ),
      }))
    );
    setTextGroups((prev) =>
      prev.map((g) => ({
        ...g,
        blocks: g.blocks.map((b) =>
          b.checklist?.some((c) => c.id === subCheckId)
            ? { ...b, checklist: b.checklist.map((c) => (c.id === subCheckId ? updater(c) : c)) }
            : b
        ),
      }))
    );
  };

  return {
    selectedDetailItem,
    setSelectedDetailItem,
    updateCheckItemMemo,
    updateTextBlockMemo,
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
    updateItemChecklist,
    updateSubCheckItem,
  };
};
