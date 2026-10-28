import React from 'react';
import { GanttBarData } from '../../hooks/useGanttChart';
import { GanttBarItem } from './GanttBarItem';
import { CalendarScheduleItem } from '../../types';

interface GanttTimelineProps {
  days: Date[];
  ganttBars: GanttBarData[];
  totalDays: number;
  selectedDetailItemId?: string;
  onSelect: (item: CalendarScheduleItem) => void;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  days,
  ganttBars,
  totalDays,
  selectedDetailItemId,
  onSelect,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  if (ganttBars.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 select-none">
        <p className="text-xs font-medium text-slate-500 mb-1">
          등록된 일정이 없습니다.
        </p>
        <p className="text-[11px] text-slate-400">
          3번 패널의 각 항목에서 <span className="font-semibold text-blue-600">[일정 등록]</span>을 하면 타임라인에 간트차트로 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 bg-white select-none">
      <div className="min-w-[640px] flex flex-col h-full">
        {/* 상단 날짜 헤더 행 */}
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-30">
          <div className="w-28 shrink-0 px-2 py-1.5 text-[10px] font-bold text-slate-500 border-r border-slate-200 flex items-center">
            항목명
          </div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}>
            {days.map((d, idx) => {
              const dStr = d.toISOString().slice(0, 10);
              const isToday = dStr === todayStr;
              const dayOfWeek = d.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <div
                  key={idx}
                  className={`py-1 text-center border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center ${
                    isToday ? 'bg-blue-100/60' : isWeekend ? 'bg-slate-100/40' : ''
                  }`}
                >
                  <span
                    className={`text-[9px] font-medium leading-none ${
                      isToday ? 'text-blue-700 font-bold' : isWeekend ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    {dayNames[dayOfWeek]}
                  </span>
                  <span
                    className={`text-[10px] font-bold leading-none mt-0.5 ${
                      isToday
                        ? 'w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center'
                        : 'text-slate-700'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 일정 바 행 목록 */}
        <div className="flex-1 divide-y divide-slate-100">
          {ganttBars.map((bar) => {
            const isSelected = selectedDetailItemId === bar.item.id;
            return (
              <div
                key={bar.item.id}
                className={`flex items-center hover:bg-slate-50/70 transition-colors h-8 ${
                  isSelected ? 'bg-indigo-50/50' : ''
                }`}
              >
                {/* 좌측 항목 타이틀 */}
                <div
                  onClick={() => onSelect(bar.item)}
                  title={bar.item.title}
                  className="w-28 shrink-0 px-2 text-[11px] font-medium text-slate-700 truncate border-r border-slate-100 cursor-pointer hover:text-blue-600"
                >
                  {bar.item.title || '(무제 항목)'}
                </div>

                {/* 우측 타임라인 그리드 & 바 */}
                <div className="flex-1 relative h-full">
                  {/* 배경 그리드 세로선 */}
                  <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}>
                    {days.map((d, idx) => {
                      const dStr = d.toISOString().slice(0, 10);
                      const isToday = dStr === todayStr;
                      return (
                        <div
                          key={idx}
                          className={`border-r border-slate-100 last:border-r-0 h-full ${
                            isToday ? 'bg-blue-50/20' : ''
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* 간트 바 */}
                  <GanttBarItem
                    bar={bar}
                    totalDays={totalDays}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
