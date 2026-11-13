import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { SubItem } from '../../types';
import { InlineEditableTextarea } from '../shared/InlineEditableTextarea';
import { SmartText } from '../shared/SmartText';
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
  showCheckbox?: boolean;
  onToggleComplete?: (id: string) => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  onSaveAndAddNew?: () => void;
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
  showCheckbox = false,
  onToggleComplete,
  isEditing: propIsEditing,
  onStartEdit,
  onEndEdit,
  onSaveAndAddNew,
}) => {
  const [internalEditing, setInternalEditing] = useState(false);
  const isEditing = propIsEditing !== undefined ? propIsEditing : internalEditing;

  const handleStartEdit = () => {
    if (onStartEdit) onStartEdit();
    else setInternalEditing(true);
  };

  const handleEndEdit = () => {
    if (onEndEdit) onEndEdit();
    else setInternalEditing(false);
  };

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
        handleStartEdit();
      }}
      className={`group relative min-h-[44px] lg:min-h-[32px] py-2 lg:py-1.5 px-3 lg:px-2.5 flex items-start gap-2 lg:gap-1.5 text-sm lg:text-xs cursor-pointer select-none border-b border-slate-200 transition-colors pr-0 ${
        isSelected
          ? item.isCompleted
            ? 'bg-blue-50/80 text-blue-900 font-medium shadow-xs'
            : 'bg-blue-100 text-blue-950 font-bold shadow-xs'
          : item.isCompleted
          ? 'bg-slate-50/70 hover:bg-slate-100 text-slate-400'
          : 'hover:bg-slate-100 text-slate-800'
      } ${isDragged ? 'opacity-40 border-dashed border-slate-400' : ''}`}
    >
      {/* 선택 시 좌측 파란색 포인트 바 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
      )}

      {/* 퀵메모탭 전용 처리완료 체크박스 */}
      {showCheckbox && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(item.id);
          }}
          className="p-1 -m-1 lg:p-0.5 lg:-m-0.5 mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
          title={item.isCompleted ? '미완료로 변경' : '완료로 처리'}
        >
          {item.isCompleted ? (
            <CheckSquare className="w-4.5 h-4.5 lg:w-4 lg:h-4 text-blue-600" />
          ) : (
            <Square className="w-4.5 h-4.5 lg:w-4 lg:h-4 text-slate-400 hover:text-slate-600" />
          )}
        </button>
      )}

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <InlineEditableTextarea
            value={item.title}
            isEditing={isEditing}
            placeholder="항목 제목 입력..."
            minRows={1}
            maxRows={10}
            rows={1}
            saveOnEnter={false}
            onSave={(newTitle) => {
              if (!newTitle.trim() && !item.title.trim()) {
                onDelete(item.id);
              } else {
                onUpdateTitle(item.id, newTitle.trim() || '새 항목');
              }
              handleEndEdit();
            }}
            onCancel={() => {
              if (!item.title.trim()) {
                onDelete(item.id);
              }
              handleEndEdit();
            }}
            onSaveAndAddNew={
              onSaveAndAddNew
                ? (newTitle) => {
                    if (!newTitle.trim() && !item.title.trim()) {
                      onDelete(item.id);
                    } else {
                      onUpdateTitle(item.id, newTitle.trim() || '새 항목');
                    }
                    handleEndEdit();
                    onSaveAndAddNew();
                  }
                : undefined
            }
          />
        ) : (
          <div
            className={`text-sm lg:text-xs whitespace-pre-wrap break-words leading-relaxed select-text ${
              item.isCompleted
                ? 'line-through text-slate-400 opacity-80 font-normal'
                : ''
            }`}
          >
            {item.title ? (
              <SmartText text={item.title} />
            ) : (
              <span className="text-slate-400 italic">제목 없음</span>
            )}
          </div>
        )}
      </div>

      <ThreeDotMenu
        onMove={onMove}
        targetItems={categoryTargets}
        targetActionLabel="카테고리 이동"
        onMoveToTarget={onMoveToCategory}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={() => handleStartEdit()}
        onDelete={() => onDelete(item.id)}
        deleteTitle={`'${item.title}' 문서를 삭제하시겠습니까?`}
        buttonClassName="p-2 lg:p-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 mt-0.5"
      />
    </div>
  );
};
