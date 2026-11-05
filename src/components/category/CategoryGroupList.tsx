import React from 'react';
import { CategoryGroup, CategoryItem } from '../../types';
import { CategoryGroupAccordion } from './CategoryGroupAccordion';
import { MoveDirection } from '../shared/ThreeDotMenu';

interface CategoryGroupListProps {
  currentTopId: string | null;
  currentGroups: CategoryGroup[];
  currentItems: CategoryItem[];
  unclassifiedItems: CategoryItem[];
  selectedCategoryId: string | null;
  draggedCategoryId: string | null;
  groupTargets: { id: string; name: string }[];
  onMoveGroup: (id: string, dir: MoveDirection) => void;
  onMoveCategory: (catId: string, dir: MoveDirection, groupId?: string) => void;
  onMoveCategoryToGroup: (catId: string, groupId: string) => void;
  onDropSubItem: (subItemId: string, targetCategoryId: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateGroupName: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onAddCategoryToGroup: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onUpdateCategoryName: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onCategoryDragStart: (id: string, e: React.DragEvent) => void;
  onCategoryDragOver: (e: React.DragEvent) => void;
  onCategoryDrop: (targetId: string, e: React.DragEvent) => void;
  onCategoryDragEnd: () => void;
}

export const CategoryGroupList: React.FC<CategoryGroupListProps> = ({
  currentTopId,
  currentGroups,
  currentItems,
  unclassifiedItems,
  selectedCategoryId,
  draggedCategoryId,
  groupTargets,
  onMoveGroup,
  onMoveCategory,
  onMoveCategoryToGroup,
  onDropSubItem,
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
  return (
    <div className="flex-1 overflow-y-auto">
      {currentGroups.map((group, groupIdx) => {
        const groupItems = currentItems.filter((c) => c.groupId === group.id);
        return (
          <CategoryGroupAccordion
            key={group.id}
            group={group}
            items={groupItems}
            selectedCategoryId={selectedCategoryId}
            draggedCategoryId={draggedCategoryId}
            canMoveGroupUp={groupIdx > 0}
            canMoveGroupDown={groupIdx < currentGroups.length - 1}
            onMoveGroup={onMoveGroup}
            onMoveCategory={(catId, dir) => onMoveCategory(catId, dir, group.id)}
            groupTargets={groupTargets}
            onMoveCategoryToGroup={onMoveCategoryToGroup}
            onDropSubItem={onDropSubItem}
            onToggleExpand={onToggleExpand}
            onUpdateGroupName={onUpdateGroupName}
            onDeleteGroup={onDeleteGroup}
            onAddCategoryToGroup={onAddCategoryToGroup}
            onSelectCategory={onSelectCategory}
            onUpdateCategoryName={onUpdateCategoryName}
            onDeleteCategory={onDeleteCategory}
            onCategoryDragStart={onCategoryDragStart}
            onCategoryDragOver={onCategoryDragOver}
            onCategoryDrop={onCategoryDrop}
            onCategoryDragEnd={onCategoryDragEnd}
          />
        );
      })}

      {unclassifiedItems.length > 0 && (
        <CategoryGroupAccordion
          group={{
            id: 'grp-unclassified',
            topCategoryId: currentTopId || '',
            name: '미분류 카테고리',
            isExpanded: true,
            order: 9999,
          }}
          items={unclassifiedItems}
          selectedCategoryId={selectedCategoryId}
          draggedCategoryId={draggedCategoryId}
          onMoveGroup={() => {}}
          onMoveCategory={(catId, dir) => onMoveCategory(catId, dir, undefined)}
          groupTargets={groupTargets}
          onMoveCategoryToGroup={onMoveCategoryToGroup}
          onDropSubItem={onDropSubItem}
          onToggleExpand={() => {}}
          onUpdateGroupName={() => {}}
          onDeleteGroup={() => {}}
          onAddCategoryToGroup={() => currentTopId && onAddCategoryToGroup('')}
          onSelectCategory={onSelectCategory}
          onUpdateCategoryName={onUpdateCategoryName}
          onDeleteCategory={onDeleteCategory}
          onCategoryDragStart={onCategoryDragStart}
          onCategoryDragOver={onCategoryDragOver}
          onCategoryDrop={onCategoryDrop}
          onCategoryDragEnd={onCategoryDragEnd}
        />
      )}

      {currentGroups.length === 0 && unclassifiedItems.length === 0 && (
        <div className="p-8 text-center text-xs text-slate-400 leading-relaxed">
          등록된 그룹이나 카테고리가 없습니다.<br />
          상단 툴바의 <strong>[+ 그룹 추가]</strong> 또는 <strong>[+ 카테고리 추가]</strong>를 눌러보세요.
        </div>
      )}
    </div>
  );
};
