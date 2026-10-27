import React from 'react';
import { SubItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

interface DetailHeaderProps {
  subItem?: SubItem;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ subItem }) => {
  const { jumpedFromCalendar, returnToCalendar, setAppMode } = useWorkspace();

  return (
    <div className="h-9 px-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs shrink-0 select-none">
      {/* 좌측: 문서 제목 */}
      <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
        <h2 className="font-bold text-slate-900 text-sm truncate">
          {subItem?.title || '선택된 문서 없음'}
        </h2>
      </div>

      {/* 우측: 캘린더 복귀 버튼 */}
      <div className="shrink-0 flex items-center gap-1.5">
        {jumpedFromCalendar ? (
          <button
            type="button"
            onClick={returnToCalendar}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer animate-in fade-in zoom-in-95"
            title="방금 보던 전체 캘린더의 해당 일정 위치로 복귀"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>보던 캘린더로 돌아가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAppMode('calendar')}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-slate-200/70 border border-slate-300 rounded text-[11px] font-semibold transition-colors cursor-pointer"
            title="전체 캘린더 화면 열기"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>캘린더</span>
          </button>
        )}
      </div>
    </div>
  );
};
