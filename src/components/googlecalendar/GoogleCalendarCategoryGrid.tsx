import React from 'react';
import { TopCategory, CalendarScheduleItem } from '../../types';

interface GoogleCalendarCategoryGridProps {
  topCategories: TopCategory[];
  allItems: CalendarScheduleItem[];
  selectedFilterKeys: string[];
  onToggleFilterKey: (key: string) => void;
}

export const GoogleCalendarCategoryGrid: React.FC<GoogleCalendarCategoryGridProps> = ({
  topCategories,
  allItems,
  selectedFilterKeys,
  onToggleFilterKey,
}) => {
  const isAllSelected = selectedFilterKeys.length === 0;
  const isNoneSelected = selectedFilterKeys.includes('__none__');

  return (
    <div className="w-full border border-slate-300 rounded-md overflow-hidden bg-white select-none shadow-xs">
      <div className="grid grid-cols-5 gap-0 text-[11px] w-full">
        {topCategories.slice(0, 15).map((cat, index) => {
          const isQuickMemo = cat.id === 'top-1' || index === 0;
          const isKeyIncluded = !isNoneSelected && selectedFilterKeys.includes(cat.id);
          // 전체 선택 상태이거나, 개별 선택된 경우 활성 상태
          const isFilterActive = isAllSelected || isKeyIncluded;
          const isIndividuallySelected = !isAllSelected && !isNoneSelected && isKeyIncluded;

          // 지식보관소와 동일한 행별 배경 톤
          const rowToneClass = isQuickMemo
            ? 'bg-blue-100 hover:bg-blue-200/90 text-blue-950 font-bold'
            : index < 5
            ? 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 font-semibold'
            : index < 10
            ? 'bg-emerald-100 hover:bg-emerald-200/90 text-emerald-950 font-semibold'
            : 'bg-purple-100 hover:bg-purple-200/90 text-purple-950 font-semibold';

          // 필터 상태에 따른 스타일
          const activeClass = isFilterActive
            ? isIndividuallySelected
              ? 'bg-white text-blue-700 font-bold ring-2 ring-blue-600 ring-inset z-10 shadow-xs'
              : rowToneClass
            : 'bg-slate-50/70 text-slate-400 opacity-40 hover:opacity-75 hover:bg-slate-100';

          // 오른쪽 끝 열(4, 9, 14) border-r 제외, 마지막 행(10~14) border-b 제외
          const isRightEdge = (index + 1) % 5 === 0;
          const isBottomEdge = index >= 10;

          // 해당 카테고리의 일정 개수
          const count = allItems.filter(
            (i) => i.topCategoryId === cat.id && i.sourceType !== 'calendar'
          ).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleFilterKey(cat.id)}
              title={`${cat.name}${count > 0 ? ` (${count}개)` : ''}`}
              className={`h-7 px-0.5 relative flex items-center justify-center text-center cursor-pointer transition-all truncate ${activeClass} ${
                !isRightEdge ? 'border-r border-slate-300' : ''
              } ${!isBottomEdge ? 'border-b border-slate-300' : ''}`}
            >
              <span className="truncate text-[10.5px] px-0.5 leading-none">
                {cat.name}
              </span>
              {count > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                    isFilterActive ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
