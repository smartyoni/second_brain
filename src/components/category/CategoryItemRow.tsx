import React, { useState } from 'react';
import { Folder } from 'lucide-react';
import { CategoryItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
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
  onDropSubItem?: (subItemId: string, targetCategoryId: string) => void;
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
  onDropSubItem,
  onSelect,
  onUpdateName,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isOverSubItem, setIsOverSubItem] = useState(false);
  const { subItems } = useWorkspace();
  const subItemCount = subItems.filter((s) => s.categoryId === item.id).length;

  return (
    <div
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/subitem-id')) {
          e.preventDefault();
          setIsOverSubItem(true);
          return;
        }
        onDragOver(e);
      }}
      onDragLeave={() => setIsOverSubItem(false)}
      onDrop={(e) => {
        setIsOverSubItem(false);
        const subId = e.dataTransfer.getData('application/subitem-id');
        if (subId && onDropSubItem) {
          e.preventDefault();
          e.stopPropagation();
          onDropSubItem(subId, item.id);
          return;
        }
        onDrop(e);
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group relative h-11 lg:h-7 px-3 lg:px-2 flex items-center gap-2 lg:gap-1.5 text-sm lg:text-xs cursor-pointer select-none border-b border-slate-200 transition-colors pr-0 ${
        isOverSubItem
          ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset'
          : isSelected
          ? 'bg-emerald-100 text-emerald-950 font-semibold'
          : 'hover:bg-slate-100 text-slate-800'
      } ${isDragged ? 'opacity-40 border-dashed border-slate-400' : ''}`}
    >
      {/* 선택 시 좌측 포인트 바 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600" />
      )}

      <Folder className={`w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />

      <div className="flex-1 min-w-0">
        <InlineEditableText
          value={item.name}
          isEditing={isEditing}
          onSave={(newName) => {
            onUpdateName(item.id, newName);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          className="text-sm lg:text-xs truncate block"
          inputClassName="text-sm lg:text-xs h-8 lg:h-6 py-0 px-1.5"
        />
      </div>

      <span className="text-xs lg:text-[10px] text-slate-400 px-1 shrink-0 font-mono">
        ({subItemCount})
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
        buttonClassName="p-2 lg:p-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
      />
    </div>
  );
};
