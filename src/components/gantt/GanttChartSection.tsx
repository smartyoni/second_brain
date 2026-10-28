import React from 'react';
import { useGanttChart } from '../../hooks/useGanttChart';
import { GanttChartHeader } from './GanttChartHeader';
import { GanttTimeline } from './GanttTimeline';

export const GanttChartSection: React.FC = () => {
  const {
    currentSubItem,
    days,
    startDateStr,
    endDateStr,
    ganttBars,
    totalDays,
    shiftDays,
    goToToday,
    handleSelectItem,
    selectedDetailItemId,
  } = useGanttChart();

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <GanttChartHeader
        currentSubItem={currentSubItem}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        onPrev={() => shiftDays(-7)}
        onNext={() => shiftDays(7)}
        onToday={goToToday}
      />
      <GanttTimeline
        days={days}
        ganttBars={ganttBars}
        totalDays={totalDays}
        selectedDetailItemId={selectedDetailItemId}
        onSelect={handleSelectItem}
      />
    </div>
  );
};
