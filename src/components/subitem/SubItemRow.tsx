import React, { useState } from 'react';
import { SubItem } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';

interface SubItemRowProps {
  item: SubItem;
  isSelected: boolean;
  isDragged: boolean;
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

export const SubItemRow: React.FC<SubItemRowProps> = ({
  item,
  isSelected,
  isDragged,
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

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => {
        try {
          e.dataTransfer.setData('text/plain', item.id);
          e.dataTransfer.setData('application/subitem-id', item.id);
        } catch {}
        onDragStart(e);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group relative h-11 lg:h-8 px-3 lg:px-2.5 flex items-center gap-2 lg:gap-1.5 text-sm lg:text-xs cursor-pointer select-none border-b border-slate-200 transition-colors pr-0 ${
        isSelected
          ? 'bg-blue-100 text-blue-950 font-bold shadow-xs'
          : 'hover:bg-slate-100 text-slate-800'
      } ${isDragged ? 'opacity-40 border-dashed border-slate-400' : ''}`}
    >
      {/* 선택 시 좌측 파란색 포인트 바 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
      )}

      <div className="flex-1 min-w-0">
        <InlineEditableText
          value={item.title}
          isEditing={isEditing}
          onSave={(newTitle) => {
            onUpdateTitle(item.id, newTitle);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          className="text-sm lg:text-xs truncate block"
          inputClassName="text-sm lg:text-xs h-8 lg:h-6 py-0 px-1.5"
        />
      </div>

      <ThreeDotMenu
        onMove={onMove}
        targetItems={categoryTargets}
        targetActionLabel="카테고리 이동"
        onMoveToTarget={onMoveToCategory}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={() => setIsEditing(true)}
        onDelete={() => onDelete(item.id)}
        deleteTitle={`'${item.title}' 문서를 삭제하시겠습니까?`}
        buttonClassName="p-2 lg:p-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
      />
    </div>
  );
};
