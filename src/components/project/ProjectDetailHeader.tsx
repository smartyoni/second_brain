import React from 'react';
import { Plus, CheckSquare, FileText, Layers } from 'lucide-react';
import { DetailTab } from '../../types';
import { SmartText } from '../shared/SmartText';

interface ProjectDetailHeaderProps {
  taskTitle: string;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onAddGroup: () => void;
  totalItems: number;
  completedItems: number;
}

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  taskTitle,
  activeTab,
  onTabChange,
  onAddGroup,
  totalItems,
  completedItems,
}) => {
  return (
    <div className="h-9 px-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs shrink-0 select-none">
      <div className="flex items-center gap-1.5 min-w-0">
        <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
        <span className="font-bold text-slate-800 truncate">
          <SmartText text={taskTitle || '선택된 업무 없음'} />
        </span>
        {activeTab === 'check' && totalItems > 0 && (
          <span className="text-[11px] text-slate-500 shrink-0">
            ({completedItems}/{totalItems})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* 체크리스트 / 텍스트 탭 전환 버튼 */}
        <div className="flex bg-slate-200 p-0.5 rounded text-[11px]">
          <button
            type="button"
            onClick={() => onTabChange('check')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              activeTab === 'check'
                ? 'bg-white text-indigo-700 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>작업(TODO)</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('text')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              activeTab === 'text'
                ? 'bg-white text-indigo-700 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>기획/노트</span>
          </button>
        </div>

        {/* 세부 그룹 추가 버튼 */}
        <button
          type="button"
          onClick={onAddGroup}
          title="새 작업 그룹 추가"
          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium transition-colors shadow-sm ml-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>그룹 추가</span>
        </button>
      </div>
    </div>
  );
};
