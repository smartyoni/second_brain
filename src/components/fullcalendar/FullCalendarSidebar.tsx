import React from 'react';
import { ArrowLeft, CheckCircle2, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { MiniCalendar } from './MiniCalendar';
import { CategoryItem, CalendarScheduleItem } from '../../types';
import { getCategoryColor } from '../../utils/calendarUtils';

interface FullCalendarSidebarProps {
  onBackToWorkspace: () => void;
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
}

export const FullCalendarSidebar: React.FC<FullCalendarSidebarProps> = ({
  onBackToWorkspace,
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
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = allItems.filter((i) => i.dueDate === todayStr).length;
  const completedCount = allItems.filter((i) => i.isCompleted).length;

  // 카테고리별 일정 건수 매핑
  const categoryCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    allItems.forEach((item) => {
      if (item.categoryId) {
        map[item.categoryId] = (map[item.categoryId] || 0) + 1;
      }
    });
    return map;
  }, [allItems]);

  // 일정이 존재하는 카테고리 우선 정렬
  const sortedCategories = React.useMemo(() => {
    return [...categoryItems].sort((a, b) => {
      const countA = categoryCountMap[a.id] || 0;
      const countB = categoryCountMap[b.id] || 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [categoryItems, categoryCountMap]);

  return (
    <aside className="w-72 shrink-0 h-full bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden select-none">
      {/* 1. 상단: 지식보관소 복귀 헤더 바 */}
      <div className="p-3 bg-white border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={onBackToWorkspace}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>지식보관소(4패널)로 복귀</span>
        </button>
      </div>

      {/* 사이드바 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 2. 미니 캘린더 */}
        <MiniCalendar
          currentDateObj={currentDateObj}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />

        {/* 3. 일정 요약 카드 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg text-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>일정 통계</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
              <div className="text-[10px] text-slate-500">전체</div>
              <div className="text-sm font-bold text-slate-800">{allItems.length}</div>
            </div>
            <div className="bg-blue-50 p-1.5 rounded border border-blue-100">
              <div className="text-[10px] text-blue-600">오늘</div>
              <div className="text-sm font-bold text-blue-700">{todayCount}</div>
            </div>
            <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
              <div className="text-[10px] text-emerald-600">완료</div>
              <div className="text-sm font-bold text-emerald-700">{completedCount}</div>
            </div>
          </div>
        </div>

        {/* 4. 카테고리 필터 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>카테고리 필터</span>
            </div>
            <button
              type="button"
              onClick={onSelectAllCategories}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              전체 선택
            </button>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {sortedCategories.map((cat) => {
              const isChecked =
                selectedCategoryIds.length === 0 || selectedCategoryIds.includes(cat.id);
              const count = categoryCountMap[cat.id] || 0;
              const color = getCategoryColor(cat.id);

              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCategoryFilter(cat.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                    <span className="truncate text-[11px] text-slate-700 group-hover:text-slate-950 font-medium">
                      {cat.name}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full font-semibold shrink-0">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* 5. 완료된 항목 토글 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={onToggleShowCompleted}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
            />
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-medium">완료된 일정 포함하기</span>
          </label>
        </div>
      </div>
    </aside>
  );
};
