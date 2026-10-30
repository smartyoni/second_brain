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
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group relative h-8 px-2.5 flex items-center gap-1.5 text-xs cursor-pointer select-none border-b border-slate-200 transition-colors pr-0 ${
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
          className="text-xs truncate block"
          inputClassName="text-xs h-6 py-0 px-1"
        />
      </div>

      <ThreeDotMenu
        onMove={onMove}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={() => setIsEditing(true)}
        onDelete={() => onDelete(item.id)}
        deleteTitle={`'${item.title}' 문서를 삭제하시겠습니까?`}
      />
    </div>
  );
};
