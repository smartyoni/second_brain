import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProjectDetailHeader } from './ProjectDetailHeader';
import { TextGroupSection } from '../detail/TextGroupSection';
import { ChecklistGroupSection } from '../detail/ChecklistGroupSection';
import {
  moveScopedItem,
  moveArrayItem,
  moveChecklistItem,
  moveBlockToGroup,
  moveChecklistItemToGroup,
} from '../../utils/orderUtils';

export const ProjectDetailPanel: React.FC = () => {
  const {
    panel3State,
    setPanelDetailTab,
    subItems,
    textGroups,
    setTextGroups,
    checklistGroups,
    setChecklistGroups,
    addTextGroup,
    addChecklistGroup,
    selectedDetailItem,
    setSelectedDetailItem,
  } = useWorkspace();

  const currentSubItem = subItems.find((s) => s.id === panel3State.subItemId);
  const activeTab = panel3State.activeTab;

  const currentTextGroups = textGroups.filter(
    (g) => g.subItemId === panel3State.subItemId
  );
  const currentChecklistGroups = checklistGroups.filter(
    (g) => g.subItemId === panel3State.subItemId
  );

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
    if (activeTab === 'text') {
      addTextGroup(panel3State.subItemId);
    } else {
      addChecklistGroup(panel3State.subItemId);
    }
  };

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
                onDeleteGroup={(id) =>
                  setTextGroups((prev) => prev.filter((g) => g.id !== id))
                }
                onAddBlock={(id) =>
                  setTextGroups((prev) =>
                    prev.map((g) =>
                      g.id === id
                        ? {
                            ...g,
                            blocks: [
                              ...g.blocks,
                              { id: `b-${Date.now()}`, text: '', order: g.blocks.length },
                            ],
                          }
                        : g
                    )
                  )
                }
                onUpdateBlockText={(gId, bId, text) =>
                  setTextGroups((prev) =>
                    prev.map((g) =>
                      g.id === gId
                        ? {
                            ...g,
                            blocks: g.blocks.map((b) => (b.id === bId ? { ...b, text } : b)),
                          }
                        : g
                    )
                  )
                }
                onDeleteBlock={(gId, bId) =>
                  setTextGroups((prev) =>
                    prev.map((g) =>
                      g.id === gId
                        ? { ...g, blocks: g.blocks.filter((b) => b.id !== bId) }
                        : g
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
          <div>
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
                  keepSelection('checklist', fromId, itemId, toId);
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
                onDeleteGroup={(id) =>
                  setChecklistGroups((prev) => prev.filter((g) => g.id !== id))
                }
                onAddItem={(id) =>
                  setChecklistGroups((prev) =>
                    prev.map((g) => {
                      if (g.id !== id) return g;
                      const newItem = {
                        id: `ci-${Date.now()}`,
                        text: '새 할 일',
                        isCompleted: false,
                        order: 0,
                      };
                      const incomplete = g.items.filter((i) => !i.isCompleted);
                      const completed = g.items.filter((i) => i.isCompleted);
                      const nextItems = [...incomplete, newItem, ...completed].map(
                        (item, idx) => ({ ...item, order: idx })
                      );
                      return { ...g, items: nextItems };
                    })
                  )
                }
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
                등록된 작업(TODO) 그룹이 없습니다.
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="block mx-auto mt-2 text-indigo-600 font-semibold hover:underline"
                >
                  + 작업(TODO) 그룹 추가
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
