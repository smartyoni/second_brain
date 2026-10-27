import React from 'react';
import { Plus, Check } from 'lucide-react';
import { GoogleMiniCalendar } from './GoogleMiniCalendar';
import { CategoryItem, CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

interface GoogleCalendarSidebarProps {
  isOpen: boolean;
  currentDateObj: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  allItems: CalendarScheduleItem[];
  categoryItems: CategoryItem[];
  selectedCategoryIds: string[];
  onToggleCategoryFilter: (catId: string) => void;
  onSelectAllCategories: () => void;
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
  categoryItems,
  selectedCategoryIds,
  onToggleCategoryFilter,
  onSelectAllCategories,
  showCompleted,
  onToggleShowCompleted,
  onOpenCreateModal,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-64 shrink-0 h-full bg-white border-r border-[#dadce0] flex flex-col select-none overflow-y-auto px-3 py-4 space-y-5">
      {/* 1. 구글 시그니처 '+ 만들기' 알약 버튼 */}
      <div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-[#f8f9fa] text-[#3c4043] font-medium text-sm rounded-full shadow-md hover:shadow-lg border border-[#dadce0] transition-all cursor-pointer active:bg-[#f1f3f4]"
        >
          {/* 구글 4색 플러스 아이콘 모양 */}
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

      {/* 3. 내 캘린더 (카테고리 필터) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 text-[#3c4043]">
          <span className="text-sm font-medium">내 캘린더</span>
          <button
            type="button"
            onClick={onSelectAllCategories}
            className="text-[11px] text-[#1a73e8] hover:underline cursor-pointer"
          >
            전체 선택
          </button>
        </div>

        <div className="space-y-0.5">
          {categoryItems.map((cat) => {
            const isChecked =
              selectedCategoryIds.length === 0 || selectedCategoryIds.includes(cat.id);
            const color = getGoogleCategoryColor(cat.id);
            const count = allItems.filter((i) => i.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => onToggleCategoryFilter(cat.id)}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#f1f3f4] cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* 구글 머티리얼 스타일 커스텀 체크박스 */}
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
