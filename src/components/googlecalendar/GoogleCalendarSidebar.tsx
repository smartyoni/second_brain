import React, { useState } from 'react';
import { GoogleMiniCalendar } from './GoogleMiniCalendar';
import { QuickMemoBar } from '../category/QuickMemoBar';
import { QuickMemoModal } from '../category/QuickMemoModal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TopCategory, CalendarScheduleItem, QuickMemoSegment } from '../../types';

interface GoogleCalendarSidebarProps {
  isOpen: boolean;
  currentDateObj: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  allItems?: CalendarScheduleItem[];
  topCategories?: TopCategory[];
  selectedFilterKeys?: string[];
  onToggleFilterKey?: (key: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  showCompleted?: boolean;
  onToggleShowCompleted?: () => void;
  onOpenCreateModal?: () => void;
  onBackToWorkspace?: () => void;
}

export const GoogleCalendarSidebar: React.FC<GoogleCalendarSidebarProps> = ({
  isOpen,
  currentDateObj,
  selectedDate,
  onSelectDate,
}) => {
  const { quickMemos, addQuickMemo } = useWorkspace();
  const [activeSegment, setActiveSegment] = useState<QuickMemoSegment>('memo');
  const [isQuickMemoOpen, setIsQuickMemoOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <aside className="w-full lg:w-[331px] shrink-0 h-full bg-white border-r border-[#dadce0] flex flex-col select-none overflow-y-auto px-3 py-3 space-y-3">
      {/* 1. 상단: [ 퀵메모이동 | 퀵메모 | 모드전환 ] 각진 사각 세그먼트바 */}
      <div className="w-full">
        <QuickMemoBar
          activeSegment={activeSegment}
          onSelectSegment={setActiveSegment}
          onOpenModal={() => setIsQuickMemoOpen(true)}
          memoCount={quickMemos.length}
          isQuickMemoTab={false}
        />
      </div>

      {/* 2. 구글 미니 달력 */}
      <div className="pb-1">
        <GoogleMiniCalendar
          currentDateObj={currentDateObj}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      </div>

      {/* 퀵메모 작성 모달 */}
      <QuickMemoModal
        isOpen={isQuickMemoOpen}
        onClose={() => setIsQuickMemoOpen(false)}
        onSave={addQuickMemo}
      />
    </aside>
  );
};
