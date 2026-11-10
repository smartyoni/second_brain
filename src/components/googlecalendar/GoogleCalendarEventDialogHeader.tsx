import React from 'react';
import { X, Trash2, Pencil, CheckSquare, FileText } from 'lucide-react';

interface GoogleCalendarEventDialogHeaderProps {
  isEditing: boolean;
  isCalendarOwnEvent: boolean;
  sourceType?: 'calendar' | 'checklist' | 'text';
  isInProgress?: boolean;
  isCompleted?: boolean;
  mobileTab: 'detail' | 'checklist';
  checklistCount: number;
  completedChecklistCount: number;
  onSelectMobileTab: (tab: 'detail' | 'checklist') => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const GoogleCalendarEventDialogHeader: React.FC<GoogleCalendarEventDialogHeaderProps> = ({
  isEditing,
  isCalendarOwnEvent,
  sourceType: _sourceType,
  isInProgress = false,
  isCompleted = false,
  mobileTab,
  checklistCount,
  completedChecklistCount,
  onSelectMobileTab,
  onStartEdit,
  onDelete,
  onClose,
}) => {
  return (
    <div className="bg-[#f8f9fa] border-b border-[#dadce0] select-none shrink-0">
      {/* 1. 상단 툴바: [타이틀 + 진행중/완료 뱃지] ... [수정] [삭제] [닫기] */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-[#5f6368] shrink-0">
            {isEditing ? '일정 수정' : '일정 세부정보'}
          </span>
          {isInProgress && !isCompleted && (
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
              진행중 (종일 상시 노출)
            </span>
          )}
          {isCompleted && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              완료됨
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isEditing && (
            <button
              type="button"
              onClick={onStartEdit}
              className="p-1.5 rounded-full hover:bg-slate-200 text-[#5f6368] hover:text-[#1a73e8] transition-colors cursor-pointer"
              title="일정 수정"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
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

      {/* 2. 모바일 전용 탭 전환 바 (md 이상에서는 숨김) */}
      <div className="md:hidden flex border-t border-[#dadce0] bg-white text-xs">
        <button
          type="button"
          onClick={() => onSelectMobileTab('detail')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
            mobileTab === 'detail'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold bg-blue-50/40'
              : 'border-transparent text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isEditing ? '수정' : '세부정보'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMobileTab('checklist')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
            mobileTab === 'checklist'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold bg-blue-50/40'
              : 'border-transparent text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>체크리스트</span>
          {checklistCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                mobileTab === 'checklist'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {completedChecklistCount > 0
                ? `${completedChecklistCount}/${checklistCount}`
                : checklistCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
