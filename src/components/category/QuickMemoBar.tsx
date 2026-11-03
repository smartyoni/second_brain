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
    // 캘린더 모드에서는 지식보관소로 튕기지 않고 현재 캘린더 모드를 유지한 채 퀵메모 모달 열기
    if (appMode === 'workspace') {
      selectTopCategory('top-1');
    }
    onSelectSegment('memo');
    onOpenModal();
  };

  const handleToggleMode = () => {
    setAppMode(appMode === 'calendar' ? 'workspace' : 'calendar');
  };

  const isMoveActive = appMode === 'workspace' && isQuickMemoTab && activeSegment === 'move';
  const isMemoActive = activeSegment === 'memo';

  return (
    <div className="flex items-center px-2 py-1.5 bg-slate-100 border-b border-slate-300 shrink-0 select-none">
      {/* 3등분 세그먼트: [ 퀵메모이동 | 퀵메모 | 캘린더/지식보관소 전환 ] */}
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

        {/* 지식보관소 ↔ 캘린더 모드 전환 버튼 */}
        <button
          type="button"
          onClick={handleToggleMode}
          className={`flex-1 py-1 px-1.5 text-center rounded transition-all cursor-pointer ${
            appMode === 'calendar'
              ? 'bg-blue-600 text-white font-bold shadow-xs hover:bg-blue-700'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
          }`}
          title={appMode === 'calendar' ? '지식보관소 모드로 전환' : '캘린더 모드로 전환'}
        >
          <span>{appMode === 'calendar' ? '지식보관소' : '캘린더'}</span>
        </button>
      </div>
    </div>
  );
};
