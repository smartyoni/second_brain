import React, { useState, useEffect, useRef } from 'react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GoogleCalendarEventEditForm } from './GoogleCalendarEventEditForm';
import { GoogleCalendarEventDialogHeader } from './GoogleCalendarEventDialogHeader';
import { GoogleCalendarEventDetailView } from './GoogleCalendarEventDetailView';

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
        // 오른쪽에서 왼쪽으로 스와이프 -> 체크리스트 탭으로
        setMobileTab('checklist');
      } else {
        // 왼쪽에서 오른쪽으로 스와이프 -> 세부정보 탭으로
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

  const handleSaveForm = (updates: {
    title: string;
    dueDate: string;
    endDate?: string;
    dueTime?: string;
    categoryId: string;
    description?: string;
    isInProgress?: boolean;
    isCompleted?: boolean;
  }) => {
    if (isCalendarOwnEvent) {
      updateCalendarEvent(currentItem.id, updates);
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
                        colorId: updates.categoryId,
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
                    colorId: updates.categoryId,
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
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isEditing]);

  const handleOpenSource = () => {
    if (subItem) {
      onJumpToSource();
    } else {
      onClose();
      setAppMode('workspace');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-0 sm:items-center bg-black/25 select-none p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md md:max-w-2xl lg:max-w-3xl overflow-hidden sm:my-auto flex flex-col min-h-[440px]"
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
          onStartEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onClose={onClose}
        />

        {/* 본문 (수정 폼 vs 조회 뷰: 모바일에서는 탭 전환 & 터치 스와이프 지원) */}
        {isEditing ? (
          <div className="flex-1 overflow-y-auto">
            <GoogleCalendarEventEditForm
              item={currentItem}
              onSave={handleSaveForm}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <GoogleCalendarEventDetailView
            item={currentItem}
            subItem={subItem}
            mobileTab={mobileTab}
            checklist={checklist}
            onUpdateChecklist={(updater) => updateItemChecklist(currentItem, updater)}
            onToggleComplete={handleToggle}
            onStartEdit={() => setIsEditing(true)}
            onOpenSource={handleOpenSource}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        )}
      </div>
    </div>
  );
};
