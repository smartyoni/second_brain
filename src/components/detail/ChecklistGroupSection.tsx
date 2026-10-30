import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { ChecklistGroupData } from '../../types';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu, MoveDirection } from '../shared/ThreeDotMenu';
import { SchedulePickerPopover } from '../shared/SchedulePickerPopover';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckItemRow } from './CheckItemRow';
import { getChecklistMoveBounds } from '../../utils/orderUtils';

interface ChecklistGroupSectionProps {
  group: ChecklistGroupData;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveGroup?: (groupId: string, direction: MoveDirection) => void;
  onMoveItem?: (groupId: string, itemId: string, direction: MoveDirection) => void;
  onToggleExpand: (groupId: string) => void;
  onUpdateGroupName: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddItem: (groupId: string) => void;
  onToggleItemComplete: (groupId: string, itemId: string) => void;
  onUpdateItemText: (groupId: string, itemId: string, text: string) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
}

export const ChecklistGroupSection: React.FC<ChecklistGroupSectionProps> = ({
  group,
  canMoveUp = true,
  canMoveDown = true,
  onMoveGroup,
  onMoveItem,
  onToggleExpand,
  onUpdateGroupName,
  onDeleteGroup,
  onAddItem,
  onToggleItemComplete,
  onUpdateItemText,
  onDeleteItem,
}) => {
  const { updateCheckItemDueDate, setSelectedCalendarDate } = useWorkspace();
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [schedulingItemId, setSchedulingItemId] = useState<string | null>(null);

  const selectedSchedulingItem = group.items.find((i) => i.id === schedulingItemId);
  const completedCount = group.items.filter((i) => i.isCompleted).length;
  // 미완료 항목 상단, 완료된 항목 하단 배치 (안정 정렬)
  const sortedItems = [...group.items].sort(
    (a, b) => Number(a.isCompleted) - Number(b.isCompleted)
  );

  return (
    <div className="w-full border-b border-slate-300 bg-white">
      {/* 그룹 헤더 */}
      <div
        onClick={() => onToggleExpand(group.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditingGroupName(true);
        }}
        className="h-8 px-2 bg-[#5287be] hover:bg-[#4378af] text-white flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none transition-colors pr-0 border-b border-[#3b6f9f]"
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

        <span className="text-[10px] bg-white/25 text-white font-semibold rounded px-1.5 py-0.5 shrink-0">
          {completedCount}/{group.items.length}
        </span>

        <button
          type="button"
          title="체크 항목 추가"
          onClick={(e) => {
            e.stopPropagation();
            onAddItem(group.id);
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
          deleteTitle="이 체크리스트 그룹을 삭제하시겠습니까?"
          buttonClassName="text-white/90 hover:text-white hover:bg-white/20"
        />
      </div>

      {/* 하위 항목 목록 */}
      {group.isExpanded && (
        <div className="divide-y divide-slate-100">
          {sortedItems.map((item) => {
            const { canMoveUp: canItemUp, canMoveDown: canItemDown } =
              getChecklistMoveBounds(sortedItems, item.id);
            return (
              <CheckItemRow
                key={item.id}
                item={item}
                groupId={group.id}
                canMoveUp={canItemUp}
                canMoveDown={canItemDown}
                onMoveItem={onMoveItem}
                onToggleComplete={onToggleItemComplete}
                onUpdateText={onUpdateItemText}
                onDeleteItem={onDeleteItem}
                onOpenSchedule={(itemId) => setSchedulingItemId(itemId)}
              />
            );
          })}
        </div>
      )}

      {/* 일정 선택 팝오버 */}
      {selectedSchedulingItem && (
        <SchedulePickerPopover
          isOpen={!!schedulingItemId}
          initialDate={selectedSchedulingItem.dueDate}
          initialTime={selectedSchedulingItem.dueTime}
          initialEndDate={selectedSchedulingItem.endDate}
          onSave={(date, time, endDate) => {
            updateCheckItemDueDate(group.id, selectedSchedulingItem.id, date, time, endDate);
            setSelectedCalendarDate(date); // 등록 즉시 캘린더도 해당 날짜로 이동
            setSchedulingItemId(null);
          }}
          onRemove={() => {
            updateCheckItemDueDate(group.id, selectedSchedulingItem.id, undefined, undefined, undefined);
            setSchedulingItemId(null);
          }}
          onClose={() => setSchedulingItemId(null)}
        />
      )}
    </div>
  );
};
