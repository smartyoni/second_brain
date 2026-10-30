import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { TextBlock } from '../../types';
import { SmartText } from '../shared/SmartText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';
import { InlineEditableTextarea } from '../shared/InlineEditableTextarea';
import { useWorkspace } from '../../context/WorkspaceContext';

interface TextBlockRowProps {
  block: TextBlock;
  groupId: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveBlock?: (groupId: string, blockId: string, direction: MoveDirection) => void;
  groupTargets?: { id: string; name: string }[];
  onMoveToGroup?: (groupId: string, blockId: string, toGroupId: string) => void;
  onUpdateText: (groupId: string, blockId: string, text: string) => void;
  onDeleteBlock: (groupId: string, blockId: string) => void;
  onOpenSchedule: (blockId: string) => void;
}

export const TextBlockRow: React.FC<TextBlockRowProps> = ({
  block,
  groupId,
  canMoveUp = true,
  canMoveDown = true,
  onMoveBlock,  groupTargets,  onMoveToGroup,
  onUpdateText,
  onDeleteBlock,
  onOpenSchedule,
}) => {
  const { setSelectedCalendarDate, selectedDetailItem, setSelectedDetailItem } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const isSelected = selectedDetailItem?.itemId === block.id;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = (newText: string) => {
    onUpdateText(groupId, block.id, newText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div
      onClick={() => {
        if (!isEditing) {
          setSelectedDetailItem({ type: 'text', groupId, itemId: block.id });
          if (block.dueDate) {
            setSelectedCalendarDate(block.dueDate);
          }
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
      className={`p-3 hover:bg-slate-50 transition-colors group select-text text-xs border-b border-slate-100 last:border-b-0 cursor-pointer ${
        isSelected ? 'bg-emerald-50/70 ring-1 ring-emerald-300 rounded' : block.dueDate ? 'hover:bg-emerald-50/30' : ''
      }`}
      title={
        !isEditing
          ? block.dueDate
            ? `더블클릭: 인라인 편집 | 클릭: 등록된 일정(${block.dueDate})으로 이동`
            : '더블클릭하여 내용 수정'
          : undefined
      }
    >
      {isEditing ? (
        <InlineEditableTextarea
          value={block.text}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          rows={3}
          saveOnEnter={false}
          placeholder="(내용을 입력하세요)"
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="text-slate-800 text-sm leading-none mt-1 select-none font-bold">
              •
            </span>
            <div className="flex-1 whitespace-pre-wrap leading-relaxed text-slate-800">
              {block.text ? (
                <SmartText text={block.text} />
              ) : (
                <span className="text-slate-400 italic">(빈 블록 - 더블클릭하여 작성)</span>
              )}
            </div>

            {/* 날짜 뱃지: 클릭 시 해당 일정 날짜로 즉시 이동 */}
            {block.dueDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCalendarDate(block.dueDate!);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 border border-emerald-300 shrink-0 font-semibold cursor-pointer transition-colors shadow-2xs"
                title={`클릭 시 등록된 일정(${block.dueDate}${block.endDate ? ` ~ ${block.endDate}` : ''})으로 이동`}
              >
                <CalendarIcon className="w-3 h-3 text-emerald-600" />
                <span>
                  {block.dueDate.slice(5)}
                  {block.endDate && ` ~ ${block.endDate.slice(5)}`}
                </span>
                {block.dueTime && <span>{block.dueTime}</span>}
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              title={block.dueDate ? '일정 수정/해제' : '일정 등록'}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSchedule(block.id);
              }}
              className={`p-0.5 rounded transition-colors cursor-pointer ${
                block.dueDate
                  ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>

            <ThreeDotMenu
              onMove={onMoveBlock ? (dir) => onMoveBlock(groupId, block.id, dir) : undefined}
        groupTargets={groupTargets}
        onMoveToGroup={onMoveToGroup ? (gid) => onMoveToGroup(groupId, block.id, gid) : undefined}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onEdit={() => setIsEditing(true)}
              onCopy={() => copyToClipboard(block.text)}
              onDelete={() => onDeleteBlock(groupId, block.id)}
              deleteTitle="이 텍스트 블록을 삭제하시겠습니까?"
              customItems={
                block.dueDate
                  ? [
                      {
                        label: '📅 캘린더 일정으로 이동',
                        onClick: () => setSelectedCalendarDate(block.dueDate!),
                      },
                    ]
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
