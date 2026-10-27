import React, { useRef, useEffect } from 'react';
import { CalendarScheduleItem, SubItem } from '../../types';
import { CheckSquare, Square, FileText, ArrowRight } from 'lucide-react';
import { HOURS, HOUR_HEIGHT, formatHourLabel, parseTimeToMinutes } from '../../utils/calendarUtils';

interface CalendarDayViewProps {
  selectedDate: string; // YYYY-MM-DD
  scheduleItems: CalendarScheduleItem[];
  subItems: SubItem[];
  onToggleComplete: (groupId: string, itemId: string) => void;
  onJumpToItem: (item: CalendarScheduleItem) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  selectedDate,
  scheduleItems,
  subItems,
  onToggleComplete,
  onJumpToItem,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const dayItems = scheduleItems.filter((i) => i.dueDate === selectedDate);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  const dateObj = new Date(selectedDate);
  const weekdayStr = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleDateString('ko-KR', { weekday: 'short' });
  const dayNum = isNaN(dateObj.getTime()) ? '' : dateObj.getDate();

  // 종일(시간 미지정) 일정과 시간 지정 일정 분리
  const allDayItems = dayItems.filter((i) => !i.dueTime);
  const timedItems = dayItems.filter((i) => !!i.dueTime);

  // 처음 마운트 시 오전 8시~9시 부근으로 부드럽게 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = HOUR_HEIGHT * 2; // 오전 9시 부근
    }
  }, [selectedDate]);

  const getSubItemTitle = (subItemId: string) => {
    return subItems.find((s) => s.id === subItemId)?.title || '연결 문서';
  };

  // 현재 시간 인디케이터 (오늘일 경우만 계산)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = HOURS[0] * 60; // 07:00
  const currentTimeTop =
    ((currentMinutes - startMinutes) / 60) * HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white select-none">
      {/* 1. 구글 캘린더 스타일 상단 헤더 (요일 + 원형 날짜 숫자) */}
      <div className="flex items-center px-4 py-2 border-b border-slate-300 bg-white shrink-0">
        <div className="w-14 text-center shrink-0">
          <div className={`text-[11px] font-bold ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
            {weekdayStr}
          </div>
          <div
            className={`w-8 h-8 mx-auto mt-0.5 flex items-center justify-center rounded-full text-base font-bold ${
              isToday
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            {dayNum}
          </div>
        </div>

        {/* 종일 일정 구역 */}
        <div className="flex-1 min-w-0 pl-3 border-l border-slate-300">
          <div className="text-[10px] text-slate-500 font-bold mb-1">
            종일 ({allDayItems.length})
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
            {allDayItems.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic">종일 일정 없음</span>
            ) : (
              allDayItems.map((item) => (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border font-semibold transition-all ${
                    item.isCompleted
                      ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
                      : 'bg-blue-100 border-blue-300 text-blue-950 shadow-2xs hover:border-blue-500'
                  }`}
                >
                  {item.sourceType === 'checklist' ? (
                    <button
                      type="button"
                      onClick={() => onToggleComplete(item.groupId, item.id)}
                      className="text-blue-600 cursor-pointer"
                    >
                      {item.isCompleted ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                    </button>
                  ) : (
                    <FileText className="w-3 h-3 text-amber-500" />
                  )}
                  <span className="truncate max-w-[130px]">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => onJumpToItem(item)}
                    className="text-blue-600 hover:text-blue-800 p-0.5"
                    title={getSubItemTitle(item.subItemId)}
                  >
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. 구글 캘린더 스타일 24시간 타임라인 스크롤 영역 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative bg-white"
        style={{ height: '100%' }}
      >
        <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* 시간 눈금 가로줄 및 라벨 */}
          {HOURS.map((hour, idx) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-slate-300 flex items-start"
              style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            >
              {/* 좌측 시간 라벨 */}
              <div className="w-14 pr-2 text-right text-[10px] font-semibold text-slate-500 -mt-2 shrink-0 select-none">
                {formatHourLabel(hour)}
              </div>
              {/* 그리드 빈 공간 */}
              <div className="flex-1 h-full border-l border-slate-300 hover:bg-slate-50/50 transition-colors" />
            </div>
          ))}

          {/* 오늘 현재 시각 표시 빨간색 바 */}
          {isToday && currentTimeTop >= 0 && currentTimeTop <= HOURS.length * HOUR_HEIGHT && (
            <div
              className="absolute left-14 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: currentTimeTop }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-xs" />
              <div className="flex-1 border-t-2 border-red-500" />
            </div>
          )}

          {/* 시간대별 일정 블록 렌더링 (구글 캘린더 이벤트 카드) */}
          {timedItems.map((item) => {
            const minutes = parseTimeToMinutes(item.dueTime);
            if (minutes === null) return null;

            const topPos = ((minutes - startMinutes) / 60) * HOUR_HEIGHT;
            const subTitle = getSubItemTitle(item.subItemId);

            return (
              <div
                key={item.id}
                style={{
                  top: Math.max(topPos, 2),
                  left: '60px',
                  right: '12px',
                  minHeight: '44px',
                }}
                className={`absolute z-10 p-1.5 rounded-lg border shadow-xs transition-all flex flex-col justify-between ${
                  item.isCompleted
                    ? 'bg-slate-100 border-slate-300 opacity-70'
                    : item.sourceType === 'checklist'
                    ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                    : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-start gap-1.5 min-w-0">
                    {item.sourceType === 'checklist' ? (
                      <button
                        type="button"
                        onClick={() => onToggleComplete(item.groupId, item.id)}
                        className="mt-0.5 cursor-pointer text-white/90 hover:text-white"
                      >
                        {item.isCompleted ? (
                          <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-white/90 shrink-0 mt-0.5" />
                    )}

                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold leading-tight truncate ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10px] text-white/80 font-medium truncate">
                        {item.dueTime} · {subTitle}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToItem(item)}
                    className="p-1 hover:bg-white/20 rounded text-white/90 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="문서 위치로 바로가기"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
