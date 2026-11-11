import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { TextGroupData } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';
import { SchedulePickerPopover } from '../shared/SchedulePickerPopover';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TextBlockRow } from './TextBlockRow';

interface TextGroupSectionProps {
  group: TextGroupData;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveGroup?: (groupId: string, direction: MoveDirection) => void;
  onMoveBlock?: (groupId: string, blockId: string, direction: MoveDirection) => void;
  groupTargets?: { id: string; name: string }[];
  onMoveBlockToGroup?: (groupId: string, blockId: string, toGroupId: string) => void;
  onToggleExpand: (groupId: string) => void;
  onUpdateGroupName: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddBlock: (groupId: string) => string | void;
  onUpdateBlockText: (groupId: string, blockId: string, text: string) => void;
  onDeleteBlock: (groupId: string, blockId: string) => void;
  isEditingGroupName?: boolean;
  onStartEditGroupName?: () => void;
  onEndEditGroupName?: () => void;
  editingBlockId?: string | null;
  onStartEditBlock?: (id: string) => void;
  onEndEditBlock?: () => void;
}

export const TextGroupSection: React.FC<TextGroupSectionProps> = ({
  group,
  canMoveUp = true,
  canMoveDown = true,
  onMoveGroup,
  onMoveBlock,  groupTargets,  onMoveBlockToGroup,
  onToggleExpand,
  onUpdateGroupName,
  onDeleteGroup,
  onAddBlock,
  onUpdateBlockText,
  onDeleteBlock,
  isEditingGroupName: propIsEditingGroupName,
  onStartEditGroupName,
  onEndEditGroupName,
  editingBlockId: propEditingBlockId,
  onStartEditBlock,
  onEndEditBlock,
}) => {
  const { updateTextBlockDueDate, setSelectedCalendarDate } = useWorkspace();
  const [internalEditingGroupName, setInternalEditingGroupName] = useState(false);
  const isEditingGroup = propIsEditingGroupName !== undefined ? propIsEditingGroupName : internalEditingGroupName;

  const handleStartEditGroup = () => {
    if (onStartEditGroupName) onStartEditGroupName();
    else setInternalEditingGroupName(true);
  };

  const handleEndEditGroup = () => {
    if (onEndEditGroupName) onEndEditGroupName();
    else setInternalEditingGroupName(false);
  };

  const [schedulingBlockId, setSchedulingBlockId] = useState<string | null>(null);
  const [internalEditingBlockId, setInternalEditingBlockId] = useState<string | null>(null);
  const editingBlockId = propEditingBlockId !== undefined ? propEditingBlockId : internalEditingBlockId;

  const setEditingBlock = (blockId: string | null) => {
    if (blockId) {
      if (onStartEditBlock) onStartEditBlock(blockId);
      else setInternalEditingBlockId(blockId);
    } else {
      if (onEndEditBlock) onEndEditBlock();
      else setInternalEditingBlockId(null);
    }
  };

  const handleAddBlockInternal = () => {
    if (!group.isExpanded) {
      onToggleExpand(group.id);
    }
    const newId = onAddBlock(group.id);
    if (typeof newId === 'string') {
      setEditingBlock(newId);
    }
  };

  const selectedSchedulingBlock = group.blocks.find((b) => b.id === schedulingBlockId);

  return (
    <div className="w-full border-b border-slate-300 bg-white">
      {/* 그룹 헤더 */}
      <div
        onClick={() => onToggleExpand(group.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleStartEditGroup();
        }}
        className="h-10 lg:h-8 px-2.5 lg:px-2 bg-[#5ea578] hover:bg-[#4f9569] text-white flex items-center gap-2 lg:gap-1.5 text-sm lg:text-xs font-bold cursor-pointer select-none transition-colors pr-0 border-b border-[#43835a]"
      >
        {group.isExpanded ? (
          <ChevronDown className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-white/95 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-white/95 shrink-0" />
        )}

        <Folder className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-white/95 shrink-0" />

        <div className="flex-1 min-w-0" onClick={(e) => isEditingGroup && e.stopPropagation()}>
          <InlineEditableText
            value={group.name}
            isEditing={isEditingGroup}
            placeholder="그룹 이름 입력..."
            onSave={(newName) => {
              const finalName = newName.trim() || '새 텍스트그룹';
              onUpdateGroupName(group.id, finalName);
              handleEndEditGroup();
            }}
            onCancel={() => {
              if (!group.name.trim()) {
                onUpdateGroupName(group.id, '새 텍스트그룹');
              }
              handleEndEditGroup();
            }}
            className="text-sm lg:text-xs truncate block text-white font-bold"
            inputClassName="text-sm lg:text-xs h-7 lg:h-6 py-0 px-1 text-slate-900 font-semibold"
          />
        </div>

        <button
          type="button"
          title="텍스트 블록 추가 (Shift+Enter)"
          onClick={(e) => {
            e.stopPropagation();
            handleAddBlockInternal();
          }}
          className="p-1.5 lg:p-1 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
        >
          <span className="text-base lg:text-sm font-bold leading-none">+</span>
        </button>

        <ThreeDotMenu
          onMove={onMoveGroup ? (dir) => onMoveGroup(group.id, dir) : undefined}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onEdit={() => handleStartEditGroup()}
          onDelete={() => onDeleteGroup(group.id)}
          deleteTitle="이 텍스트박스 그룹을 삭제하시겠습니까?"
          buttonClassName="p-2 lg:p-0.5 text-white/90 hover:text-white hover:bg-white/20"
        />
      </div>

      {/* 하위 텍스트 블록 목록 */}
      {group.isExpanded && (
        <div className="divide-y divide-slate-100">
          {group.blocks.map((block, idx) => (
            <TextBlockRow
              key={block.id}
              block={block}
              groupId={group.id}
              canMoveUp={idx > 0}
              canMoveDown={idx < group.blocks.length - 1}
              onMoveBlock={onMoveBlock}
              groupTargets={groupTargets?.filter((g) => g.id !== group.id)}
              onMoveToGroup={onMoveBlockToGroup}
              onUpdateText={onUpdateBlockText}
              onDeleteBlock={onDeleteBlock}
              onOpenSchedule={(blockId) => setSchedulingBlockId(blockId)}
              isEditing={editingBlockId === block.id}
              onStartEdit={() => setEditingBlock(block.id)}
              onEndEdit={() => {
                if (editingBlockId === block.id) {
                  setEditingBlock(null);
                }
              }}
              onSaveAndAddNew={() => handleAddBlockInternal()}
            />
          ))}
        </div>
      )}

      {/* 일정 선택 팝오버 */}
      {selectedSchedulingBlock && (
        <SchedulePickerPopover
          isOpen={!!schedulingBlockId}
          initialDate={selectedSchedulingBlock.dueDate}
          initialTime={selectedSchedulingBlock.dueTime}
          initialEndDate={selectedSchedulingBlock.endDate}
          onSave={(date, time, endDate) => {
            updateTextBlockDueDate(group.id, selectedSchedulingBlock.id, date, time, endDate);
            setSelectedCalendarDate(date); // 등록 즉시 캘린더도 해당 날짜로 이동
            setSchedulingBlockId(null);
          }}
          onRemove={() => {
            updateTextBlockDueDate(group.id, selectedSchedulingBlock.id, undefined, undefined, undefined);
            setSchedulingBlockId(null);
          }}
          onClose={() => setSchedulingBlockId(null)}
        />
      )}
    </div>
  );
};
