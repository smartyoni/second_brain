import { ChecklistGroupData, SelectedDetailItemInfo, TextGroupData } from '../types';

export interface DetailItemSummary {
  targetTitle: string;
  checkCount: number;
  textCount: number;
}

/**
 * 3번 패널에서 선택된 상세 항목의 제목, 하위 체크리스트 개수, 세부 메모 존재 여부를 계산합니다.
 */
export const getDetailItemSummary = (
  selectedDetailItem: SelectedDetailItemInfo | null,
  checklistGroups: ChecklistGroupData[],
  textGroups: TextGroupData[]
): DetailItemSummary => {
  if (!selectedDetailItem) {
    return { targetTitle: '', checkCount: 0, textCount: 0 };
  }

  const { type, groupId, itemId } = selectedDetailItem;
  let title = '';
  let checklistLen = 0;
  let memoText = '';

  if (type === 'checklist') {
    const grp = checklistGroups.find((g) => g.id === groupId);
    const itm = grp?.items.find((i) => i.id === itemId);
    title = itm?.text || '';
    checklistLen = itm?.checklist?.length || 0;
    memoText = itm?.memo || '';
  } else {
    const grp = textGroups.find((g) => g.id === groupId);
    const blk = grp?.blocks.find((b) => b.id === itemId);
    title = blk?.text.split('\n')[0] || grp?.name || '';
    checklistLen = blk?.checklist?.length || 0;
    memoText = blk?.memo || '';
  }

  return {
    targetTitle: title,
    checkCount: checklistLen,
    textCount: memoText.trim().length > 0 ? 1 : 0,
  };
};
