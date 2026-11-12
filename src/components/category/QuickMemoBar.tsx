import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QuickMemoSegment } from '../../types';
import { GoogleCalendarQuickCreateModal } from '../googlecalendar/GoogleCalendarQuickCreateModal';
import { getTodayDateStr } from '../../utils/googleCalendarUtils';

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
  const { appMode, setAppMode, goToCurrentQuickMemoCategory, selectedCalendarDate } = useWorkspace();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleSelectMove = () => {
    goToCurrentQuickMemoCategory();
    onSelectSegment('move');
  };

  const handleSelectMemo = () => {
    onSelectSegment('memo');
    onOpenModal();
  };

  const handleToggleMode = () => {
    setAppMode(appMode === 'calendar' ? 'workspace' : 'calendar');
  };

  const handleOpenScheduleCreate = () => {
    // 지식보관소 모드를 벗어나지 않고 현재 화면을 유지한 채 일정 입력 모달 열기
    setIsScheduleModalOpen(true);
  };

  const isMoveActive = appMode === 'workspace' && isQuickMemoTab && activeSegment === 'memo';
  const isMemoActive = activeSegment === 'memo';

  return (
    <>
      <div className="w-full flex items-center px-0 shrink-0 select-none">
        {/* 4등분 사각형 각진 세그먼트: [ 퀵메모이동 | 퀵메모 | 캘린더/지식보관소 | 일정 ] */}
        <div className="w-full grid grid-cols-4 border border-slate-300 rounded-none text-[11px] font-medium whitespace-nowrap">
          <button
            type="button"
            onClick={handleSelectMove}
            className={`py-1.5 px-1 text-center rounded-none transition-all cursor-pointer border-r border-slate-300 ${
              isMoveActive
                ? 'bg-white text-blue-700 font-bold'
                : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
            title="퀵메모를 다른 카테고리로 분류 및 이동"
          >
            <span>퀵메모이동</span>
          </button>

          <button
            type="button"
            onClick={handleSelectMemo}
            className={`py-1.5 px-1 text-center rounded-none transition-all cursor-pointer border-r border-slate-300 ${
              isMemoActive
                ? 'bg-white text-blue-700 font-bold'
                : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
            title="클릭하여 퀵메모 작성 모달 열기"
          >
            <span>퀵메모</span>
          </button>

          {/* 지식보관소 ↔ 캘린더 모드 전환 버튼 */}
          <button
            type="button"
            onClick={handleToggleMode}
            className={`py-1.5 px-1 text-center rounded-none transition-all cursor-pointer border-r border-slate-300 ${
              appMode === 'calendar'
                ? 'bg-blue-600 text-white font-bold hover:bg-blue-700'
                : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
            title={appMode === 'calendar' ? '지식보관소 모드로 전환' : '캘린더 모드로 전환'}
          >
            <span>{appMode === 'calendar' ? '지식보관소' : '캘린더'}</span>
          </button>

          {/* 일정 추가 버튼 (라벨: "일정") */}
          <button
            type="button"
            onClick={handleOpenScheduleCreate}
            className="py-1.5 px-1 text-center rounded-none transition-all cursor-pointer bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300"
            title="새 일정 추가"
          >
            <span>일정</span>
          </button>
        </div>
      </div>

      <GoogleCalendarQuickCreateModal
        createState={{
          isOpen: isScheduleModalOpen,
          date: selectedCalendarDate || getTodayDateStr(),
          time: '10:00',
          isAllDay: false,
        }}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </>
  );
};
