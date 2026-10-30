import React, { useState } from 'react';
import { Folder } from 'lucide-react';
import { CategoryItem } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';

interface CategoryItemRowProps {
  item: CategoryItem;
  isSelected: boolean;
  isDragged: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMove?: (direction: MoveDirection) => void;
  groupTargets?: { id: string; name: string }[];
  onMoveToGroup?: (groupId: string) => void;
  onSelect: () => void;
  onUpdateName: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const CategoryItemRow: React.FC<CategoryItemRowProps> = ({
  item,
  isSelected,
  isDragged,
  canMoveUp = true,
  canMoveDown = true,
  onMove,  groupTargets,  onMoveToGroup,
  onSelect,
  onUpdateName,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);

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
      className={`group relative h-7 px-2 flex items-center gap-1.5 text-xs cursor-pointer select-none border-b border-slate-200 transition-colors pr-0 ${
        isSelected
          ? 'bg-emerald-100 text-emerald-950 font-semibold'
          : 'hover:bg-slate-100 text-slate-800'
      } ${isDragged ? 'opacity-40 border-dashed border-slate-400' : ''}`}
    >
      {/* 선택 시 좌측 포인트 바 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600" />
      )}

      <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />

      <div className="flex-1 min-w-0">
        <InlineEditableText
          value={item.name}
          isEditing={isEditing}
          onSave={(newName) => {
            onUpdateName(item.id, newName);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          className="text-xs truncate block"
          inputClassName="text-xs h-6 py-0 px-1"
        />
      </div>

      <span className="text-[10px] text-slate-400 px-1 shrink-0 font-mono">
        ({item.itemCount})
      </span>

      <ThreeDotMenu
        onMove={onMove}
        groupTargets={groupTargets}
        onMoveToGroup={onMoveToGroup}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={() => setIsEditing(true)}
        onDelete={() => onDelete(item.id)}
        deleteTitle={`'${item.name}' 카테고리를 삭제하시겠습니까?`}
      />
    </div>
  );
};
