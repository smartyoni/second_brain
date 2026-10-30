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

  // 로컬 텍스트 상태 및 수정 모드 상태
  const [localMemo, setLocalMemo] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 대상 아이템 변경 시 로컬 메모 갱신 및 수정 모드 종료
  useEffect(() => {
    if (targetItem) {
      setLocalMemo(targetItem.memo);
    } else {
      setLocalMemo('');
    }
    setIsEditing(false);
  }, [selectedDetailItem?.itemId]);

  // 수정 모드 진입
  const handleStartEdit = () => {
    if (!targetItem) return;
    setLocalMemo(targetItem.memo);
    setIsEditing(true);
  };

  // 입력값 변경 핸들러 (로컬 상태만 업데이트)
  const handleMemoChange = (val: string) => {
    setLocalMemo(val);
  };

  // 저장 핸들러 (저장 버튼 클릭 시 반영)
  const handleSave = () => {
    if (!selectedDetailItem) return;
    const { type, groupId, itemId } = selectedDetailItem;

    if (type === 'checklist') {
      updateCheckItemMemo(groupId, itemId, localMemo);
    } else {
      updateTextBlockMemo(groupId, itemId, localMemo);
    }
    setIsEditing(false);
  };

  // 취소 핸들러
  const handleCancel = () => {
    setLocalMemo(targetItem?.memo || '');
    setIsEditing(false);
  };

  return {
    targetItem,
    localMemo,
    isEditing,
    handleStartEdit,
    handleMemoChange,
    handleSave,
    handleCancel,
  };
};
