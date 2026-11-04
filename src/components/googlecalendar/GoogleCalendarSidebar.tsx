import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { GoogleMiniCalendar } from './GoogleMiniCalendar';
import { GoogleCalendarCategoryGrid } from './GoogleCalendarCategoryGrid';
import { QuickMemoBar } from '../category/QuickMemoBar';
import { QuickMemoModal } from '../category/QuickMemoModal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TopCategory, CalendarScheduleItem, QuickMemoSegment } from '../../types';

interface GoogleCalendarSidebarProps {
  isOpen: boolean;
  currentDateObj: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  allItems: CalendarScheduleItem[];
  topCategories: TopCategory[];
  selectedFilterKeys: string[];
  onToggleFilterKey: (key: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  onOpenCreateModal?: () => void;
  onBackToWorkspace?: () => void;
}

export const GoogleCalendarSidebar: React.FC<GoogleCalendarSidebarProps> = ({
  isOpen,
  currentDateObj,
  selectedDate,
  onSelectDate,
  allItems,
  topCategories,
  selectedFilterKeys,
  onToggleFilterKey,
  onSelectAll,
  onClearAll,
  showCompleted,
  onToggleShowCompleted,
}) => {
  const { quickMemos, addQuickMemo } = useWorkspace();
  const [activeSegment, setActiveSegment] = useState<QuickMemoSegment>('memo');
  const [isQuickMemoOpen, setIsQuickMemoOpen] = useState(false);

  if (!isOpen) return null;

  const isAllSelected = selectedFilterKeys.length === 0;
  const isNoneSelected = selectedFilterKeys.includes('__none__');
  const isCalendarChecked =
    (!isNoneSelected && isAllSelected) || selectedFilterKeys.includes('calendar');
  const isCalendarIndividuallySelected =
    !isAllSelected && !isNoneSelected && selectedFilterKeys.includes('calendar');
  const calendarCount = allItems.filter((i) => i.sourceType === 'calendar').length;

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

      {/* 3. 내 캘린더 (대분류 5x3 그리드 및 일정 필터) */}
      <div className="space-y-2 pt-1 border-t border-[#dadce0]">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-[#3c4043]">내 캘린더</span>
          <div className="flex items-center gap-1">
            {/* 전체 토글 버튼 */}
            <button
              type="button"
              onClick={onSelectAll}
              title="모든 일정 및 카테고리 표시"
              className={`px-1.5 py-0.5 text-[11px] rounded transition-all cursor-pointer ${
                isAllSelected
                  ? 'bg-[#1a73e8] text-white font-semibold shadow-xs'
                  : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
              }`}
            >
              전체
            </button>

            {/* 해제 버튼 (선택된 그리드 초기화/모두 끄기) */}
            <button
              type="button"
              onClick={onClearAll}
              title="그리드 선택 모두 해제"
              className={`px-1.5 py-0.5 text-[11px] rounded transition-all cursor-pointer ${
                isNoneSelected
                  ? 'bg-[#5f6368] text-white font-semibold shadow-xs'
                  : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
              }`}
            >
              해제
            </button>

            {/* 캘린더 고유 일정 토글 버튼 */}
            <button
              type="button"
              onClick={() => onToggleFilterKey('calendar')}
              title="캘린더 직접 등록 일정 토글"
              className={`px-1.5 py-0.5 text-[11px] rounded transition-all cursor-pointer flex items-center gap-0.5 border ${
                isCalendarIndividuallySelected
                  ? 'bg-white text-[#1a73e8] border-[#1a73e8] font-bold shadow-xs'
                  : isCalendarChecked
                  ? 'bg-[#e8f0fe] text-[#1a73e8] border-transparent font-medium'
                  : 'bg-[#f1f3f4] text-[#5f6368] border-transparent hover:bg-[#e8eaed]'
              }`}
            >
              <span>일정</span>
              {calendarCount > 0 && (
                <span className="text-[10px] opacity-75">({calendarCount})</span>
              )}
            </button>
          </div>
        </div>

        {/* 15개 최상위 대분류 5x3 그리드 */}
        <GoogleCalendarCategoryGrid
          topCategories={topCategories}
          allItems={allItems}
          selectedFilterKeys={selectedFilterKeys}
          onToggleFilterKey={onToggleFilterKey}
        />
      </div>

      {/* 4. 완료된 할 일 보기 설정 */}
      <div className="pt-2 border-t border-[#dadce0]">
        <div
          onClick={onToggleShowCompleted}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#f1f3f4] cursor-pointer transition-colors"
        >
          <div
            className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors border ${
              showCompleted
                ? 'bg-[#1a73e8] border-transparent text-white'
                : 'border-[#5f6368] bg-transparent'
            }`}
          >
            {showCompleted && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-xs text-[#3c4043] font-medium">완료된 할 일 보기</span>
        </div>
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
