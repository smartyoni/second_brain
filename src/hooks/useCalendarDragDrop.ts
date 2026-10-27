import { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CalendarScheduleItem } from '../types';

export const useCalendarDragDrop = () => {
  const { updateCheckItemDueDate, updateTextBlockDueDate, updateCalendarEvent } = useWorkspace();
  const [draggedItem, setDraggedItem] = useState<CalendarScheduleItem | null>(null);

  const handleDragStart = (item: CalendarScheduleItem, e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 월간 뷰: 특정 날짜로 이동 (기존 시간 유지)
  const handleDropOnDate = (targetDate: string) => {
    if (!draggedItem) return;
    if (draggedItem.sourceType === 'calendar') {
      updateCalendarEvent(draggedItem.id, { dueDate: targetDate });
    } else if (draggedItem.sourceType === 'checklist') {
      updateCheckItemDueDate(
        draggedItem.groupId || '',
        draggedItem.id,
        targetDate,
        draggedItem.dueTime
      );
    } else {
      updateTextBlockDueDate(
        draggedItem.groupId || '',
        draggedItem.id,
        targetDate,
        draggedItem.dueTime
      );
    }
    setDraggedItem(null);
  };

  // 주간/일간 뷰: 특정 날짜와 시간대로 이동
  const handleDropOnTime = (targetDate: string, targetTime: string) => {
    if (!draggedItem) return;
    if (draggedItem.sourceType === 'calendar') {
      updateCalendarEvent(draggedItem.id, { dueDate: targetDate, dueTime: targetTime });
    } else if (draggedItem.sourceType === 'checklist') {
      updateCheckItemDueDate(
        draggedItem.groupId || '',
        draggedItem.id,
        targetDate,
        targetTime
      );
    } else {
      updateTextBlockDueDate(
        draggedItem.groupId || '',
        draggedItem.id,
        targetDate,
        targetTime
      );
    }
    setDraggedItem(null);
  };

  // 상단 종일 일정 슬롯으로 이동 (시간 제거)
  const handleDropAllDay = (targetDate: string) => {
    if (!draggedItem) return;
    if (draggedItem.sourceType === 'calendar') {
      updateCalendarEvent(draggedItem.id, { dueDate: targetDate, dueTime: undefined });
    } else if (draggedItem.sourceType === 'checklist') {
      updateCheckItemDueDate(
        draggedItem.groupId || '',
        draggedItem.id,
        targetDate,
        undefined
      );
    } else {
      updateTextBlockDueDate(
        draggedItem.groupId || '',
        draggedItem.id,
        targetDate,
        undefined
      );
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDropOnDate,
    handleDropOnTime,
    handleDropAllDay,
    handleDragEnd,
  };
};
