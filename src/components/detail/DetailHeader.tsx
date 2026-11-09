import React from 'react';
import { SubItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Calendar as CalendarIcon, ArrowRight, Plus } from 'lucide-react';
import { SmartText } from '../shared/SmartText';

interface DetailHeaderProps {
  subItem?: SubItem;
  onAddGroup?: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ subItem, onAddGroup }) => {
  const { jumpedFromCalendar, returnToCalendar } = useWorkspace();

  return (
    <div className="h-9 pl-3 pr-1 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs shrink-0 select-none">
      {/* 좌측: 문서 제목 */}
      <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1.5">
        <h2 className="font-bold text-slate-900 text-sm truncate">
          <SmartText text={subItem?.title || '선택된 문서 없음'} />
        </h2>
      </div>

      {/* 우측 액션 영역: 여백 최소화 (pr-1, gap-1) */}
      <div className="shrink-0 flex items-center gap-1">
        {jumpedFromCalendar && (
          <button
            type="button"
            onClick={returnToCalendar}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer animate-in fade-in zoom-in-95"
            title="방금 보던 전체 캘린더의 해당 일정 위치로 복귀"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>보던 캘린더로 돌아가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {onAddGroup && (
          <button
            type="button"
            onClick={onAddGroup}
            disabled={!subItem}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-200 active:bg-slate-300 rounded border border-slate-300 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="새 체크그룹 추가"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
            <span>추가</span>
          </button>
        )}
      </div>
    </div>
  );
};
