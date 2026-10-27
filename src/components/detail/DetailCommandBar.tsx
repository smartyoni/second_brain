import React from 'react';
import { Plus } from 'lucide-react';
import { DetailTab } from '../../types';

interface DetailCommandBarProps {
  activeTab: DetailTab;
  textCount: number;
  checkCount: number;
  onTabChange: (tab: DetailTab) => void;
  onAddGroup: () => void;
}

export const DetailCommandBar: React.FC<DetailCommandBarProps> = ({
  activeTab,
  textCount,
  checkCount,
  onTabChange,
  onAddGroup,
}) => {
  return (
    <div className="h-8 px-3 bg-white border-b border-slate-300 flex items-center justify-between text-xs shrink-0 select-none">
      {/* 세그먼트 탭 */}
      <div className="inline-flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs">
        <button
          type="button"
          onClick={() => onTabChange('text')}
          className={`px-2.5 py-0.5 rounded font-medium transition-all ${
            activeTab === 'text'
              ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          텍스트 <span className="text-[10px] font-normal">({textCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('check')}
          className={`px-2.5 py-0.5 rounded font-medium transition-all ${
            activeTab === 'check'
              ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          체크 <span className="text-[10px] font-normal">({checkCount})</span>
        </button>
      </div>

      {/* 우측 그룹 추가 액션 버튼 */}
      <button
        type="button"
        onClick={onAddGroup}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-slate-600" />
        <span>그룹 추가</span>
      </button>
    </div>
  );
};
