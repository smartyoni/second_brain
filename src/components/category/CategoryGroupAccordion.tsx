import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { CategoryGroup, CategoryItem } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';
import { CategoryItemRow } from './CategoryItemRow';

interface CategoryGroupAccordionProps {
  group: CategoryGroup;
  items: CategoryItem[];
  selectedCategoryId: string | null;
  draggedCategoryId: string | null;
  canMoveGroupUp?: boolean;
  canMoveGroupDown?: boolean;
  onMoveGroup?: (groupId: string, direction: MoveDirection) => void;
  onMoveCategory?: (catId: string, direction: MoveDirection) => void;
  groupTargets?: { id: string; name: string }[];
  onMoveCategoryToGroup?: (catId: string, groupId: string) => void;
  onToggleExpand: (groupId: string) => void;
  onUpdateGroupName: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddCategoryToGroup: (groupId: string) => void;
  onSelectCategory: (catId: string) => void;
  onUpdateCategoryName: (catId: string, name: string) => void;
  onDeleteCategory: (catId: string) => void;
  onCategoryDragStart: (id: string, e: React.DragEvent) => void;
  onCategoryDragOver: (e: React.DragEvent) => void;
  onCategoryDrop: (targetId: string, e: React.DragEvent) => void;
  onCategoryDragEnd: () => void;
}

export const CategoryGroupAccordion: React.FC<CategoryGroupAccordionProps> = ({
  group,
  items,
  selectedCategoryId,
  draggedCategoryId,
  canMoveGroupUp = false,
  canMoveGroupDown = false,
  onMoveGroup,
  onMoveCategory,  groupTargets,  onMoveCategoryToGroup,
  onToggleExpand,
  onUpdateGroupName,
  onDeleteGroup,
  onAddCategoryToGroup,
  onSelectCategory,
  onUpdateCategoryName,
  onDeleteCategory,
  onCategoryDragStart,
  onCategoryDragOver,
  onCategoryDrop,
  onCategoryDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border-b border-slate-300">
      {/* 파란색 그룹 헤더 바 */}
      <div
        onClick={() => onToggleExpand(group.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="h-7 px-2 bg-blue-100 hover:bg-blue-200/90 border-y border-blue-200 flex items-center gap-1.5 text-xs text-blue-950 font-bold cursor-pointer select-none transition-colors pr-0"
      >
        {group.isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        )}

        <div className="flex-1 min-w-0" onClick={(e) => isEditing && e.stopPropagation()}>
          <InlineEditableText
            value={group.name}
            isEditing={isEditing}
            onSave={(newName) => {
              onUpdateGroupName(group.id, newName);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            className="text-xs truncate block font-bold text-blue-950"
            inputClassName="text-xs h-6 py-0 px-1 font-semibold"
          />
        </div>

        <span className="text-[10px] bg-blue-200 text-blue-900 rounded px-1 shrink-0 font-semibold">
          {items.length}
        </span>

        <button
          type="button"
          title="카테고리 추가"
          onClick={(e) => {
            e.stopPropagation();
            onAddCategoryToGroup(group.id);
          }}
          className="p-0.5 text-blue-700 hover:bg-blue-200 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <ThreeDotMenu
          onMove={onMoveGroup ? (dir) => onMoveGroup(group.id, dir) : undefined}
          canMoveUp={canMoveGroupUp}
          canMoveDown={canMoveGroupDown}
          onEdit={() => setIsEditing(true)}
          onDelete={() => onDeleteGroup(group.id)}
          deleteTitle={`'${group.name}' 그룹을 삭제하시겠습니까?`}
        />
      </div>

      {/* 내부 카테고리 목록 */}
      {group.isExpanded && (
        <div className="bg-white">
          {items.map((item, idx) => (
            <CategoryItemRow
              key={item.id}
              item={item}
              isSelected={item.id === selectedCategoryId}
              isDragged={item.id === draggedCategoryId}
              canMoveUp={idx > 0}
              canMoveDown={idx < items.length - 1}
              onMove={onMoveCategory ? (dir) => onMoveCategory(item.id, dir) : undefined}
              groupTargets={groupTargets?.filter((g) => g.id !== group.id)}
              onMoveToGroup={
                onMoveCategoryToGroup ? (gid) => onMoveCategoryToGroup(item.id, gid) : undefined
              }
              onSelect={() => onSelectCategory(item.id)}
              onUpdateName={onUpdateCategoryName}
              onDelete={onDeleteCategory}
              onDragStart={(e) => onCategoryDragStart(item.id, e)}
              onDragOver={onCategoryDragOver}
              onDrop={(e) => onCategoryDrop(item.id, e)}
              onDragEnd={onCategoryDragEnd}
            />
          ))}
          {items.length === 0 && (
            <div className="py-2 text-center text-[11px] text-slate-400">
              비어 있는 그룹입니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
