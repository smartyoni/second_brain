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
  onToggleExpand: (groupId: string) => void;
  onUpdateGroupName: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddBlock: (groupId: string) => void;
  onUpdateBlockText: (groupId: string, blockId: string, text: string) => void;
  onDeleteBlock: (groupId: string, blockId: string) => void;
}

export const TextGroupSection: React.FC<TextGroupSectionProps> = ({
  group,
  canMoveUp = true,
  canMoveDown = true,
  onMoveGroup,
  onToggleExpand,
  onUpdateGroupName,
  onDeleteGroup,
  onAddBlock,
  onUpdateBlockText,
  onDeleteBlock,
}) => {
  const { updateTextBlockDueDate, setSelectedCalendarDate } = useWorkspace();
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [schedulingBlockId, setSchedulingBlockId] = useState<string | null>(null);

  const selectedSchedulingBlock = group.blocks.find((b) => b.id === schedulingBlockId);

  return (
    <div className="w-full border-b border-slate-300 bg-white">
      {/* 그룹 헤더 */}
      <div
        onClick={() => onToggleExpand(group.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditingGroupName(true);
        }}
        className="h-8 px-2 bg-[#5ea578] hover:bg-[#4f9569] text-white flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none transition-colors pr-0 border-b border-[#43835a]"
      >
        {group.isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/95 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-white/95 shrink-0" />
        )}

        <Folder className="w-3.5 h-3.5 text-white/95 shrink-0" />

        <div className="flex-1 min-w-0" onClick={(e) => isEditingGroupName && e.stopPropagation()}>
          <InlineEditableText
            value={group.name}
            isEditing={isEditingGroupName}
            onSave={(newName) => {
              onUpdateGroupName(group.id, newName);
              setIsEditingGroupName(false);
            }}
            onCancel={() => setIsEditingGroupName(false)}
            className="text-xs truncate block text-white font-bold"
            inputClassName="text-xs h-6 py-0 px-1 text-slate-900 font-semibold"
          />
        </div>

        <button
          type="button"
          title="텍스트 블록 추가"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock(group.id);
          }}
          className="p-1 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
        >
          <span className="text-sm font-bold leading-none">+</span>
        </button>

        <ThreeDotMenu
          onMove={onMoveGroup ? (dir) => onMoveGroup(group.id, dir) : undefined}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onEdit={() => setIsEditingGroupName(true)}
          onDelete={() => onDeleteGroup(group.id)}
          deleteTitle="이 텍스트박스 그룹을 삭제하시겠습니까?"
          buttonClassName="text-white/90 hover:text-white hover:bg-white/20"
        />
      </div>

      {/* 하위 텍스트 블록 목록 */}
      {group.isExpanded && (
        <div className="divide-y divide-slate-100">
          {group.blocks.map((block) => (
            <TextBlockRow
              key={block.id}
              block={block}
              groupId={group.id}
              onUpdateText={onUpdateBlockText}
              onDeleteBlock={onDeleteBlock}
              onOpenSchedule={(blockId) => setSchedulingBlockId(blockId)}
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
