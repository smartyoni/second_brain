import React, { useMemo } from 'react';
import { CalendarScheduleItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getGoogleCategoryColor, getTodayDateStr } from '../../utils/googleCalendarUtils';
import { SmartText } from '../shared/SmartText';
import { ListTodo, Calendar, Clock, Plus, Folder } from 'lucide-react';

interface GoogleCalendarTodoViewProps {
  items: CalendarScheduleItem[];
  onSelectItem: (item: CalendarScheduleItem) => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
  onCellClick?: (dateStr: string, time?: string, isAllDay?: boolean) => void;
}

export const GoogleCalendarTodoView: React.FC<GoogleCalendarTodoViewProps> = ({
  items,
  onSelectItem,
  onContextMenu,
  onCellClick,
}) => {
  const { categoryItems } = useWorkspace();
  const todayStr = useMemo(() => getTodayDateStr(), []);

  // 진행중(isInProgress && !isCompleted) 일정 목록 필터링 및 정렬
  const ongoingItems = useMemo(() => {
    return items
      .filter((item) => !!item.isInProgress && !item.isCompleted)
      .sort((a, b) => {
        // 1. 마감일 있는 항목 우선 (빠른 날짜순)
        if (a.dueDate && b.dueDate) {
          if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
          return (a.dueTime || '').localeCompare(b.dueTime || '');
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        // 2. 마감일 없는 항목은 제목 오름차순
        return a.title.localeCompare(b.title);
      });
  }, [items]);

  const getCategoryName = (catId?: string) => {
    if (!catId) return '';
    const found = categoryItems.find((c) => c.id === catId);
    return found?.name || '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 select-none">
      {/* 상단 요약 바 */}
      <div className="px-3.5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-red-100 text-red-600">
            <ListTodo className="w-3.5 h-3.5" />
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-slate-800">진행중 일정</span>
            <span className="text-xs font-bold text-red-600">
              {ongoingItems.length}
            </span>
          </div>
        </div>

        {onCellClick && (
          <button
            type="button"
            onClick={() => onCellClick(todayStr, '10:00', false)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
            title="새 일정 추가"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 일정</span>
          </button>
        )}
      </div>

      {/* 진행중 일정 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {ongoingItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <ListTodo className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              진행중인 일정이 없습니다
            </p>
            <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
              일정 상세나 우클릭 메뉴에서 상태를 <span className="text-red-500 font-semibold">[진행중]</span>으로 설정하면 여기에 모아서 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          ongoingItems.map((item) => {
            const colorTheme = getGoogleCategoryColor(item.categoryId, true);
            const catName = getCategoryName(item.categoryId);
            const isOverdue = !!(item.dueDate && item.dueDate < todayStr);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContextMenu?.(item, e);
                }}
                className="p-3 bg-white border border-slate-200 hover:border-red-300 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col gap-1.5"
              >
                {/* 상단: 카테고리 도트 + 진행중 뱃지 + 제목 */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colorTheme.rawHex }}
                  />
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shrink-0">
                    진행중
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-red-700 truncate flex-1 min-w-0">
                    <SmartText text={item.title} />
                  </h4>
                </div>

                {/* 하단 메타 정보 (마감일, 시간, 카테고리) */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 pl-4.5">
                  {item.dueDate ? (
                    <span
                      className={`inline-flex items-center gap-1 ${
                        isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {item.dueDate}
                        {item.endDate ? ` ~ ${item.endDate}` : ''}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-rose-50 text-rose-600 font-bold border border-rose-200">
                          기한 경과
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>기한 없음</span>
                    </span>
                  )}

                  {item.dueTime && (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {item.dueTime}
                        {item.endTime ? `~${item.endTime}` : ''}
                      </span>
                    </span>
                  )}

                  {catName && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded ml-auto">
                      <Folder className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[100px]">{catName}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
