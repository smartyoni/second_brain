import React from 'react';
import { ChevronsDown, ChevronsUp, Plus } from 'lucide-react';

interface CategoryToolbarProps {
  totalCount: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddGroup: () => void;
  onAddCategory: () => void;
}

export const CategoryToolbar: React.FC<CategoryToolbarProps> = ({
  totalCount,
  onExpandAll,
  onCollapseAll,
  onAddGroup,
  onAddCategory,
}) => {
  return (
    <div className="h-11 lg:h-8 px-3 lg:px-2 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-sm lg:text-xs shrink-0 select-none">
      <span className="font-bold text-slate-800">
        카테고리 <span className="text-slate-600 font-medium">({totalCount})</span>
      </span>

      <div className="flex items-center gap-1.5 lg:gap-1">
        <button
          type="button"
          onClick={onExpandAll}
          title="모두 펼치기"
          className="p-1.5 lg:p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronsDown className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          title="모두 접기"
          className="p-1.5 lg:p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronsUp className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
        </button>
        <button
          type="button"
          onClick={onAddGroup}
          className="px-2 py-1 lg:px-1.5 lg:py-0.5 text-xs lg:text-[11px] font-semibold bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 rounded transition-colors"
        >
          그룹
        </button>
        <button
          type="button"
          onClick={onAddCategory}
          title="카테고리 추가"
          className="p-1.5 lg:p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
        >
          <Plus className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
        </button>
      </div>
    </div>
  );
};
