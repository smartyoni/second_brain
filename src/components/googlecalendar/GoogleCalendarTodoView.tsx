import React, { useMemo, useState } from 'react';
import { CalendarScheduleItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getGoogleCategoryColor, getTodayDateStr } from '../../utils/googleCalendarUtils';
import { SmartText } from '../shared/SmartText';
import { ListTodo, CheckCircle2, Calendar, Clock, Plus, Folder } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
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

  // 완료(isCompleted) 일정 목록 필터링 및 정렬 (최근 날짜순)
  const completedItems = useMemo(() => {
    return items
      .filter((item) => !!item.isCompleted)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          if (a.dueDate !== b.dueDate) return b.dueDate.localeCompare(a.dueDate);
          return (b.dueTime || '').localeCompare(a.dueTime || '');
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.title.localeCompare(b.title);
      });
  }, [items]);

  const isCompletedTab = activeTab === 'completed';
  const displayItems = isCompletedTab ? completedItems : ongoingItems;

  const getCategoryName = (catId?: string) => {
    if (!catId) return '';
    const found = categoryItems.find((c) => c.id === catId);
    return found?.name || '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 select-none">
      {/* 상단 세그먼트 탭 + 새 일정 버튼 바 */}
      <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="inline-flex items-center bg-[#f1f3f4] border border-[#dadce0] p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ongoing'
                ? 'bg-white text-red-600 font-bold shadow-xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
            }`}
          >
            <span>진행중</span>
            <span
              className={`text-[10px] font-bold ${
                activeTab === 'ongoing' ? 'text-red-600' : 'text-slate-500'
              }`}
            >
              {ongoingItems.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-700 font-bold shadow-xs border border-[#dadce0]'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-slate-200/50'
            }`}
          >
            <span>완료일정</span>
            <span
              className={`text-[10px] font-bold ${
                activeTab === 'completed' ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {completedItems.length}
            </span>
          </button>
        </div>

        {onCellClick && (
          <button
            type="button"
            onClick={() => onCellClick(todayStr, '10:00', false)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer shrink-0"
            title="새 일정 추가"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 일정</span>
          </button>
        )}
      </div>

      {/* 일정 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {displayItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              {isCompletedTab ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <ListTodo className="w-6 h-6" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              {isCompletedTab ? '완료된 일정이 없습니다' : '진행중인 일정이 없습니다'}
            </p>
            <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
              {isCompletedTab ? (
                '완료 처리한 일정이 여기에 표시되며, 클릭하거나 우클릭하여 상태를 되돌릴 수 있습니다.'
              ) : (
                <>
                  일정 상세나 우클릭 메뉴에서 상태를{' '}
                  <span className="text-red-500 font-semibold">[진행중]</span>으로 설정하면 여기에 모아서 확인할 수 있습니다.
                </>
              )}
            </p>
          </div>
        ) : (
          displayItems.map((item) => {
            const colorTheme = getGoogleCategoryColor(item.categoryId, true);
            const catName = getCategoryName(item.categoryId);
            const isOverdue = !isCompletedTab && !!(item.dueDate && item.dueDate < todayStr);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContextMenu?.(item, e);
                }}
                className={`p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col gap-1.5 ${
                  isCompletedTab ? 'hover:border-emerald-300' : 'hover:border-red-300'
                }`}
              >
                {/* 상단: 카테고리 도트 + 상태 뱃지 + 제목 */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colorTheme.rawHex }}
                  />
                  {isCompletedTab ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                      완료
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shrink-0">
                      진행중
                    </span>
                  )}
                  <h4
                    className={`text-sm font-semibold text-slate-800 truncate flex-1 min-w-0 ${
                      isCompletedTab
                        ? 'group-hover:text-emerald-700'
                        : 'group-hover:text-red-700'
                    }`}
                  >
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
