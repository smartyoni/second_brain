import React from 'react';
import { ChecklistGroupData } from '../../types';
import { ChecklistGroupSection } from '../detail/ChecklistGroupSection';
import {
  moveScopedItem,
  moveChecklistItem,
  moveChecklistItemToGroup,
} from '../../utils/orderUtils';

interface ProjectChecklistGroupListProps {
  groups: ChecklistGroupData[];
  groupTargets: { id: string; name: string }[];
  editingGroupId: string | null;
  onStartEditGroup: (id: string) => void;
  onEndEditGroup: () => void;
  onAddGroup: () => void;
  onAddItem: (groupId: string) => string;
  setChecklistGroups: React.Dispatch<React.SetStateAction<ChecklistGroupData[]>>;
  keepSelection: (type: 'checklist', fromId: string, itemId: string, toId: string) => void;
}

export const ProjectChecklistGroupList: React.FC<ProjectChecklistGroupListProps> = ({
  groups,
  groupTargets,
  editingGroupId,
  onStartEditGroup,
  onEndEditGroup,
  onAddGroup,
  onAddItem,
  setChecklistGroups,
  keepSelection,
}) => {
  if (groups.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        등록된 작업(TODO) 그룹이 없습니다.
        <button
          type="button"
          onClick={onAddGroup}
          className="block mx-auto mt-2 text-indigo-600 font-semibold hover:underline"
        >
          + 작업(TODO) 그룹 추가
        </button>
      </div>
    );
  }

  return (
    <div>
      {groups.map((group, idx) => (
        <ChecklistGroupSection
          key={group.id}
          group={group}
          canMoveUp={idx > 0}
          canMoveDown={idx < groups.length - 1}
          onMoveGroup={(id, direction) =>
            setChecklistGroups((prev) =>
              moveScopedItem(prev, (g) => g.subItemId === group.subItemId, id, direction)
            )
          }
          groupTargets={groupTargets}
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
          isEditingGroupName={editingGroupId === group.id}
          onStartEditGroupName={() => onStartEditGroup(group.id)}
          onEndEditGroupName={onEndEditGroup}
          onDeleteGroup={(id) => setChecklistGroups((prev) => prev.filter((g) => g.id !== id))}
          onAddItem={onAddItem}
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
                ].map((item, index) => ({ ...item, order: index }));
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
    </div>
  );
};
