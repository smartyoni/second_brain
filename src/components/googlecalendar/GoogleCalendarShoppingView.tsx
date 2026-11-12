import React, { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { TextBlock, TextGroupData } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TextBlockRow } from '../detail/TextBlockRow';
import { SchedulePickerPopover } from '../shared/SchedulePickerPopover';
import { MoveDirection } from '../shared/ThreeDotMenu';
import { moveArrayItem } from '../../utils/orderUtils';

const SHOPPING_GROUP_ID = 'tg-calendar-shopping';
const SHOPPING_SUB_ITEM_ID = '__calendar_shopping__';

/**
 * 캘린더 3번 패널의 쇼핑 탭 뷰.
 * 별도 그룹 생성 없이 텍스트 박스(TextBlockRow)를 직접 추가·편집·순서 이동·삭제할 수 있습니다.
 */
export const GoogleCalendarShoppingView: React.FC = () => {
  const { textGroups, setTextGroups, updateTextBlockDueDate } = useWorkspace();
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [schedulingBlockId, setSchedulingBlockId] = useState<string | null>(null);

  const shoppingGroup = textGroups.find((g) => g.id === SHOPPING_GROUP_ID);
  const blocks: TextBlock[] = shoppingGroup?.blocks ?? [];
  const selectedSchedulingBlock = blocks.find((b) => b.id === schedulingBlockId);

  const handleAddBlock = () => {
    const newId = `tb-shop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newBlock: TextBlock = {
      id: newId,
      text: '',
      order: blocks.length,
    };

    setTextGroups((prev) => {
      const exists = prev.some((g) => g.id === SHOPPING_GROUP_ID);
      if (!exists) {
        const newGroup: TextGroupData = {
          id: SHOPPING_GROUP_ID,
          subItemId: SHOPPING_SUB_ITEM_ID,
          name: '쇼핑',
          isExpanded: true,
          order: 0,
          blocks: [newBlock],
        };
        return [...prev, newGroup];
      }
      return prev.map((g) =>
        g.id === SHOPPING_GROUP_ID
          ? {
              ...g,
              blocks: [...g.blocks, newBlock].map((b, idx) => ({ ...b, order: idx })),
            }
          : g
      );
    });

    setEditingBlockId(newId);
  };

  const handleUpdateBlockText = (_groupId: string, blockId: string, text: string) => {
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === SHOPPING_GROUP_ID
          ? {
              ...g,
              blocks: g.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)),
            }
          : g
      )
    );
  };

  const handleDeleteBlock = (_groupId: string, blockId: string) => {
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === SHOPPING_GROUP_ID
          ? {
              ...g,
              blocks: g.blocks
                .filter((b) => b.id !== blockId)
                .map((b, idx) => ({ ...b, order: idx })),
            }
          : g
      )
    );
    if (editingBlockId === blockId) {
      setEditingBlockId(null);
    }
  };

  const handleMoveBlock = (_groupId: string, blockId: string, direction: MoveDirection) => {
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === SHOPPING_GROUP_ID
          ? { ...g, blocks: moveArrayItem(g.blocks, blockId, direction) }
          : g
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-none">
      {/* 상단 액션 바 */}
      <div className="px-3 py-2 border-b border-[#dadce0] bg-[#fafafa] flex items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] font-medium text-[#5f6368]">
          총 {blocks.length}개의 텍스트 박스
        </span>
        <button
          type="button"
          onClick={handleAddBlock}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
          title="새 텍스트 박스 추가"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>텍스트 박스 추가</span>
        </button>
      </div>

      {/* 텍스트 박스 목록 */}
      <div className="flex-1 overflow-y-auto bg-white">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center text-[#5f6368]">
            <ShoppingBag className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              등록된 텍스트 박스가 없습니다.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              상단 [텍스트 박스 추가] 버튼을 눌러 내용을 자유롭게 적어보세요.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blocks.map((block, idx) => (
              <TextBlockRow
                key={block.id}
                block={block}
                groupId={SHOPPING_GROUP_ID}
                canMoveUp={idx > 0}
                canMoveDown={idx < blocks.length - 1}
                onMoveBlock={handleMoveBlock}
                onUpdateText={handleUpdateBlockText}
                onDeleteBlock={handleDeleteBlock}
                onOpenSchedule={(blockId) => setSchedulingBlockId(blockId)}
                isEditing={editingBlockId === block.id}
                onStartEdit={() => setEditingBlockId(block.id)}
                onEndEdit={() => {
                  if (editingBlockId === block.id) setEditingBlockId(null);
                }}
                onSaveAndAddNew={() => handleAddBlock()}
              />
            ))}
          </div>
        )}
      </div>

      {schedulingBlockId && selectedSchedulingBlock && (
        <SchedulePickerPopover
          isOpen={true}
          initialDate={selectedSchedulingBlock.dueDate}
          initialTime={selectedSchedulingBlock.dueTime}
          initialEndDate={selectedSchedulingBlock.endDate}
          onClose={() => setSchedulingBlockId(null)}
          onSave={(date, time, endDate) => {
            updateTextBlockDueDate(SHOPPING_GROUP_ID, schedulingBlockId, date, time, endDate);
            setSchedulingBlockId(null);
          }}
          onRemove={() => {
            updateTextBlockDueDate(SHOPPING_GROUP_ID, schedulingBlockId, undefined, undefined, undefined);
            setSchedulingBlockId(null);
          }}
        />
      )}
    </div>
  );
};
