import React from 'react';
import { Plus, Check } from 'lucide-react';
import { GoogleMiniCalendar } from './GoogleMiniCalendar';
import { TopCategory, CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

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
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  onOpenCreateModal: () => void;
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
  showCompleted,
  onToggleShowCompleted,
  onOpenCreateModal,
}) => {
  if (!isOpen) return null;

  const isAllSelected = selectedFilterKeys.length === 0;
  const isCalendarChecked = selectedFilterKeys.includes('calendar');
  const calendarCount = allItems.filter((i) => i.sourceType === 'calendar').length;

  return (
    <aside className="w-64 shrink-0 h-full bg-white border-r border-[#dadce0] flex flex-col select-none overflow-y-auto px-3 py-4 space-y-4">
      {/* 1. 구글 시그니처 '+ 만들기' 알약 버튼 */}
      <div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-[#f8f9fa] text-[#3c4043] font-medium text-sm rounded-full shadow-md hover:shadow-lg border border-[#dadce0] transition-all cursor-pointer active:bg-[#f1f3f4]"
        >
          <div className="w-6 h-6 relative flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <span className="font-semibold tracking-wide">만들기</span>
        </button>
      </div>

      {/* 2. 구글 미니 달력 */}
      <div className="pb-2">
        <GoogleMiniCalendar
          currentDateObj={currentDateObj}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      </div>

      {/* 3. 내 캘린더 (카테고리 및 일정 필터) */}
      <div className="space-y-1">
        <div className="px-2 mb-2 text-[#3c4043]">
          <span className="text-sm font-semibold">내 캘린더</span>
        </div>

        {/* 3-1. [최상단] 캘린더 직접 생성 '일정' */}
        <div
          onClick={() => onToggleFilterKey('calendar')}
          className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#f1f3f4] cursor-pointer group transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors border ${
                isCalendarChecked
                  ? 'bg-[#1a73e8] border-transparent text-white'
                  : 'border-[#5f6368] bg-transparent'
              }`}
            >
              {isCalendarChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs text-[#3c4043] truncate font-medium group-hover:text-[#202124]">
              일정
            </span>
          </div>
          {calendarCount > 0 && (
            <span className="text-[11px] text-[#70757a] font-medium pr-1">
              {calendarCount}
            </span>
          )}
        </div>

        {/* 3-2. [중간] 15개 최상위 대분류 목록 */}
        <div className="space-y-0.5 border-t border-b border-[#dadce0]/70 py-1 my-1">
          {topCategories.map((cat) => {
            const isChecked = selectedFilterKeys.includes(cat.id);
            const color = getGoogleCategoryColor(cat.id);
            const count = allItems.filter(
              (i) => i.topCategoryId === cat.id && i.sourceType !== 'calendar'
            ).length;

            return (
              <div
                key={cat.id}
                onClick={() => onToggleFilterKey(cat.id)}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#f1f3f4] cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors border ${
                      isChecked
                        ? `${color.bg} border-transparent text-white`
                        : 'border-[#5f6368] bg-transparent'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span className="text-xs text-[#3c4043] truncate font-normal group-hover:text-[#202124]">
                    {cat.name}
                  </span>
                </div>

                {count > 0 && (
                  <span className="text-[11px] text-[#70757a] font-medium pr-1">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 3-3. [최하단] 모든 일정 '전체' */}
        <div
          onClick={onSelectAll}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#f1f3f4] cursor-pointer group transition-colors ${
            isAllSelected ? 'bg-[#e8f0fe]/60' : ''
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors border ${
                isAllSelected
                  ? 'bg-[#1a73e8] border-transparent text-white'
                  : 'border-[#5f6368] bg-transparent'
              }`}
            >
              {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs text-[#3c4043] truncate font-semibold group-hover:text-[#202124]">
              전체
            </span>
          </div>
          {allItems.length > 0 && (
            <span className="text-[11px] text-[#70757a] font-medium pr-1">
              {allItems.length}
            </span>
          )}
        </div>
      </div>

      {/* 4. 완료된 할 일 보기 설정 */}
      <div className="pt-2 border-t border-[#dadce0]">
        <div
          onClick={onToggleShowCompleted}
          className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#f1f3f4] cursor-pointer"
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
          <span className="text-xs text-[#3c4043]">완료된 일정 표시</span>
        </div>
      </div>
    </aside>
  );
};
