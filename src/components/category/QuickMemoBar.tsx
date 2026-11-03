import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QuickMemoSegment } from '../../types';

interface QuickMemoBarProps {
  activeSegment: QuickMemoSegment;
  onSelectSegment: (segment: QuickMemoSegment) => void;
  onOpenModal: () => void;
  memoCount?: number;
  isQuickMemoTab?: boolean;
}

export const QuickMemoBar: React.FC<QuickMemoBarProps> = ({
  activeSegment,
  onSelectSegment,
  onOpenModal,
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
    <div className="flex items-center px-2 py-1.5 bg-slate-100 border-b border-slate-300 shrink-0 select-none">
      {/* 3등분 세그먼트: [ 퀵메모이동 | 퀵메모 | 캘린더 ] 통합 */}
      <div className="w-full flex items-center bg-slate-200 border border-slate-300 p-0.5 rounded-md text-[11px] font-medium whitespace-nowrap">
        <button
          type="button"
          onClick={handleSelectMove}
          className={`flex-1 py-1 px-1.5 text-center rounded transition-all cursor-pointer ${
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
          className={`flex-1 py-1 px-1.5 text-center rounded transition-all cursor-pointer ${
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
          className={`flex-1 py-1 px-1.5 text-center rounded transition-all cursor-pointer ${
            isCalendarActive
              ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-300'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
          }`}
          title="독립 캘린더 화면으로 전환"
        >
          <span>캘린더</span>
        </button>
      </div>
    </div>
  );
};
