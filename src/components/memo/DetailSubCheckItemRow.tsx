import React, { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { SubCheckItem } from '../../types';
import { SmartText } from '../shared/SmartText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';
import { InlineEditableTextarea } from '../shared/InlineEditableTextarea';

interface DetailSubCheckItemRowProps {
  item: SubCheckItem;
  isDragging: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMove?: (id: string, direction: MoveDirection) => void;
  forceEdit?: boolean;
  onClearForceEdit?: () => void;
  onToggleComplete: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string, e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const DetailSubCheckItemRow: React.FC<DetailSubCheckItemRowProps> = ({
  item,
  isDragging,
  canMoveUp = true,
  canMoveDown = true,
  onMove,
  forceEdit = false,
  onClearForceEdit,
  onToggleComplete,
  onUpdateText,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (forceEdit) {
      setIsEditing(true);
    }
  }, [forceEdit]);

  const handleSave = (newText: string) => {
    const trimmed = newText.trim();
    if (trimmed) {
      onUpdateText(item.id, trimmed);
    }
    setIsEditing(false);
    onClearForceEdit?.();
  };

  const handleCancel = () => {
    setIsEditing(false);
    onClearForceEdit?.();
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(item.id, e)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(item.id, e)}
      onDragEnd={onDragEnd}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
      className={`pl-2.5 pr-0 py-2 hover:bg-slate-50 transition-colors group select-text text-xs border-b border-slate-100 last:border-b-0 cursor-pointer ${
        isDragging ? 'opacity-40 border border-dashed border-blue-400 bg-blue-50/30' : ''
      }`}
      title={!isEditing ? '더블클릭하여 내용 수정 / 드래그하여 순서 변경' : undefined}
    >
      {isEditing ? (
        <div className="pr-2.5">
          <InlineEditableTextarea
            value={item.text}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
            rows={2}
            saveOnEnter={true}
            placeholder="(체크 항목을 입력하세요)"
          />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1.5 pr-0">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(item.id);
              }}
              className="mt-0.5 text-slate-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              {item.isCompleted ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <div
              className={`flex-1 whitespace-pre-wrap leading-relaxed break-words ${
                item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
              }`}
            >
              <SmartText text={item.text} />
            </div>
          </div>

          <ThreeDotMenu
            onMove={onMove ? (dir) => onMove(item.id, dir) : undefined}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onEdit={() => setIsEditing(true)}
            onCopy={() => navigator.clipboard.writeText(item.text)}
            onDelete={() => onDelete(item.id)}
            deleteTitle="이 체크 항목을 삭제하시겠습니까?"
          />
        </div>
      )}
    </div>
  );
};
