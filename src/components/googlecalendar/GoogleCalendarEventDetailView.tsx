import React from 'react';
import { ExternalLink, CheckCircle, Clock, AlignLeft, Pencil } from 'lucide-react';
import { CalendarScheduleItem, SubCheckItem, SubItem } from '../../types';
import { GoogleCalendarSubChecklist } from './GoogleCalendarSubChecklist';
import { SmartText } from '../shared/SmartText';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

interface GoogleCalendarEventDetailViewProps {
  item: CalendarScheduleItem;
  subItem?: SubItem;
  mobileTab: 'detail' | 'checklist';
  checklist: SubCheckItem[];
  onUpdateChecklist: (updater: (prev: SubCheckItem[]) => SubCheckItem[]) => void;
  onToggleComplete: () => void;
  onStartEdit: () => void;
  onOpenSource: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const GoogleCalendarEventDetailView: React.FC<GoogleCalendarEventDetailViewProps> = ({
  item,
  subItem,
  mobileTab,
  checklist,
  onUpdateChecklist,
  onToggleComplete,
  onStartEdit,
  onOpenSource,
  onTouchStart,
  onTouchEnd,
}) => {
  const activeColor = getGoogleCategoryColor(item.categoryId, item.isInProgress && !item.isCompleted);

  return (
    <>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#dadce0] min-h-[300px] touch-pan-y"
      >
        {/* 좌측 컬럼: 일정 기본 정보 (제목, 일시, 상태 뱃지, 메모) */}
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

          {/* 일시 및 진행중/완료 상태 뱃지 */}
          <div className="flex items-center gap-3 text-xs text-[#3c4043] flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#5f6368] shrink-0" />
              <span>
                {item.dueDate}
                {item.endDate ? ` ~ ${item.endDate}` : ''}{' '}
                {item.dueTime ? `· ${item.dueTime}` : '· 종일'}
              </span>
            </div>
            {item.isInProgress && !item.isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                진행중 (종일 상시 노출)
              </span>
            )}
            {item.isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                완료됨
              </span>
            )}
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

        {/* 우측 컬럼: 하위할일(체크리스트) 전용 패널 */}
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
      <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#dadce0] flex items-center justify-between gap-2">
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
      </div>
    </>
  );
};
