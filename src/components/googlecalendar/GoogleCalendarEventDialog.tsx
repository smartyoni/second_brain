import React, { useState, useEffect, useRef } from 'react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GoogleCalendarEventDialogHeader } from './GoogleCalendarEventDialogHeader';
import { GoogleCalendarEventDetailView } from './GoogleCalendarEventDetailView';
import { EventInlineUpdateData } from './GoogleCalendarEventInlineEdit';
import { ConfirmModal } from '../shared/ConfirmModal';
import { GOOGLE_RED_COLOR } from '../../utils/googleCalendarUtils';

interface GoogleCalendarEventDialogProps {
  item: CalendarScheduleItem;
  category?: CategoryItem;
  subItem?: SubItem;
  initialEditMode?: boolean;
  onClose: () => void;
  onToggleComplete: () => void;
  onJumpToSource: () => void;
}

export const GoogleCalendarEventDialog: React.FC<GoogleCalendarEventDialogProps> = ({
  item,
  category: _category,
  subItem,
  initialEditMode = false,
  onClose,
  onToggleComplete,
  onJumpToSource,
}) => {
  const {
    deleteCalendarEvent,
    toggleCalendarEventCompleted,
    updateCalendarEvent,
    setChecklistGroups,
    setTextGroups,
    updateCheckItemDueDate,
    updateTextBlockDueDate,
    getAllScheduleItems,
    setAppMode,
    updateItemChecklist,
  } = useWorkspace();

  const currentItem =
    getAllScheduleItems().find((i) => i.id === item.id && i.sourceType === item.sourceType) || item;

  const isCalendarOwnEvent = currentItem.sourceType === 'calendar';
  const [isEditing, setIsEditing] = useState(initialEditMode);
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

    // 800ms 이내, 가로 이동이 세로 이동의 1.3배 이상이며 최소 40px 이동 시 스와이프 전환
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
  }, [item.id, initialEditMode]);

  const handleDelete = () => {
    if (isCalendarOwnEvent) {
      deleteCalendarEvent(currentItem.id);
    } else if (currentItem.sourceType === 'checklist') {
      updateCheckItemDueDate(currentItem.groupId, currentItem.id, undefined, undefined, undefined);
    } else if (currentItem.sourceType === 'text') {
      updateTextBlockDueDate(currentItem.groupId, currentItem.id, undefined, undefined, undefined);
    }
    onClose();
  };

  const handleToggle = () => {
    if (isCalendarOwnEvent) {
      toggleCalendarEventCompleted(currentItem.id);
    } else {
      onToggleComplete();
    }
  };

  const handleSaveForm = (updates: EventInlineUpdateData) => {
    const isOngoing = updates.isInProgress && !updates.isCompleted;
    // 진행중 일정은 빨간색으로 고정, 아니면 기존 categoryId 유지
    const resolvedCategoryId = isOngoing ? GOOGLE_RED_COLOR.id : currentItem.categoryId;

    if (isCalendarOwnEvent) {
      updateCalendarEvent(currentItem.id, {
        ...updates,
        categoryId: resolvedCategoryId,
      });
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
                        isInProgress: updates.isInProgress,
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
                    isInProgress: updates.isInProgress,
                    isCompleted: updates.isCompleted,
                  };
                }),
              }
            : g
        )
      );
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

  const handleStartEdit = () => {
    setIsEditing(true);
    setMobileTab('detail');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-0 sm:items-center bg-black/25 select-none p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md md:max-w-2xl lg:max-w-3xl overflow-hidden sm:my-auto flex flex-col min-h-[440px] max-h-[92vh]"
      >
        {/* 상단 툴바 및 모바일 탭 헤더 */}
        <GoogleCalendarEventDialogHeader
          isEditing={isEditing}
          isCalendarOwnEvent={isCalendarOwnEvent}
          sourceType={currentItem.sourceType}
          mobileTab={mobileTab}
          checklistCount={checklistCount}
          completedChecklistCount={completedChecklistCount}
          onSelectMobileTab={setMobileTab}
          onStartEdit={handleStartEdit}
          onDelete={() => setIsDeleteConfirmOpen(true)}
          onClose={onClose}
        />

        {/* 본문: 일정 기본정보/인라인 수정폼 (좌측) + 하위할일 체크리스트 (우측) 항상 유지 */}
        <GoogleCalendarEventDetailView
          item={currentItem}
          subItem={subItem}
          isEditing={isEditing}
          mobileTab={mobileTab}
          checklist={checklist}
          onUpdateChecklist={(updater) => updateItemChecklist(currentItem, updater)}
          onToggleComplete={handleToggle}
          onStartEdit={handleStartEdit}
          onCancelEdit={() => setIsEditing(false)}
          onSaveEdit={handleSaveForm}
          onOpenSource={handleOpenSource}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* 삭제 확인 모달 */}
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          title={isCalendarOwnEvent ? '일정 삭제' : '일정 해제'}
          message={
            isCalendarOwnEvent
              ? '정말 이 일정을 삭제하시겠습니까?\n삭제된 일정은 복구할 수 없습니다.'
              : '이 항목의 일정을 해제하시겠습니까?\n(캘린더에서만 제외되며, 원본 메모/체크리스트는 안전하게 보존됩니다)'
          }
          confirmLabel={isCalendarOwnEvent ? '삭제' : '일정 해제'}
          isDestructive={true}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            handleDelete();
          }}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      </div>
    </div>
  );
};
