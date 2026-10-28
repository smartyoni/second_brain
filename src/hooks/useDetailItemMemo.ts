import { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export const useDetailItemMemo = () => {
  const {
    selectedDetailItem,
    checklistGroups,
    textGroups,
    updateCheckItemMemo,
    updateTextBlockMemo,
  } = useWorkspace();

  // 선택된 실제 항목 데이터 조회
  const targetItem = useMemo(() => {
    if (!selectedDetailItem) return null;
    const { type, groupId, itemId } = selectedDetailItem;

    if (type === 'checklist') {
      const grp = checklistGroups.find((g) => g.id === groupId);
      const itm = grp?.items.find((i) => i.id === itemId);
      return itm ? { type, groupId, item: itm, title: itm.text, memo: itm.memo || '', dueDate: itm.dueDate, endDate: itm.endDate } : null;
    } else {
      const grp = textGroups.find((g) => g.id === groupId);
      const blk = grp?.blocks.find((b) => b.id === itemId);
      const firstLine = blk?.text.split('\n')[0] || grp?.name || '';
      return blk ? { type, groupId, item: blk, title: firstLine, memo: blk.memo || '', dueDate: blk.dueDate, endDate: blk.endDate } : null;
    }
  }, [selectedDetailItem, checklistGroups, textGroups]);

  // 로컬 텍스트 상태 (빠른 입력 반영용)
  const [localMemo, setLocalMemo] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // 대상 아이템 변경 시 로컬 메모 갱신
  useEffect(() => {
    if (targetItem) {
      setLocalMemo(targetItem.memo);
      setIsSaved(true);
    } else {
      setLocalMemo('');
    }
  }, [selectedDetailItem?.itemId]);

  // 변경 핸들러
  const handleMemoChange = (val: string) => {
    setLocalMemo(val);
    setIsSaved(false);

    if (!selectedDetailItem) return;
    const { type, groupId, itemId } = selectedDetailItem;

    if (type === 'checklist') {
      updateCheckItemMemo(groupId, itemId, val);
    } else {
      updateTextBlockMemo(groupId, itemId, val);
    }
    setIsSaved(true);
  };

  return {
    targetItem,
    localMemo,
    isSaved,
    handleMemoChange,
  };
};
