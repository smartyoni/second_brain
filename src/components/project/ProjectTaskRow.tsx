import React, { useState } from 'react';
import { SubItem } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ProjectTaskRowProps {
  item: SubItem;
  isSelected: boolean;
  isDragged: boolean;
  taskStats: { total: number; completed: number; percent: number };
  dDayText?: string | null;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMove?: (direction: MoveDirection) => void;
  categoryTargets?: { id: string; name: string }[];
  onMoveToCategory?: (targetCategoryId: string) => void;
  onSelect: () => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const ProjectTaskRow: React.FC<ProjectTaskRowProps> = ({
  item,
  isSelected,
  isDragged,
  taskStats,
  dDayText,
  canMoveUp = true,
  canMoveDown = true,
  onMove,
  categoryTargets,
  onMoveToCategory,
  onSelect,
  onUpdateTitle,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isAllDone = taskStats.total > 0 && taskStats.completed === taskStats.total;

  return (
    <div
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group px-2.5 py-2 flex items-center justify-between text-xs cursor-pointer border-b transition-colors select-none ${
        isSelected
          ? 'bg-indigo-50/90 text-indigo-950 font-medium border-indigo-200'
          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
      } ${isDragged ? 'opacity-40 bg-indigo-100' : ''}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
        {/* 완료 상태 아이콘 */}
        <div className="shrink-0">
          {isAllDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
          )}
        </div>

        {/* 업무/마일스톤 타이틀 */}
        <div className="truncate flex-1">
          <InlineEditableText
            value={item.title}
            isEditing={isEditing}
            onSave={(newTitle) => {
              onUpdateTitle(item.id, newTitle);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            className={`text-xs ${isAllDone ? 'line-through text-slate-400' : ''}`}
            inputClassName="text-xs h-6 py-0 px-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* D-Day 뱃지 */}
        {dDayText && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              dDayText.startsWith('D-') && parseInt(dDayText.replace('D-', '')) <= 3
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Clock className="w-2.5 h-2.5" />
            {dDayText}
          </span>
        )}

        {/* 진행률 뱃지 */}
        {taskStats.total > 0 && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isAllDone
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            {taskStats.completed}/{taskStats.total} ({taskStats.percent}%)
          </span>
        )}

        {/* 3점 메뉴 (최상단 1열 이동 포함) */}
        <ThreeDotMenu
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMove={onMove}
          onEdit={() => setIsEditing(true)}
          onDelete={() => onDelete(item.id)}
          targetItems={categoryTargets}
          targetActionLabel="프로젝트 이동"
          onMoveToTarget={onMoveToCategory}
          deleteTitle={`'${item.title}' 업무를 삭제하시겠습니까?`}
        />
      </div>
    </div>
  );
};
