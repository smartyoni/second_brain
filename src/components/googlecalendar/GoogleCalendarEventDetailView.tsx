import React from 'react';
import { ExternalLink, CheckCircle, Clock, AlignLeft, Pencil, Check } from 'lucide-react';
import { CalendarScheduleItem, SubCheckItem, SubItem } from '../../types';
import { GoogleCalendarSubChecklist } from './GoogleCalendarSubChecklist';
import { GoogleCalendarEventInlineEdit, EventInlineUpdateData } from './GoogleCalendarEventInlineEdit';
import { SmartText } from '../shared/SmartText';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

interface GoogleCalendarEventDetailViewProps {
  item: CalendarScheduleItem;
  subItem?: SubItem;
  isEditing: boolean;
  isInProgress?: boolean;
  mobileTab: 'detail' | 'checklist';
  checklist: SubCheckItem[];
  onUpdateChecklist: (updater: (prev: SubCheckItem[]) => SubCheckItem[]) => void;
  onToggleComplete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (updates: EventInlineUpdateData) => void;
  onOpenSource: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const GoogleCalendarEventDetailView: React.FC<GoogleCalendarEventDetailViewProps> = ({
  item,
  subItem,
  isEditing,
  isInProgress,
  mobileTab,
  checklist,
  onUpdateChecklist,
  onToggleComplete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onOpenSource,
  onTouchStart,
  onTouchEnd,
}) => {
  const currentIsInProgress = isInProgress !== undefined ? isInProgress : !!item.isInProgress;
  const isOngoing = currentIsInProgress && !item.isCompleted;
  const activeColor = getGoogleCategoryColor(item.categoryId, isOngoing);

  return (
    <>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#dadce0] min-h-[300px] touch-pan-y"
      >
        {/* 좌측 컬럼: 수정 모드일 때 인라인 폼 vs 일반 모드일 때 일정 기본 정보 */}
        {isEditing ? (
          <GoogleCalendarEventInlineEdit
            item={item}
            isInProgress={currentIsInProgress}
            onSubmit={onSaveEdit}
            className={mobileTab === 'detail' ? 'block' : 'hidden md:block'}
          />
        ) : (
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
                    item.isCompleted ? 'line-through text-[#70757a]' : ''
                  }`}
                >
                  <SmartText text={item.title} />
                </h3>
              </div>
            </div>

            {/* 일시 정보 */}
            <div className="flex items-center gap-3 text-xs text-[#3c4043] flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5f6368] shrink-0" />
                <span>
                  {item.dueDate}
                  {item.endDate ? ` ~ ${item.endDate}` : ''}{' '}
                  {item.dueTime ? `· ${item.dueTime}` : '· 종일'}
                </span>
              </div>
            </div>

            {/* 상세 설명(메모) */}
            {(item.description || item.memo) && (
              <div className="flex items-start gap-4 text-xs text-[#3c4043]">
                <AlignLeft className="w-4 h-4 text-[#5f6368] shrink-0 mt-0.5" />
                <div className="flex-1 whitespace-pre-wrap text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                  <SmartText text={item.description || item.memo || ''} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 우측 컬럼: 하위할일(체크리스트) 전용 패널 (수정 모드에서도 항상 유지) */}
        <div
          className={`flex flex-col h-full min-h-[280px] ${
            mobileTab === 'checklist' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <GoogleCalendarSubChecklist
            item={item}
            checklist={checklist}
            onUpdateChecklist={onUpdateChecklist}
          />
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#dadce0] flex items-center justify-between gap-2 shrink-0">
        {isEditing ? (
          <>
            <div className="text-xs text-[#5f6368] hidden sm:block">
              * 제목과 일시를 변경한 후 저장하세요.
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#5f6368] hover:bg-[#e8eaed] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                form="calendar-event-inline-edit-form"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>저장</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {item.sourceType !== 'text' ? (
              <button
                type="button"
                onClick={onToggleComplete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                  item.isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-[#3c4043] border-[#dadce0] hover:bg-[#f1f3f4]'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{item.isCompleted ? '완료 취소' : '완료 체크'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onStartEdit}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>수정</span>
              </button>

              <button
                type="button"
                onClick={onOpenSource}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{subItem ? '문서에서 열기' : '보관소에서 열기'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
