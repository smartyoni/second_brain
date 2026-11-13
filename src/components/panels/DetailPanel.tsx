import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActivePanel } from '../../types';
import { DetailHeader } from '../detail/DetailHeader';
import { ChecklistGroupSection } from '../detail/ChecklistGroupSection';
import {
  moveScopedItem,
  moveChecklistItem,
  moveChecklistItemToGroup,
} from '../../utils/orderUtils';

interface DetailPanelProps {
  panelId: ActivePanel;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ panelId }) => {
  const {
    panel3State,
    panel4State,
    subItems,
    checklistGroups,
    setChecklistGroups,
    addChecklistGroup,
    selectedDetailItem,
    setSelectedDetailItem,
  } = useWorkspace();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const currentState = panelId === 'panel-3' ? panel3State : panel4State;
  const currentSubItem = subItems.find((s) => s.id === currentState.subItemId);

  const currentChecklistGroups = checklistGroups.filter(
    (g) => g.subItemId === currentState.subItemId
  );

  const checklistGroupTargets = currentChecklistGroups.map((g) => ({ id: g.id, name: g.name }));

  // 이동한 항목이 선택 상태라면 새 그룹 기준으로 선택 정보 갱신
  const keepSelection = (fromId: string, itemId: string, toId: string) => {
    if (
      selectedDetailItem &&
      selectedDetailItem.type === 'checklist' &&
      selectedDetailItem.groupId === fromId &&
      selectedDetailItem.itemId === itemId
    ) {
      setSelectedDetailItem({ ...selectedDetailItem, groupId: toId });
    }
  };

  const handleAddGroup = () => {
    if (!currentState.subItemId) return;
    const newGroupId = addChecklistGroup(currentState.subItemId);
    if (newGroupId) {
      setEditingGroupId(newGroupId);
    }
  };

  const handleAddItemToGroup = (groupId: string): string => {
    const newId = `ci-${Date.now()}`;
    setChecklistGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newItem = {
          id: newId,
          text: '',
          isCompleted: false,
          order: 0,
        };
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

  // 3번 패널 선택 시 Shift + Enter 누를 시 그룹 내 새 항목 추가 발동
  useEffect(() => {
    const handlePanelAdd = (e: Event) => {
      const customEvent = e as CustomEvent<{ panelId: string }>;
      if (customEvent.detail?.panelId !== 'panel-3') return;

      if (currentChecklistGroups.length === 0) {
        if (currentState.subItemId) {
          const newGroupId = addChecklistGroup(currentState.subItemId);
          if (newGroupId) {
            handleAddItemToGroup(newGroupId);
          }
        }
        return;
      }

      const targetGroup =
        currentChecklistGroups.find((g) => g.id === selectedDetailItem?.groupId) ||
        currentChecklistGroups[0];

      if (targetGroup) {
        handleAddItemToGroup(targetGroup.id);
      }
    };

    window.addEventListener('secondbrain-panel-add-item', handlePanelAdd);
    return () => window.removeEventListener('secondbrain-panel-add-item', handlePanelAdd);
  }, [currentChecklistGroups, selectedDetailItem, currentState.subItemId]);

  return (
    <div className="flex flex-col h-full bg-slate-100 select-none">
      <DetailHeader subItem={currentSubItem} onAddGroup={handleAddGroup} />

      <div className="flex-1 overflow-y-auto p-0 bg-white">
        {currentChecklistGroups.map((group, idx) => (
          <ChecklistGroupSection
            key={group.id}
            group={group}
            canMoveUp={idx > 0}
            canMoveDown={idx < currentChecklistGroups.length - 1}
            onMoveGroup={(id, direction) =>
              setChecklistGroups((prev) =>
                moveScopedItem(prev, (g) => g.subItemId === group.subItemId, id, direction)
              )
            }
            groupTargets={checklistGroupTargets}
            onMoveItemToGroup={(fromId, itemId, toId) => {
              setChecklistGroups((prev) => moveChecklistItemToGroup(prev, fromId, itemId, toId));
              keepSelection(fromId, itemId, toId);
            }}
            onMoveItem={(gId, itemId, direction) =>
              setChecklistGroups((prev) =>
                prev.map((g) =>
                  g.id === gId
                    ? { ...g, items: moveChecklistItem(g.items, itemId, direction) }
                    : g
                )
              )
            }
            onToggleExpand={(id) =>
              setChecklistGroups((prev) =>
                prev.map((g) => (g.id === id ? { ...g, isExpanded: !g.isExpanded } : g))
              )
            }
            onUpdateGroupName={(id, name) =>
              setChecklistGroups((prev) =>
                prev.map((g) => (g.id === id ? { ...g, name } : g))
              )
            }
            isEditingGroupName={editingGroupId === group.id}
            onStartEditGroupName={() => setEditingGroupId(group.id)}
            onEndEditGroupName={() => {
              if (editingGroupId === group.id) {
                setEditingGroupId(null);
              }
            }}
            onDeleteGroup={(id) =>
              setChecklistGroups((prev) => prev.filter((g) => g.id !== id))
            }
            onAddItem={(id) => handleAddItemToGroup(id)}
            editingItemId={editingItemId}
            onStartEditItem={(id) => setEditingItemId(id)}
            onEndEditItem={() => setEditingItemId(null)}
            onToggleItemComplete={(gId, itemId) =>
              setChecklistGroups((prev) =>
                prev.map((g) => {
                  if (g.id !== gId) return g;
                  const toggled = g.items.map((i) =>
                    i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
                  );
                  const incomplete = toggled.filter((i) => !i.isCompleted);
                  const completed = toggled.filter((i) => i.isCompleted);
                  const nextItems = [
                    ...incomplete,
                    ...completed.filter((i) => i.id !== itemId),
                    ...completed.filter((i) => i.id === itemId),
                  ].map((item, idx) => ({ ...item, order: idx }));
                  return { ...g, items: nextItems };
                })
              )
            }
            onUpdateItemText={(gId, itemId, text) =>
              setChecklistGroups((prev) =>
                prev.map((g) =>
                  g.id === gId
                    ? {
                        ...g,
                        items: g.items.map((i) => (i.id === itemId ? { ...i, text } : i)),
                      }
                    : g
                )
              )
            }
            onDeleteItem={(gId, itemId) =>
              setChecklistGroups((prev) =>
                prev.map((g) =>
                  g.id === gId
                    ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
                    : g
                )
              )
            }
          />
        ))}
        {currentChecklistGroups.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            {currentState.subItemId
              ? '등록된 체크리스트 그룹이 없습니다. 상단 [+ 추가]를 눌러보세요.'
              : '하위 항목을 선택하세요.'}
          </div>
        )}
      </div>
    </div>
  );
};
