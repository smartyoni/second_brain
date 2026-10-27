import { useState } from 'react';
import {
  QuickMemo,
  CategoryItem,
  SubItem,
  TextGroupData,
  PanelDetailState,
} from '../types';
import { initialQuickMemos } from '../context/initialData';

export const useQuickMemoData = (
  categoryItems: CategoryItem[],
  setCategoryItems: React.Dispatch<React.SetStateAction<CategoryItem[]>>,
  setSubItems: React.Dispatch<React.SetStateAction<SubItem[]>>,
  setTextGroups: React.Dispatch<React.SetStateAction<TextGroupData[]>>,
  updateActivePanelState: (updater: (prev: PanelDetailState) => PanelDetailState) => void
) => {
  const [quickMemos, setQuickMemos] = useState<QuickMemo[]>(initialQuickMemos);

  const addQuickMemo = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const now = new Date();
    const yearMonth = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월`;
    const ymId = `cat-qm-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    let targetCatId = ymId;
    const existingCat = categoryItems.find(
      (c) => c.topCategoryId === 'top-1' && c.name === yearMonth
    );
    if (!existingCat) {
      setCategoryItems((prev) => [
        { id: ymId, topCategoryId: 'top-1', name: yearMonth, itemCount: 1, order: 0 },
        ...prev,
      ]);
    } else {
      targetCatId = existingCat.id;
      setCategoryItems((prev) =>
        prev.map((c) => (c.id === existingCat.id ? { ...c, itemCount: c.itemCount + 1 } : c))
      );
    }

    const firstLine = trimmed.split('\n')[0].trim();
    const title = firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
    const newSubId = `sub-qm-${Date.now()}`;
    setSubItems((prev) => [
      { id: newSubId, categoryId: targetCatId, title: title || '새 퀵메모', order: 0 },
      ...prev,
    ]);

    setTextGroups((prev) => [
      {
        id: `tg-qm-${Date.now()}`,
        subItemId: newSubId,
        name: '퀵메모 원본',
        isExpanded: true,
        order: 0,
        blocks: [{ id: `tb-${Date.now()}`, text: trimmed, order: 0 }],
      },
      ...prev,
    ]);

    setQuickMemos((prev) => [
      {
        id: `qm-${Date.now()}`,
        content: trimmed,
        createdAt: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);

    // 방금 작성한 메모로 즉시 선택 활성화
    updateActivePanelState((prev) => ({
      ...prev,
      topCategoryId: 'top-1',
      categoryId: targetCatId,
      subItemId: newSubId,
      activeTab: 'text',
    }));
  };

  const deleteQuickMemo = (id: string) => {
    setQuickMemos((prev) => prev.filter((m) => m.id !== id));
  };

  return {
    quickMemos,
    setQuickMemos,
    addQuickMemo,
    deleteQuickMemo,
  };
};
