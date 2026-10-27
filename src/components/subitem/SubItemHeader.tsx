import React from 'react';
import { Plus } from 'lucide-react';

interface SubItemHeaderProps {
  categoryTitle: string;
  totalCount: number;
  onAddSubItem: () => void;
}

export const SubItemHeader: React.FC<SubItemHeaderProps> = ({
  categoryTitle,
  totalCount,
  onAddSubItem,
}) => {
  return (
    <div className="h-9 px-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs shrink-0 select-none">
      <span className="font-bold text-slate-800 truncate">
        {categoryTitle || '카테고리'} <span className="text-slate-600 font-normal">({totalCount})</span>
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onAddSubItem}
          title="항목 추가"
          className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
