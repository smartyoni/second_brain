import React from 'react';
import { Check, LayoutGrid } from 'lucide-react';
import { GoogleMiniCalendar } from './GoogleMiniCalendar';
import { GoogleCalendarCategoryGrid } from './GoogleCalendarCategoryGrid';
import { TopCategory, CalendarScheduleItem } from '../../types';

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
  onBackToWorkspace,
}) => {
  if (!isOpen) return null;

  const isAllSelected = selectedFilterKeys.length === 0;
  const isNoneSelected = selectedFilterKeys.includes('__none__');
  const isCalendarChecked =
    (!isNoneSelected && isAllSelected) || selectedFilterKeys.includes('calendar');
  const isCalendarIndividuallySelected =
    !isAllSelected && !isNoneSelected && selectedFilterKeys.includes('calendar');
  const calendarCount = allItems.filter((i) => i.sourceType === 'calendar').length;

  return (
    <aside className="w-64 shrink-0 h-full bg-white border-r border-[#dadce0] flex flex-col select-none overflow-y-auto px-3 py-3 space-y-3">
      {/* 1. 지식보관소 바로가기 버튼 */}
      {onBackToWorkspace && (
        <div>
          <button
            type="button"
            onClick={onBackToWorkspace}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-[#f8fafd] text-[#1a73e8] border border-[#d2e3fc] hover:border-[#1a73e8] rounded-full text-sm font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md active:bg-[#e8f0fe]"
            title="지식보관소로 이동"
          >
            <LayoutGrid className="w-4 h-4 text-[#1a73e8]" />
            <span className="tracking-wide">지식보관소</span>
          </button>
        </div>
      )}

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
          <span className="text-xs text-[#3c4043] font-medium">완료된 일정 표시</span>
        </div>
      </div>
    </aside>
  );
};
