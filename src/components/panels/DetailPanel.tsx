import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActivePanel } from '../../types';
import { DetailHeader } from '../detail/DetailHeader';
import { DetailCommandBar } from '../detail/DetailCommandBar';
import { TextGroupSection } from '../detail/TextGroupSection';
import { ChecklistGroupSection } from '../detail/ChecklistGroupSection';

interface DetailPanelProps {
  panelId: ActivePanel;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ panelId }) => {
  const {
    panel3State,
    panel4State,
    setPanelDetailTab,
    subItems,
    textGroups,
    setTextGroups,
    checklistGroups,
    setChecklistGroups,
    addTextGroup,
    addChecklistGroup,
  } = useWorkspace();

  const currentState = panelId === 'panel-3' ? panel3State : panel4State;
  const currentSubItem = subItems.find((s) => s.id === currentState.subItemId);

  const currentTextGroups = textGroups.filter(
    (g) => g.subItemId === currentState.subItemId
  );
  const currentChecklistGroups = checklistGroups.filter(
    (g) => g.subItemId === currentState.subItemId
  );

  const handleAddGroup = () => {
    if (!currentState.subItemId) return;
    if (currentState.activeTab === 'text') {
      addTextGroup(currentState.subItemId);
    } else {
      addChecklistGroup(currentState.subItemId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 select-none">
      <DetailHeader subItem={currentSubItem} />
      <DetailCommandBar
        activeTab={currentState.activeTab}
        textCount={currentTextGroups.length}
        checkCount={currentChecklistGroups.length}
        onTabChange={(tab) => setPanelDetailTab(panelId, tab)}
        onAddGroup={handleAddGroup}
      />

      <div className="flex-1 overflow-y-auto p-0 bg-white">
        {currentState.activeTab === 'text' ? (
          <div>
            {currentTextGroups.map((group) => (
              <TextGroupSection
                key={group.id}
                group={group}
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
                {currentState.subItemId
                  ? '등록된 텍스트 그룹이 없습니다. 상단 [+ 그룹 추가]를 눌러보세요.'
                  : '하위 항목을 선택하세요.'}
              </div>
            )}
          </div>
        ) : (
          <div>
            {currentChecklistGroups.map((group) => (
              <ChecklistGroupSection
                key={group.id}
                group={group}
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
                {currentState.subItemId
                  ? '등록된 체크리스트 그룹이 없습니다. 상단 [+ 그룹 추가]를 눌러보세요.'
                  : '하위 항목을 선택하세요.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
