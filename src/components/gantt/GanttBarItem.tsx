import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { GanttBarData } from '../../hooks/useGanttChart';

interface GanttBarItemProps {
  bar: GanttBarData;
  totalDays: number;
  isSelected: boolean;
  onSelect: (item: CalendarScheduleItem) => void;
}

export const GanttBarItem: React.FC<GanttBarItemProps> = ({
  bar,
  totalDays,
  isSelected,
  onSelect,
}) => {
  const { item, startColIndex, spanCols, isMilestone } = bar;

  // 화면 범위 밖인지 체크
  const isOut = startColIndex + spanCols <= 0 || startColIndex >= totalDays;
  if (isOut) return null;

  // 클리핑 계산
  const visibleStart = Math.max(0, startColIndex);
  const visibleEnd = Math.min(totalDays, startColIndex + spanCols);
  const visibleSpan = Math.max(1, visibleEnd - visibleStart);

  const leftPercent = (visibleStart / totalDays) * 100;
  const widthPercent = (visibleSpan / totalDays) * 100;

  const isChecklist = item.sourceType === 'checklist';
  const isDone = item.isCompleted;

  // 배경 색상
  const bgClass = isDone
    ? 'bg-slate-300 text-slate-600 border-slate-400'
    : isMilestone
    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
    : isChecklist
    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700';

  return (
    <div
      onClick={() => onSelect(item)}
      style={{
        left: `${leftPercent}%`,
        width: `${Math.max(widthPercent, 2.5)}%`,
      }}
      className={`absolute top-1 bottom-1 rounded-md px-1.5 py-0.5 flex items-center gap-1 cursor-pointer transition-all border shadow-2xs select-none ${bgClass} ${
        isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 z-20 font-bold' : 'z-10'
      }`}
      title={`${item.title} (${bar.startDateStr}${!isMilestone ? ` ~ ${bar.endDateStr}` : ''}) - 클릭하여 세부 메모 보기`}
    >
      {isDone ? (
        <CheckCircle2 className="w-3 h-3 shrink-0 opacity-80" />
      ) : isMilestone ? (
        <Clock className="w-3 h-3 shrink-0 opacity-90" />
      ) : (
        <Circle className="w-2.5 h-2.5 shrink-0 opacity-75" />
      )}
      <span className="text-[11px] truncate leading-none">
        {item.title || '(무제 항목)'}
      </span>
      {!isMilestone && (
        <span className="text-[9px] opacity-80 shrink-0 hidden sm:inline ml-auto">
          {bar.endDateStr.slice(5)}
        </span>
      )}
    </div>
  );
};
