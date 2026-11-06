import React from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { SmartText } from '../shared/SmartText';

interface ProjectTaskHeaderProps {
  categoryTitle: string;
  totalTasks: number;
  completedTasks: number;
  overallPercent: number;
  onAddTask: () => void;
}

export const ProjectTaskHeader: React.FC<ProjectTaskHeaderProps> = ({
  categoryTitle,
  totalTasks,
  completedTasks,
  overallPercent,
  onAddTask,
}) => {
  return (
    <div className="bg-slate-100 border-b border-slate-300 flex flex-col shrink-0 select-none">
      {/* 상단 타이틀 바 */}
      <div className="h-9 px-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-bold text-slate-800 truncate">
            <SmartText text={categoryTitle || '프로젝트'} />
          </span>
          <span className="text-[11px] text-slate-500 shrink-0">
            ({completedTasks}/{totalTasks})
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onAddTask}
            title="마일스톤/업무 추가"
            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>업무 추가</span>
          </button>
        </div>
      </div>

      {/* 프로젝트 진척도 바 */}
      <div className="px-2.5 pb-2 pt-0.5 flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-indigo-700 w-8 text-right shrink-0">
          {overallPercent}%
        </span>
      </div>
    </div>
  );
};
