import React from 'react';
import { GanttChartSection } from '../gantt/GanttChartSection';
import { DetailItemMemoSection } from '../memo/DetailItemMemoSection';

export const GanttMemoPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-slate-200 overflow-hidden select-none">
      {/* 4번 패널 상단: 2번 패널 중분류 전속 간트차트 */}
      <div className="h-1/2 flex flex-col border-b-2 border-slate-200 overflow-hidden min-h-[160px]">
        <GanttChartSection />
      </div>

      {/* 4번 패널 하단: 3번 패널 항목 전속 세부 메모 텍스트박스 */}
      <div className="h-1/2 flex flex-col overflow-hidden min-h-[160px]">
        <DetailItemMemoSection />
      </div>
    </div>
  );
};
