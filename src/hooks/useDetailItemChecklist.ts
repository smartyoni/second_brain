import { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { SubCheckItem } from '../types';

export const useDetailItemChecklist = () => {
  const {
    selectedDetailItem,
    checklistGroups,
    setChecklistGroups,
    textGroups,
    setTextGroups,
  } = useWorkspace();

  const [newItemText, setNewItemText] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // 선택된 대상 항목 변경 시 입력 상태 초기화
  useEffect(() => {
    setNewItemText('');
    setEditingItemId(null);
  }, [selectedDetailItem?.itemId]);

  // 현재 선택된 3번 패널 항목 정보 및 하위 체크리스트 조회
  const targetItem = useMemo(() => {
    if (!selectedDetailItem) return null;
    const { type, groupId, itemId } = selectedDetailItem;

    if (type === 'checklist') {
      const grp = checklistGroups.find((g) => g.id === groupId);
      const itm = grp?.items.find((i) => i.id === itemId);
      if (!itm) return null;
      return {
        type,
        groupId,
        itemId,
        title: itm.text,
        checklist: itm.checklist || [],
      };
    } else {
      const grp = textGroups.find((g) => g.id === groupId);
      const blk = grp?.blocks.find((b) => b.id === itemId);
      if (!blk) return null;
      const firstLine = blk.text.split('\n')[0] || grp?.name || '';
      return {
        type,
        groupId,
        itemId,
        title: firstLine,
        checklist: blk.checklist || [],
      };
    }
  }, [selectedDetailItem, checklistGroups, textGroups]);

  // 선택된 항목의 하위 체크리스트 배열 업데이트 헬퍼
  const updateTargetChecklist = (updater: (prev: SubCheckItem[]) => SubCheckItem[]) => {
    if (!selectedDetailItem) return;
    const { type, groupId, itemId } = selectedDetailItem;

    if (type === 'checklist') {
      setChecklistGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                items: g.items.map((i) =>
                  i.id === itemId ? { ...i, checklist: updater(i.checklist || []) } : i
                ),
              }
            : g
        )
      );
    } else {
      setTextGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                blocks: g.blocks.map((b) =>
                  b.id === itemId ? { ...b, checklist: updater(b.checklist || []) } : b
                ),
              }
            : g
        )
      );
    }
  };

  // 체크리스트 항목 추가 (미완료 목록 하단, 완료된 항목들 상단에 배치)
  const handleAddChecklistItem = (customText?: string) => {
    if (!targetItem) return;
    const trimmed = customText !== undefined ? customText.trim() : newItemText.trim();
    const isDirectButtonAdd = customText === undefined && !trimmed;
    const textToUse = trimmed || '새 체크 항목';
    const newId = `sci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    updateTargetChecklist((prev) => {
      const newItem: SubCheckItem = {
        id: newId,
        text: textToUse,
        isCompleted: false,
        order: 0,
      };
      const incomplete = prev.filter((item) => !item.isCompleted);
      const completed = prev.filter((item) => item.isCompleted);
      return [...incomplete, newItem, ...completed].map((item, idx) => ({
        ...item,
        order: idx,
      }));
    });

    if (isDirectButtonAdd) {
      setEditingItemId(newId);
    } else {
      setNewItemText('');
    }
  };

  // 완료 토글 (완료 표시된 항목은 즉시 리스트 하단으로 이동)
  const handleToggleComplete = (subId: string) => {
    updateTargetChecklist((prev) => {
      const toggled = prev.map((item) =>
        item.id === subId ? { ...item, isCompleted: !item.isCompleted } : item
      );
      const incomplete = toggled.filter((item) => !item.isCompleted);
      const completed = toggled.filter((item) => item.isCompleted);
      return [
        ...incomplete,
        ...completed.filter((item) => item.id !== subId),
        ...completed.filter((item) => item.id === subId),
      ].map((item, idx) => ({ ...item, order: idx }));
    });
  };

  // 내용 수정
  const handleUpdateText = (subId: string, newText: string) => {
    const cleaned = newText.trim();
    if (!cleaned) return;
    updateTargetChecklist((prev) =>
      prev.map((item) => (item.id === subId ? { ...item, text: cleaned } : item))
    );
  };

  // 항목 삭제
  const handleDeleteItem = (subId: string) => {
    updateTargetChecklist((prev) =>
      prev
        .filter((item) => item.id !== subId)
        .map((item, idx) => ({ ...item, order: idx }))
    );
  };

  // 드래그 앤 드롭 순서 변경 (미완료 상단 / 완료 하단 구역 유지)
  const handleReorderItems = (reordered: SubCheckItem[]) => {
    updateTargetChecklist(() => {
      const incomplete = reordered.filter((item) => !item.isCompleted);
      const completed = reordered.filter((item) => item.isCompleted);
      return [...incomplete, ...completed].map((item, idx) => ({
        ...item,
        order: idx,
      }));
    });
  };

  const checklistItems = useMemo(() => {
    const raw = targetItem?.checklist || [];
    return [...raw].sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [targetItem?.checklist]);
  const completedCount = checklistItems.filter((i) => i.isCompleted).length;
  const totalCount = checklistItems.length;

  return {
    targetItem,
    checklistItems,
    completedCount,
    totalCount,
    newItemText,
    setNewItemText,
    editingItemId,
    setEditingItemId,
    handleAddChecklistItem,
    handleToggleComplete,
    handleUpdateText,
    handleDeleteItem,
    handleReorderItems,
  };
};
