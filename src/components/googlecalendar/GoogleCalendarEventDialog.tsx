import React from 'react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GoogleCalendarEventDialogHeader } from './GoogleCalendarEventDialogHeader';
import { GoogleCalendarEventDetailView } from './GoogleCalendarEventDetailView';
import { ConfirmModal } from '../shared/ConfirmModal';
import { useCalendarEventDialog } from '../../hooks/useCalendarEventDialog';

interface GoogleCalendarEventDialogProps {
  item: CalendarScheduleItem;
  category?: CategoryItem;
  subItem?: SubItem;
  initialEditMode?: boolean;
  onClose: () => void;
  onToggleComplete: () => void;
  onJumpToSource: () => void;
  onSelectScheduleItem?: (item: CalendarScheduleItem) => void;
}

export const GoogleCalendarEventDialog: React.FC<GoogleCalendarEventDialogProps> = ({
  item,
  category: _category,
  subItem,
  initialEditMode = false,
  onClose,
  onToggleComplete,
  onJumpToSource,
  onSelectScheduleItem,
}) => {
  const { updateItemChecklist } = useWorkspace();

  const {
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
  } = useCalendarEventDialog({
    item,
    subItem,
    initialEditMode,
    onClose,
    onToggleComplete,
    onJumpToSource,
    onSelectScheduleItem,
  });

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
          isInProgress={isEditing ? editIsInProgress : currentItem.isInProgress}
          isCompleted={currentItem.isCompleted}
          parentItemTitle={currentItem.parentItemTitle}
          onOpenParent={currentItem.parentItemId ? handleOpenParent : undefined}
          onToggleInProgress={() => setEditIsInProgress((prev) => !prev)}
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
          isInProgress={isEditing ? editIsInProgress : currentItem.isInProgress}
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
      </div>

      {/* 일정 삭제/해제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title={isCalendarOwnEvent ? '일정 삭제' : '일정 등록 해제'}
        message={
          isCalendarOwnEvent
            ? '이 일정을 정말 삭제하시겠습니까?\n(하위할일 및 메모도 함께 삭제됩니다)'
            : '이 항목의 일정을 해제하시겠습니까?\n(캘린더에서만 제외되며, 원본 메모/체크리스트는 유지됩니다)'
        }
        confirmLabel={isCalendarOwnEvent ? '삭제' : '해제'}
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
