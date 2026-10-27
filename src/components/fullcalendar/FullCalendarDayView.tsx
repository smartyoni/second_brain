import React from 'react';
import { CalendarScheduleItem } from '../../types';
import { getCategoryColor, HOURS, formatHourLabel, parseTimeToMinutes } from '../../utils/calendarUtils';
import { CheckCircle } from 'lucide-react';

interface FullCalendarDayViewProps {
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectItem: (item: CalendarScheduleItem) => void;
  onToggleComplete: (groupId: string, itemId: string) => void;
}

export const FullCalendarDayView: React.FC<FullCalendarDayViewProps> = ({
  selectedDate,
  items,
  onSelectItem,
  onToggleComplete,
}) => {
  const dayItems = items.filter((i) => i.dueDate === selectedDate);
  const allDayItems = dayItems.filter((i) => !i.dueTime);
  const timedItems = dayItems.filter((i) => !!i.dueTime);

  // 시간순 정렬
  timedItems.sort((a, b) => {
    const minA = parseTimeToMinutes(a.dueTime) ?? 0;
    const minB = parseTimeToMinutes(b.dueTime) ?? 0;
    return minA - minB;
  });

  const dateObj = new Date(selectedDate);
  const formattedHeader = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : selectedDate;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto select-none p-6">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* 상단 일자 헤더 카드 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{formattedHeader}</h2>
            <p className="text-xs text-slate-500 mt-0.5">총 {dayItems.length}개의 일정이 등록되어 있습니다.</p>
          </div>
        </div>

        {/* 1. 종일 일정 섹션 */}
        {allDayItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">종일 일정 ({allDayItems.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allDayItems.map((item) => {
                const color = getCategoryColor(item.categoryId);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`p-3 rounded-lg border text-xs shadow-2xs cursor-pointer flex items-start justify-between gap-2 transition-transform hover:scale-[1.01] ${
                      color.bg
                    } ${color.border} ${item.isCompleted ? 'opacity-50 line-through' : ''}`}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">종일</span>
                      <div className={`font-semibold ${color.text}`}>{item.title}</div>
                    </div>
                    {item.sourceType === 'checklist' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(item.groupId, item.id);
                        }}
                        className="text-slate-400 hover:text-emerald-600 shrink-0 cursor-pointer p-0.5"
                      >
                        <CheckCircle className={`w-4 h-4 ${item.isCompleted ? 'text-emerald-600' : ''}`} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. 시간대별 일정 타임라인 */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">시간대별 일정</h3>
          {timedItems.length === 0 && allDayItems.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              이 날짜에는 등록된 일정이 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {HOURS.map((hour) => {
                const hourItems = timedItems.filter((i) => {
                  const m = parseTimeToMinutes(i.dueTime);
                  return m !== null && Math.floor(m / 60) === hour;
                });

                return (
                  <div key={hour} className="flex min-h-[52px] group hover:bg-slate-50/60 transition-colors">
                    <div className="w-20 px-3 py-2 text-[11px] font-semibold text-slate-400 border-r border-slate-100 shrink-0 select-none">
                      {formatHourLabel(hour)}
                    </div>
                    <div className="flex-1 p-2 space-y-1.5">
                      {hourItems.map((item) => {
                        const color = getCategoryColor(item.categoryId);
                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className={`p-2 rounded-lg border text-xs shadow-2xs cursor-pointer flex items-center justify-between gap-2 transition-all hover:scale-[1.01] ${
                              color.bg
                            } ${color.border} ${item.isCompleted ? 'opacity-50 line-through' : ''}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-bold text-slate-500 shrink-0">{item.dueTime}</span>
                              <span className={`font-semibold truncate ${color.text}`}>{item.title}</span>
                            </div>
                            {item.sourceType === 'checklist' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleComplete(item.groupId, item.id);
                                }}
                                className="text-slate-400 hover:text-emerald-600 shrink-0 cursor-pointer"
                              >
                                <CheckCircle className={`w-4 h-4 ${item.isCompleted ? 'text-emerald-600' : ''}`} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
