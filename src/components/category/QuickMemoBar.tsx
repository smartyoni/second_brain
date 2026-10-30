import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QuickMemoSegment } from '../../types';

interface QuickMemoBarProps {
  activeSegment: QuickMemoSegment;
  onSelectSegment: (segment: QuickMemoSegment) => void;
  onOpenModal: () => void;
  memoCount: number;
  isQuickMemoTab?: boolean;
}

export const QuickMemoBar: React.FC<QuickMemoBarProps> = ({
  activeSegment,
  onSelectSegment,
  onOpenModal,
  memoCount,
  isQuickMemoTab = true,
}) => {
  const { appMode, setAppMode, selectTopCategory } = useWorkspace();

  const handleSelectMove = () => {
    setAppMode('workspace');
    selectTopCategory('top-1');
    onSelectSegment('move');
  };

  const handleSelectMemo = () => {
    setAppMode('workspace');
    selectTopCategory('top-1');
    onSelectSegment('memo');
    onOpenModal();
  };

  const handleSelectCalendar = () => {
    setAppMode('calendar');
  };

  const isMoveActive = appMode === 'workspace' && isQuickMemoTab && activeSegment === 'move';
  const isMemoActive = appMode === 'workspace' && isQuickMemoTab && activeSegment === 'memo';
  const isCalendarActive = appMode === 'calendar';

  return (
    <div className="flex items-center justify-between px-2 py-1.5 bg-slate-100 border-b border-slate-300 shrink-0 select-none gap-1">
      {/* 좌측 세그먼트: [ 퀵메모이동 | 퀵메모 | 캘린더 ] 통합 */}
      <div className="flex items-center bg-slate-200 border border-slate-300 p-0.5 rounded-md text-[11px] font-medium whitespace-nowrap">
        <button
          type="button"
          onClick={handleSelectMove}
          className={`px-2 py-1 rounded transition-all cursor-pointer ${
            isMoveActive
              ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-300'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
          }`}
          title="퀵메모를 다른 카테고리로 분류 및 이동"
        >
          <span>퀵메모이동</span>
        </button>

        <button
          type="button"
          onClick={handleSelectMemo}
          className={`px-2 py-1 rounded transition-all cursor-pointer ${
            isMemoActive
              ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-300'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
          }`}
          title="클릭하여 퀵메모 작성 모달 열기"
        >
          <span>퀵메모</span>
        </button>

        <button
          type="button"
          onClick={handleSelectCalendar}
          className={`px-2 py-1 rounded transition-all cursor-pointer ${
            isCalendarActive
              ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-300'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
          }`}
          title="독립 캘린더 화면으로 전환"
        >
          <span>캘린더</span>
        </button>
      </div>

      {/* 우측: 현재 미분류 퀵메모 개수 표시 */}
      <div className="text-[11px] text-slate-600 font-medium whitespace-nowrap shrink-0">
        메모 <span className="text-blue-700 font-bold">{memoCount}</span>건
      </div>
    </div>
  );
};
