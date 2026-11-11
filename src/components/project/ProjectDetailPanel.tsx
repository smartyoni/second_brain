import React, { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProjectDetailHeader } from './ProjectDetailHeader';
import { TextGroupSection } from '../detail/TextGroupSection';
import { ProjectChecklistGroupList } from './ProjectChecklistGroupList';
import {
  moveScopedItem, moveArrayItem, moveBlockToGroup,
} from '../../utils/orderUtils';

export const ProjectDetailPanel: React.FC = () => {
  const {
    panel3State, setPanelDetailTab, subItems,
    textGroups, setTextGroups, checklistGroups, setChecklistGroups,
    addTextGroup, addChecklistGroup, selectedDetailItem, setSelectedDetailItem,
  } = useWorkspace();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const currentSubItem = subItems.find((s) => s.id === panel3State.subItemId);
  const activeTab = panel3State.activeTab;

  const currentTextGroups = textGroups.filter((g) => g.subItemId === panel3State.subItemId);
  const currentChecklistGroups = checklistGroups.filter((g) => g.subItemId === panel3State.subItemId);

  const textGroupTargets = currentTextGroups.map((g) => ({ id: g.id, name: g.name }));
  const checklistGroupTargets = currentChecklistGroups.map((g) => ({ id: g.id, name: g.name }));

  const keepSelection = (type: 'text' | 'checklist', fromId: string, itemId: string, toId: string) => {
    if (
      selectedDetailItem &&
      selectedDetailItem.type === type &&
      selectedDetailItem.groupId === fromId &&
      selectedDetailItem.itemId === itemId
    ) {
      setSelectedDetailItem({ ...selectedDetailItem, groupId: toId });
    }
  };

  const handleAddGroup = () => {
    if (!panel3State.subItemId) return;
    const newId =
      activeTab === 'text'
        ? addTextGroup(panel3State.subItemId)
        : addChecklistGroup(panel3State.subItemId);
    if (newId) setEditingGroupId(newId);
  };

  const handleAddBlockToGroup = (groupId: string): string => {
    const newId = `b-${Date.now()}`;
    setTextGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, isExpanded: true, blocks: [...g.blocks, { id: newId, text: '', order: g.blocks.length }] }
          : g
      )
    );
    setSelectedDetailItem({ type: 'text', groupId, itemId: newId });
    setEditingItemId(newId);
    return newId;
  };

  const handleAddItemToGroup = (groupId: string): string => {
    const newId = `ci-${Date.now()}`;
    setChecklistGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newItem = { id: newId, text: '', isCompleted: false, order: 0 };
        const incomplete = g.items.filter((i) => !i.isCompleted);
        const completed = g.items.filter((i) => i.isCompleted);
        const nextItems = [...incomplete, newItem, ...completed].map(
          (item, idx) => ({ ...item, order: idx })
        );
        return { ...g, isExpanded: true, items: nextItems };
      })
    );
    setSelectedDetailItem({ type: 'checklist', groupId, itemId: newId });
    setEditingItemId(newId);
    return newId;
  };

  // 단축키: Shift + Enter로 현재 탭의 활성 그룹에 새 항목/블록 추가
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey) {
        const activeEl = document.activeElement;
        const isInputField =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable);
        if (isInputField) return;

        const hasOpenModal = document.querySelector('[role="dialog"], .fixed.inset-0');
        if (hasOpenModal) return;

        if (activeTab === 'text') {
          if (currentTextGroups.length === 0) return;
          const target = currentTextGroups.find((g) => g.id === selectedDetailItem?.groupId) || currentTextGroups[0];
          if (target) {
            e.preventDefault();
            handleAddBlockToGroup(target.id);
          }
        } else {
          if (currentChecklistGroups.length === 0) return;
          const target = currentChecklistGroups.find((g) => g.id === selectedDetailItem?.groupId) || currentChecklistGroups[0];
          if (target) {
            e.preventDefault();
            handleAddItemToGroup(target.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab, currentTextGroups, currentChecklistGroups, selectedDetailItem]);

  // 현재 체크리스트 전체 항목수와 완료수
  const checkStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    currentChecklistGroups.forEach((g) => {
      total += g.items.length;
      completed += g.items.filter((i) => i.isCompleted).length;
    });
    return { total, completed };
  }, [currentChecklistGroups]);

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden select-none">
      <ProjectDetailHeader
        taskTitle={currentSubItem?.title || ''}
        activeTab={activeTab}
        onTabChange={(tab) => setPanelDetailTab('panel-3', tab)}
        onAddGroup={handleAddGroup}
        totalItems={checkStats.total}
        completedItems={checkStats.completed}
      />

      <div className="flex-1 overflow-y-auto">
        {!panel3State.subItemId ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs p-4 text-center">
            2번 패널에서 마일스톤이나 업무를 선택해주세요.
          </div>
        ) : activeTab === 'text' ? (
          <div>
            {currentTextGroups.map((group, idx) => (
              <TextGroupSection
                key={group.id}
                group={group}
                canMoveUp={idx > 0}
                canMoveDown={idx < currentTextGroups.length - 1}
                onMoveGroup={(id, direction) =>
                  setTextGroups((prev) =>
                    moveScopedItem(prev, (g) => g.subItemId === group.subItemId, id, direction)
                  )
                }
                groupTargets={textGroupTargets}
                onMoveBlockToGroup={(fromId, blockId, toId) => {
                  setTextGroups((prev) => moveBlockToGroup(prev, fromId, toId, blockId));
                  keepSelection('text', fromId, blockId, toId);
                }}
                onMoveBlock={(gId, bId, direction) =>
                  setTextGroups((prev) =>
                    prev.map((g) =>
                      g.id === gId
                        ? { ...g, blocks: moveArrayItem(g.blocks, bId, direction) }
                        : g
                    )
                  )
                }
                onToggleExpand={(id) =>
                  setTextGroups((prev) =>
                    prev.map((g) => (g.id === id ? { ...g, isExpanded: !g.isExpanded } : g))
                  )
                }
                onUpdateGroupName={(id, name) =>
                  setTextGroups((prev) =>
                    prev.map((g) => (g.id === id ? { ...g, name } : g))
                  )
                }
                isEditingGroupName={editingGroupId === group.id}
                onStartEditGroupName={() => setEditingGroupId(group.id)}
                onEndEditGroupName={() => {
                  if (editingGroupId === group.id) setEditingGroupId(null);
                }}
                editingBlockId={editingItemId}
                onStartEditBlock={(id) => setEditingItemId(id)}
                onEndEditBlock={() => setEditingItemId(null)}
                onDeleteGroup={(id) => setTextGroups((prev) => prev.filter((g) => g.id !== id))}
                onAddBlock={handleAddBlockToGroup}
                onUpdateBlockText={(gId, bId, text) =>
                  setTextGroups((prev) =>
                    prev.map((g) =>
                      g.id === gId
                        ? { ...g, blocks: g.blocks.map((b) => (b.id === bId ? { ...b, text } : b)) }
                        : g
                    )
                  )
                }
                onDeleteBlock={(gId, bId) =>
                  setTextGroups((prev) =>
                    prev.map((g) =>
                      g.id === gId ? { ...g, blocks: g.blocks.filter((b) => b.id !== bId) } : g
                    )
                  )
                }
              />
            ))}
            {currentTextGroups.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                등록된 기획/노트 그룹이 없습니다.
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="block mx-auto mt-2 text-indigo-600 font-semibold hover:underline"
                >
                  + 기획/노트 그룹 추가
                </button>
              </div>
            )}
          </div>
        ) : (
          <ProjectChecklistGroupList
            groups={currentChecklistGroups}
            groupTargets={checklistGroupTargets}
            editingGroupId={editingGroupId}
            onStartEditGroup={(id) => setEditingGroupId(id)}
            onEndEditGroup={() => setEditingGroupId(null)}
            onAddGroup={handleAddGroup}
            onAddItem={handleAddItemToGroup}
            setChecklistGroups={setChecklistGroups}
            keepSelection={keepSelection}
            editingItemId={editingItemId}
            onStartEditItem={(id) => setEditingItemId(id)}
            onEndEditItem={() => setEditingItemId(null)}
          />
        )}
      </div>
    </div>
  );
};
