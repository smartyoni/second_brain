import React, { useState } from 'react';
import { GanttChartSection } from '../gantt/GanttChartSection';
import { DetailItemMemoSection } from '../memo/DetailItemMemoSection';
import { DetailItemChecklistSection } from '../memo/DetailItemChecklistSection';
import { CalendarRange, StickyNote } from 'lucide-react';

export const ProjectTimelinePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'memo' | 'timeline'>('memo');

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-slate-200 overflow-hidden select-none">
      {/* 4번 패널 상단 탭 전환 바 */}
      <div className="h-9 px-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded text-[11px]">
          {/* 1. 좌측: 상세 메모 & 하위체크 탭 (기본값) */}
          <button
            type="button"
            onClick={() => setActiveTab('memo')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded transition-colors ${
              activeTab === 'memo'
                ? 'bg-white text-indigo-700 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>상세 메모 & 하위체크</span>
          </button>

          {/* 2. 우측: 간트 타임라인 탭 */}
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded transition-colors ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-700 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>간트 타임라인</span>
          </button>
        </div>

        <span className="text-[11px] font-semibold text-slate-500">
          {activeTab === 'memo' ? '전속 메모' : '프로젝트 일정'}
        </span>
      </div>

      {/* 4번 패널 본문 영역 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'memo' ? (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* 상단: 3번 패널 항목 전속 세부 메모 */}
            <div className="h-1/2 flex flex-col border-b-2 border-slate-200 overflow-hidden min-h-[160px]">
              <DetailItemMemoSection />
            </div>

            {/* 하단: 3번 패널 항목 전속 세부 체크리스트 */}
            <div className="h-1/2 flex flex-col overflow-hidden min-h-[160px]">
              <DetailItemChecklistSection />
            </div>
          </div>
        ) : (
          <div className="h-full w-full overflow-hidden">
            <GanttChartSection />
          </div>
        )}
      </div>
    </div>
  );
};
