import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CalendarScheduleItem, TopCategory } from '../../types';
import { CalendarMobilePanel, GoogleCalendarMobileNavBar } from './GoogleCalendarMobileNavBar';
import { GoogleCalendarMonthGrid } from './GoogleCalendarMonthGrid';
import { GoogleCalendarRightPanel, CalendarSideViewType } from './GoogleCalendarRightPanel';
import { GoogleCalendarSidebar } from './GoogleCalendarSidebar';

interface GoogleCalendarMobileViewProps {
  mobilePanel: CalendarMobilePanel;
  onChangePanel: (panel: CalendarMobilePanel) => void;
  currentDateObj: Date;
  selectedDate: string;
  items: CalendarScheduleItem[];
  draggedItem: CalendarScheduleItem | null;
  sideViewType: CalendarSideViewType;
  onSideViewTypeChange: (type: CalendarSideViewType) => void;
  onSelectDate: (dateStr: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onCellClick: (dateStr: string, time?: string, isAllDay?: boolean) => void;
  onDragStart: (item: CalendarScheduleItem, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnDate: (dateStr: string) => void;
  onDropOnTime?: (targetDate: string, targetTime: string) => void;
  onDropAllDay?: (targetDate: string) => void;
  onDragEnd: () => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
  allItems: CalendarScheduleItem[];
  topCategories: TopCategory[];
  selectedFilterKeys: string[];
  onToggleFilterKey: (key: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  onBackToWorkspace?: () => void;
}

export const GoogleCalendarMobileView: React.FC<GoogleCalendarMobileViewProps> = ({
  mobilePanel,
  onChangePanel,
  currentDateObj,
  selectedDate,
  items,
  draggedItem,
  sideViewType,
  onSideViewTypeChange,
  onSelectDate,
  onSelectItem,
  onCellClick,
  onDragStart,
  onDragOver,
  onDropOnDate,
  onDropOnTime,
  onDropAllDay,
  onDragEnd,
  onContextMenu,
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
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-white">
      {/* 1. 패널 본문 영역 */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* 패널 A: 월간 달력 */}
        {mobilePanel === 'month' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <GoogleCalendarMonthGrid
              currentDateObj={currentDateObj}
              selectedDate={selectedDate}
              items={items}
              draggedItem={draggedItem}
              onSelectDate={onSelectDate}
              onSelectItem={onSelectItem}
              onCellClick={onCellClick}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDropOnDate={onDropOnDate}
              onDragEnd={onDragEnd}
              onContextMenu={onContextMenu}
              onDateClickMobile={(dateStr) => {
                onSelectDate(dateStr);
                onChangePanel('detail');
              }}
            />
          </div>
        )}

        {/* 패널 B: 상세 일정 (일간/3일/주간/일정 뷰) */}
        {mobilePanel === 'detail' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            {/* 뒤로가기 네비게이션 바 */}
            <div className="h-9 px-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0 select-none">
              <button
                type="button"
                onClick={() => onChangePanel('month')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>월간 달력으로</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <GoogleCalendarRightPanel
                sideViewType={sideViewType}
                onSideViewTypeChange={onSideViewTypeChange}
                currentDateObj={currentDateObj}
                selectedDate={selectedDate}
                items={items}
                onSelectDate={onSelectDate}
                onSelectItem={onSelectItem}
                onCellClick={onCellClick}
                draggedItem={draggedItem}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDropOnTime={onDropOnTime || (() => {})}
                onDropAllDay={onDropAllDay || (() => {})}
                onDragEnd={onDragEnd}
                onClose={() => onChangePanel('month')}
                onContextMenu={onContextMenu}
              />
            </div>
          </div>
        )}

        {/* 패널 C: 메뉴 & 필터 (미니 달력, 15칸 그리드, 지식보관소 이동) */}
        {mobilePanel === 'sidebar' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            {/* 뒤로가기 네비게이션 바 */}
            <div className="h-9 px-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0 select-none">
              <button
                type="button"
                onClick={() => onChangePanel('month')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>월간 달력으로</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GoogleCalendarSidebar
                isOpen={true}
                currentDateObj={currentDateObj}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  onSelectDate(d);
                  onChangePanel('detail');
                }}
                allItems={allItems}
                topCategories={topCategories}
                selectedFilterKeys={selectedFilterKeys}
                onToggleFilterKey={onToggleFilterKey}
                onSelectAll={onSelectAll}
                onClearAll={onClearAll}
                showCompleted={showCompleted}
                onToggleShowCompleted={onToggleShowCompleted}
                onBackToWorkspace={onBackToWorkspace}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. 모바일 하단 네비게이션 바 */}
      <GoogleCalendarMobileNavBar
        activePanel={mobilePanel}
        onChangePanel={onChangePanel}
        selectedDate={selectedDate}
      />
    </div>
  );
};
