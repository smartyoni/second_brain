import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle, Clock, Trash2, AlignLeft, Pencil } from 'lucide-react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GoogleCalendarEventEditForm } from './GoogleCalendarEventEditForm';
import { SmartText } from '../shared/SmartText';

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
  } = useWorkspace();

  const currentItem =
    getAllScheduleItems().find((i) => i.id === item.id && i.sourceType === item.sourceType) || item;

  const isCalendarOwnEvent = currentItem.sourceType === 'calendar';
  const activeColor = getGoogleCategoryColor(currentItem.categoryId);
  const [isEditing, setIsEditing] = useState(initialEditMode);

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
    title: string; dueDate: string; endDate?: string; dueTime?: string; categoryId: string; description?: string;
  }) => {
    if (isCalendarOwnEvent) {
      updateCalendarEvent(currentItem.id, updates);
    } else if (currentItem.sourceType === 'checklist') {
      setChecklistGroups((prev) => prev.map((g) => g.id === currentItem.groupId ? {
        ...g, items: g.items.map((i) => i.id === currentItem.id ? { ...i, text: updates.title, dueDate: updates.dueDate, endDate: updates.endDate, dueTime: updates.dueTime, memo: updates.description, colorId: updates.categoryId } : i)
      } : g));
    } else if (currentItem.sourceType === 'text') {
      setTextGroups((prev) => prev.map((g) => g.id === currentItem.groupId ? {
        ...g, blocks: g.blocks.map((b) => {
          if (b.id !== currentItem.id) return b;
          const lines = b.text.split('\n');
          lines[0] = updates.title;
          return { ...b, text: lines.join('\n'), dueDate: updates.dueDate, endDate: updates.endDate, dueTime: updates.dueTime, memo: updates.description, colorId: updates.categoryId };
        })
      } : g));
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
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden sm:my-auto"
      >
        {/* 상단 툴바: [헤더 타이틀 + 일정 유형] ... [수정] [삭제] [닫기] */}
        <div className="px-4 py-2.5 bg-[#f8f9fa] flex items-center justify-between border-b border-[#dadce0]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-[#5f6368] shrink-0">
              {isEditing ? '일정 수정' : '일정 세부정보'}
            </span>
            <span className="text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
              {isCalendarOwnEvent
                ? '캘린더 일정'
                : currentItem.sourceType === 'checklist'
                ? '체크리스트 할 일'
                : '텍스트 메모'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-[#5f6368] hover:text-[#1a73e8] transition-colors cursor-pointer"
                title="일정 수정"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-full hover:bg-red-50 text-[#5f6368] hover:text-red-600 transition-colors cursor-pointer"
              title={isCalendarOwnEvent ? '일정 삭제' : '일정 해제 (원본 항목 유지)'}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-[#5f6368] cursor-pointer"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 본문 (수정 폼 vs 조회 뷰) */}
        {isEditing ? (
          <GoogleCalendarEventEditForm
            item={currentItem}
            onSave={handleSaveForm}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-3.5 h-3.5 rounded-xs mt-1 shrink-0 ${activeColor.bg}`} />
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-lg font-normal text-[#3c4043] leading-snug break-words ${
                      currentItem.isCompleted ? 'line-through text-[#70757a]' : ''
                    }`}
                  >
                    <SmartText text={currentItem.title} />
                  </h3>
                </div>
              </div>

              {/* 일시 */}
              <div className="flex items-center gap-4 text-xs text-[#3c4043]">
                <Clock className="w-4 h-4 text-[#5f6368] shrink-0" />
                <span>
                  {currentItem.dueDate}
                  {currentItem.endDate ? ` ~ ${currentItem.endDate}` : ''}{' '}
                  {currentItem.dueTime ? `· ${currentItem.dueTime}` : '· 종일'}
                </span>
              </div>

              {/* 상세 설명(메모) */}
              {(currentItem.description || currentItem.memo) && (
                <div className="flex items-start gap-4 text-xs text-[#3c4043]">
                  <AlignLeft className="w-4 h-4 text-[#5f6368] shrink-0 mt-0.5" />
                  <div className="flex-1 whitespace-pre-wrap text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                    <SmartText text={currentItem.description || currentItem.memo || ''} />
                  </div>
                </div>
              )}
            </div>

            {/* 하단 액션 바 (지식보관소 생성 일정 기준 동일 버튼 구성으로 통일) */}
            <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#dadce0] flex items-center justify-between gap-2">
              {currentItem.sourceType !== 'text' ? (
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                    currentItem.isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-[#3c4043] border-[#dadce0] hover:bg-[#f1f3f4]'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{currentItem.isCompleted ? '완료 취소' : '완료 체크'}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>수정</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSource}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{subItem ? '문서에서 열기' : '보관소에서 열기'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
