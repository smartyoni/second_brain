import React, { useEffect, useRef, useMemo } from 'react';
import { CalendarScheduleItem } from '../../types';
import { parseTimeToMinutes } from '../../utils/calendarUtils';
import { GoogleCalendarScheduleItemRow } from './GoogleCalendarScheduleItemRow';
import { Calendar as CalendarIcon } from 'lucide-react';

interface GoogleCalendarScheduleViewProps {
  items: CalendarScheduleItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectItem: (item: CalendarScheduleItem) => void;
  onCellClick?: (dateStr: string) => void;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

interface GroupedDay {
  dateStr: string;
  isToday: boolean;
  dayNum: number;
  monthDayStr: string;
  allDayItems: CalendarScheduleItem[];
  timedItems: CalendarScheduleItem[];
}

export const GoogleCalendarScheduleView: React.FC<GoogleCalendarScheduleViewProps> = ({
  items,
  selectedDate,
  onSelectDate,
  onSelectItem,
  onCellClick,
  onContextMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 1. 날짜별로 그룹화 및 정렬
  const groupedDays = useMemo<GroupedDay[]>(() => {
    const dayMap = new Map<string, CalendarScheduleItem[]>();

    if (!dayMap.has(todayStr)) {
      dayMap.set(todayStr, []);
    }

    items.forEach((item) => {
      if (!item.dueDate) return;
      const list = dayMap.get(item.dueDate) || [];
      list.push(item);
      dayMap.set(item.dueDate, list);
    });

    const sortedDates = Array.from(dayMap.keys()).sort();

    return sortedDates
      .map((dateStr) => {
        const dayEvents = dayMap.get(dateStr) || [];
        const isToday = dateStr === todayStr;

        if (!isToday && dayEvents.length === 0) {
          return null;
        }

        const parts = dateStr.split('-');
        let dayNum = 1;
        let monthDayStr = '';
        if (parts.length >= 3) {
          const d = new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10)
          );
          if (!isNaN(d.getTime())) {
            dayNum = d.getDate();
            const month = d.getMonth() + 1;
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            monthDayStr = `${month}월, ${dayNames[d.getDay()]}`;
          }
        }

        const allDayItems = dayEvents.filter((item) => !item.dueTime);
        const timedItems = dayEvents
          .filter((item) => !!item.dueTime)
          .sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));

        return {
          dateStr,
          isToday,
          dayNum,
          monthDayStr,
          allDayItems,
          timedItems,
        };
      })
      .filter((day): day is GroupedDay => day !== null);
  }, [items, todayStr]);

  // 2. 현재 시간 분 단위 계산
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 3. 오늘 또는 선택 날짜로 자동 스크롤
  useEffect(() => {
    const targetKey = groupedDays.some((d) => d.dateStr === todayStr)
      ? todayStr
      : selectedDate;
    const targetEl = dateRefs.current[targetKey];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [todayStr, selectedDate, groupedDays]);

  // 시간 포맷 헬퍼 (종일 / HH:mm~HH:mm)
  const formatTimeRange = (dueTime?: string, endTime?: string) => {
    if (!dueTime) return '종일';
    if (endTime) return `${dueTime}~${endTime}`;
    const [hStr, mStr] = dueTime.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (!isNaN(h) && !isNaN(m)) {
      const endH = (h + 1) % 24;
      return `${dueTime}~${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return dueTime;
  };

  // 구글 캘린더 현재 시각 레드 인디케이터 라인
  const renderCurrentTimeIndicator = () => (
    <div className="flex items-center my-1 select-none py-0.5">
      <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335] shrink-0" />
      <div className="h-[2px] bg-[#ea4335] flex-1" />
    </div>
  );

  if (groupedDays.length === 0) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-white text-slate-400 select-none">
        <CalendarIcon className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
        <p className="text-sm font-medium text-slate-600">등록된 일정이 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">
          새 일정을 등록하거나 카테고리 필터를 변경해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full overflow-y-auto bg-white select-none divide-y divide-[#dadce0]/70"
    >
      {groupedDays.map((day) => {
        let redLineRendered = false;

        return (
          <div
            key={day.dateStr}
            ref={(el) => {
              dateRefs.current[day.dateStr] = el;
            }}
            className="flex items-start px-4 sm:px-8 py-3.5 hover:bg-slate-50/40 transition-colors"
          >
            {/* 좌측 날짜 컬럼 */}
            <div
              onClick={() => {
                onSelectDate(day.dateStr);
                onCellClick?.(day.dateStr);
              }}
              className="w-28 sm:w-36 shrink-0 pt-1 flex items-center gap-2 cursor-pointer group"
              title="클릭하여 날짜 선택 및 새 일정 추가"
            >
              {day.isToday ? (
                <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {day.dayNum}
                </div>
              ) : (
                <div className="text-2xl font-normal text-[#3c4043] group-hover:text-black shrink-0 min-w-7 text-right pr-0.5 leading-none">
                  {day.dayNum}
                </div>
              )}
              <span
                className={`text-xs whitespace-nowrap ${
                  day.isToday
                    ? 'font-bold text-[#1a73e8]'
                    : 'font-normal text-[#5f6368] group-hover:text-[#3c4043]'
                }`}
              >
                {day.monthDayStr}
              </span>
            </div>

            {/* 우측 일정 목록 컬럼 */}
            <div className="flex-1 flex flex-col min-w-0 pl-2 sm:pl-4">
              {/* 오늘이고 종일 일정이 없거나 종일 일정 전에 현재 시간 인디케이터가 필요할 때 */}
              {day.isToday &&
                day.allDayItems.length === 0 &&
                day.timedItems.length > 0 &&
                (parseTimeToMinutes(day.timedItems[0].dueTime) || 0) > currentMinutes && (
                  <>
                    {renderCurrentTimeIndicator()}
                    {((redLineRendered = true), null)}
                  </>
                )}

              {/* 종일 일정 목록 */}
              {day.allDayItems.map((item) => (
                <GoogleCalendarScheduleItemRow
                  key={item.id}
                  item={item}
                  onSelectItem={onSelectItem}
                  formatTimeRange={formatTimeRange}
                  onContextMenu={onContextMenu}
                />
              ))}

              {/* 오늘 날짜이고 종일 일정 직후에 현재 시간 레드 라인 표시 */}
              {day.isToday &&
                !redLineRendered &&
                (day.timedItems.length === 0 ||
                  (parseTimeToMinutes(day.timedItems[0].dueTime) || 0) > currentMinutes) && (
                  <>
                    {renderCurrentTimeIndicator()}
                    {((redLineRendered = true), null)}
                  </>
                )}

              {/* 시간제 일정 목록 */}
              {day.timedItems.map((item) => {
                const itemMinutes = parseTimeToMinutes(item.dueTime) || 0;
                const shouldShowRedLineBefore =
                  day.isToday && !redLineRendered && itemMinutes >= currentMinutes;

                if (shouldShowRedLineBefore) {
                  redLineRendered = true;
                }

                return (
                  <React.Fragment key={item.id}>
                    {shouldShowRedLineBefore && renderCurrentTimeIndicator()}
                    <GoogleCalendarScheduleItemRow
                      item={item}
                      onSelectItem={onSelectItem}
                      formatTimeRange={formatTimeRange}
                      onContextMenu={onContextMenu}
                    />
                  </React.Fragment>
                );
              })}

              {/* 오늘이고 모든 일정 뒤에도 레드 라인이 렌더링되지 않았을 때 */}
              {day.isToday && !redLineRendered && renderCurrentTimeIndicator()}

              {/* 일정이 하나도 없는 오늘인 경우 안내 문구 */}
              {day.allDayItems.length === 0 && day.timedItems.length === 0 && (
                <div
                  onClick={() => onCellClick?.(day.dateStr)}
                  className="py-2.5 px-3 text-xs text-slate-400 hover:text-slate-600 hover:bg-[#f1f3f4] rounded-lg cursor-pointer transition-colors"
                >
                  오늘 예정된 일정이 없습니다. (클릭하여 추가)
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
