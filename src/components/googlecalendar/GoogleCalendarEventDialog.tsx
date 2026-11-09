import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, CheckCircle, Clock, AlignLeft, Pencil } from 'lucide-react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GoogleCalendarEventEditForm } from './GoogleCalendarEventEditForm';
import { GoogleCalendarSubChecklist } from './GoogleCalendarSubChecklist';
import { GoogleCalendarEventDialogHeader } from './GoogleCalendarEventDialogHeader';
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
    updateItemChecklist,
  } = useWorkspace();

  const currentItem =
    getAllScheduleItems().find((i) => i.id === item.id && i.sourceType === item.sourceType) || item;

  const isCalendarOwnEvent = currentItem.sourceType === 'calendar';
  const activeColor = getGoogleCategoryColor(currentItem.categoryId);
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
          <>
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#dadce0] min-h-[300px] touch-pan-y"
            >
              {/* 좌측 컬럼: 일정 기본 정보 (제목, 일시, 메모) */}
              <div
                className={`p-5 sm:p-6 space-y-4 overflow-y-auto ${
                  mobileTab === 'detail' ? 'block' : 'hidden md:block'
                }`}
              >
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

              {/* 우측 컬럼: 하위할일(체크리스트) 전용 패널 */}
              <div
                className={`flex flex-col h-full min-h-[280px] ${
                  mobileTab === 'checklist' ? 'flex' : 'hidden md:flex'
                }`}
              >
                <GoogleCalendarSubChecklist
                  item={currentItem}
                  checklist={checklist}
                  onUpdateChecklist={(updater) => updateItemChecklist(currentItem, updater)}
                />
              </div>
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
