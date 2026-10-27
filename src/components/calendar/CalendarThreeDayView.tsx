import React, { useRef, useEffect } from 'react';
import { CalendarScheduleItem, SubItem } from '../../types';
import { CheckSquare, Square, FileText, ArrowRight } from 'lucide-react';
import { HOURS, HOUR_HEIGHT, formatHourLabel, parseTimeToMinutes } from '../../utils/calendarUtils';

interface CalendarThreeDayViewProps {
  startDate: string; // YYYY-MM-DD
  scheduleItems: CalendarScheduleItem[];
  subItems: SubItem[];
  onToggleComplete: (groupId: string, itemId: string) => void;
  onJumpToItem: (item: CalendarScheduleItem) => void;
}

export const CalendarThreeDayView: React.FC<CalendarThreeDayViewProps> = ({
  startDate,
  scheduleItems,
  subItems,
  onToggleComplete,
  onJumpToItem,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayStr = new Date().toISOString().slice(0, 10);

  // 기준일로부터 3일간의 날짜 배열 생성
  const threeDays = [0, 1, 2].map((offset) => {
    const base = new Date(startDate);
    base.setDate(base.getDate() + offset);
    const dateStr = base.toISOString().slice(0, 10);
    const isToday = dateStr === todayStr;

    const weekdayStr = base.toLocaleDateString('ko-KR', { weekday: 'short' });
    const dayNum = base.getDate();

    const items = scheduleItems.filter((i) => i.dueDate === dateStr);
    const allDayItems = items.filter((i) => !i.dueTime);
    const timedItems = items.filter((i) => !!i.dueTime);

    return {
      dateStr,
      isToday,
      weekdayStr,
      dayNum,
      allDayItems,
      timedItems,
    };
  });

  // 초기 스크롤 오전 9시 위치
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = HOUR_HEIGHT * 2;
    }
  }, [startDate]);

  const getSubItemTitle = (subItemId: string) => {
    return subItems.find((s) => s.id === subItemId)?.title || '연결 문서';
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = HOURS[0] * 60;
  const currentTimeTop = ((currentMinutes - startMinutes) / 60) * HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white select-none">
      {/* 1. 구글 캘린더 스타일 3일 상단 헤더 */}
      <div className="flex border-b border-slate-300 bg-white shrink-0">
        {/* 좌측 시간 라벨 정렬용 빈 박스 */}
        <div className="w-12 shrink-0 border-r border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-semibold">
          GMT+9
        </div>

        {/* 3일 날짜 헤더 컬럼들 */}
        <div className="flex-1 grid grid-cols-3 divide-x divide-slate-300">
          {threeDays.map((col) => (
            <div key={col.dateStr} className={`py-1.5 text-center ${col.isToday ? 'bg-blue-50/50' : ''}`}>
              <div className={`text-[11px] font-bold ${col.isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                {col.weekdayStr}
              </div>
              <div
                className={`w-7 h-7 mx-auto mt-0.5 flex items-center justify-center rounded-full text-sm font-bold ${
                  col.isToday
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {col.dayNum}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 종일 일정 3분할 행 */}
      <div className="flex border-b border-slate-300 bg-slate-100/70 shrink-0 text-xs">
        <div className="w-12 shrink-0 border-r border-slate-300 text-[10px] text-slate-500 flex items-center justify-center font-bold">
          종일
        </div>
        <div className="flex-1 grid grid-cols-3 divide-x divide-slate-300 min-h-[30px] p-1 gap-1">
          {threeDays.map((col) => (
            <div key={`allday-${col.dateStr}`} className="flex flex-col gap-1 min-w-0">
              {col.allDayItems.map((item) => (
                <div
                  key={item.id}
                  className={`px-1.5 py-0.5 rounded text-[10px] truncate border font-semibold flex items-center justify-between ${
                    item.isCompleted
                      ? 'bg-slate-100 text-slate-400 line-through border-slate-300'
                      : 'bg-blue-100 text-blue-950 border-blue-300'
                  }`}
                  title={item.title}
                >
                  <span className="truncate">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => onJumpToItem(item)}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 2. 구글 캘린더 스타일 3일 타임 그리드 스크롤 영역 */}
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
              <div className="w-12 pr-1.5 text-right text-[10px] font-semibold text-slate-500 -mt-2 shrink-0 select-none">
                {formatHourLabel(hour)}
              </div>
              <div className="flex-1 h-full border-l border-slate-300" />
            </div>
          ))}

          {/* 3개 날짜 열 격자 레이아웃 (이벤트 카드 배치 영역) */}
          <div className="absolute left-12 right-0 top-0 bottom-0 grid grid-cols-3 divide-x divide-slate-300">
            {threeDays.map((col) => (
              <div key={`grid-${col.dateStr}`} className="relative h-full hover:bg-slate-50/30 transition-colors">
                {/* 오늘 날짜 열의 현재 시각 표시 선 */}
                {col.isToday && currentTimeTop >= 0 && currentTimeTop <= HOURS.length * HOUR_HEIGHT && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: currentTimeTop }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-xs" />
                    <div className="flex-1 border-t-2 border-red-500" />
                  </div>
                )}

                {/* 해당 날짜의 시간대별 이벤트 블록 */}
                {col.timedItems.map((item) => {
                  const minutes = parseTimeToMinutes(item.dueTime);
                  if (minutes === null) return null;

                  const topPos = ((minutes - startMinutes) / 60) * HOUR_HEIGHT;

                  return (
                    <div
                      key={item.id}
                      style={{
                        top: Math.max(topPos, 2),
                        left: '4px',
                        right: '4px',
                        minHeight: '38px',
                      }}
                      className={`absolute z-10 p-1 rounded-md border text-[11px] shadow-xs flex flex-col justify-between ${
                        item.isCompleted
                          ? 'bg-slate-100 border-slate-300 opacity-70'
                          : item.sourceType === 'checklist'
                          ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                          : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-start gap-1 min-w-0">
                          {item.sourceType === 'checklist' ? (
                            <button
                              type="button"
                              onClick={() => onToggleComplete(item.groupId, item.id)}
                              className="mt-0.5 text-white/90 hover:text-white cursor-pointer"
                            >
                              {item.isCompleted ? (
                                <CheckSquare className="w-3 h-3 text-slate-400" />
                              ) : (
                                <Square className="w-3 h-3" />
                              )}
                            </button>
                          ) : (
                            <FileText className="w-3 h-3 text-white/90 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <span
                              className={`font-semibold leading-tight block truncate ${
                                item.isCompleted ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-[9px] text-white/80 block leading-none">
                              {item.dueTime}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onJumpToItem(item)}
                          className="text-white/80 hover:text-white p-0.5 shrink-0"
                          title={getSubItemTitle(item.subItemId)}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
