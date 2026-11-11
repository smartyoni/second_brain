import { useState, useEffect, useRef } from 'react';
import { CalendarScheduleItem, SubItem } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { EventInlineUpdateData } from '../components/googlecalendar/GoogleCalendarEventInlineEdit';
import { GOOGLE_RED_COLOR } from '../utils/googleCalendarUtils';
import { findParentScheduleItem } from '../utils/calendarScheduleExtractor';

interface UseCalendarEventDialogParams {
  item: CalendarScheduleItem;
  subItem?: SubItem;
  initialEditMode?: boolean;
  onClose: () => void;
  onToggleComplete: () => void;
  onJumpToSource: () => void;
  onSelectScheduleItem?: (item: CalendarScheduleItem) => void;
}

export const useCalendarEventDialog = ({
  item,
  subItem,
  initialEditMode = false,
  onClose,
  onToggleComplete,
  onJumpToSource,
  onSelectScheduleItem,
}: UseCalendarEventDialogParams) => {
  const {
    deleteCalendarEvent,
    toggleCalendarEventCompleted,
    updateCalendarEvent,
    setChecklistGroups,
    setTextGroups,
    checklistGroups,
    textGroups,
    calendarEvents,
    subItems,
    categoryItems,
    updateCheckItemDueDate,
    updateTextBlockDueDate,
    getAllScheduleItems,
    setAppMode,
    updateSubCheckItem,
  } = useWorkspace();

  const currentItem =
    getAllScheduleItems().find((i) => i.id === item.id && i.sourceType === item.sourceType) || item;

  const isCalendarOwnEvent = currentItem.sourceType === 'calendar';
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editIsInProgress, setEditIsInProgress] = useState(!!currentItem.isInProgress);
  const [mobileTab, setMobileTab] = useState<'detail' | 'checklist'>('detail');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const checklist = currentItem.checklist || [];
  const checklistCount = checklist.length;
  const completedChecklistCount = checklist.filter((c) => c.isCompleted).length;

  // 터치 스와이프 제스처 처리 (모바일 탭 좌우 전환)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (duration < 800 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        setMobileTab('checklist');
      } else {
        setMobileTab('detail');
      }
    }
  };

  useEffect(() => {
    setIsEditing(initialEditMode);
    setEditIsInProgress(!!currentItem.isInProgress);
  }, [item.id, initialEditMode, currentItem.isInProgress]);

  const handleDelete = () => {
    if (isCalendarOwnEvent) {
      deleteCalendarEvent(currentItem.id);
    } else if (currentItem.sourceType === 'checklist') {
      updateCheckItemDueDate(currentItem.groupId, currentItem.id, undefined, undefined, undefined);
    } else if (currentItem.sourceType === 'text') {
      updateTextBlockDueDate(currentItem.groupId, currentItem.id, undefined, undefined, undefined);
    } else if (currentItem.sourceType === 'subcheck') {
      updateSubCheckItem(currentItem.id, (sub) => ({ ...sub, dueDate: undefined, dueTime: undefined, endDate: undefined }));
    }
    onClose();
  };

  const handleToggle = () => {
    if (isCalendarOwnEvent) {
      toggleCalendarEventCompleted(currentItem.id);
    } else if (currentItem.sourceType === 'subcheck') {
      updateSubCheckItem(currentItem.id, (sub) => ({ ...sub, isCompleted: !sub.isCompleted }));
    } else {
      onToggleComplete();
    }
  };

  const handleSaveForm = (updates: EventInlineUpdateData) => {
    const isOngoing = editIsInProgress && !updates.isCompleted;
    const resolvedCategoryId = isOngoing ? GOOGLE_RED_COLOR.id : currentItem.categoryId;

    const finalUpdates = {
      ...updates,
      isInProgress: editIsInProgress,
      categoryId: resolvedCategoryId,
    };

    if (isCalendarOwnEvent) {
      updateCalendarEvent(currentItem.id, finalUpdates);
    } else if (currentItem.sourceType === 'checklist') {
      setChecklistGroups((prev) =>
        prev.map((g) =>
          g.id === currentItem.groupId
            ? {
                ...g,
                items: g.items.map((i) =>
                  i.id === currentItem.id
                    ? {
                        ...i,
                        text: updates.title,
                        dueDate: updates.dueDate,
                        endDate: updates.endDate,
                        dueTime: updates.dueTime,
                        memo: updates.description,
                        colorId: resolvedCategoryId,
                        isInProgress: editIsInProgress,
                        isCompleted: updates.isCompleted ?? i.isCompleted,
                      }
                    : i
                ),
              }
            : g
        )
      );
    } else if (currentItem.sourceType === 'text') {
      setTextGroups((prev) =>
        prev.map((g) =>
          g.id === currentItem.groupId
            ? {
                ...g,
                blocks: g.blocks.map((b) => {
                  if (b.id !== currentItem.id) return b;
                  const lines = b.text.split('\n');
                  lines[0] = updates.title;
                  return {
                    ...b,
                    text: lines.join('\n'),
                    dueDate: updates.dueDate,
                    endDate: updates.endDate,
                    dueTime: updates.dueTime,
                    memo: updates.description,
                    colorId: resolvedCategoryId,
                    isInProgress: editIsInProgress,
                    isCompleted: updates.isCompleted,
                  };
                }),
              }
            : g
        )
      );
    } else if (currentItem.sourceType === 'subcheck') {
      updateSubCheckItem(currentItem.id, (sub) => ({
        ...sub,
        text: updates.title,
        dueDate: updates.dueDate,
        endDate: updates.endDate,
        dueTime: updates.dueTime,
        isCompleted: updates.isCompleted ?? sub.isCompleted,
      }));
    }
    setIsEditing(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDeleteConfirmOpen) {
          setIsDeleteConfirmOpen(false);
          return;
        }
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isEditing, isDeleteConfirmOpen]);

  const handleOpenSource = () => {
    if (subItem) {
      onJumpToSource();
    } else {
      onClose();
      setAppMode('workspace');
    }
  };

  const handleOpenParent = () => {
    if (!currentItem.parentItemId) return;
    const parent = findParentScheduleItem({
      parentItemId: currentItem.parentItemId,
      allScheduleItems: getAllScheduleItems(),
      checklistGroups,
      textGroups,
      calendarEvents,
      subItems,
      categoryItems,
    });
    if (parent && onSelectScheduleItem) {
      onSelectScheduleItem(parent);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditIsInProgress(!!currentItem.isInProgress);
    setMobileTab('detail');
  };

  return {
    currentItem,
    isCalendarOwnEvent,
    isEditing,
    setIsEditing,
    editIsInProgress,
    setEditIsInProgress,
    mobileTab,
    setMobileTab,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    checklist,
    checklistCount,
    completedChecklistCount,
    handleTouchStart,
    handleTouchEnd,
    handleDelete,
    handleToggle,
    handleSaveForm,
    handleOpenSource,
    handleOpenParent,
    handleStartEdit,
  };
};
