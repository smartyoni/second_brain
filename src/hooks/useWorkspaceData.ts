import { useState } from 'react';
import {
  TopCategory,
  CategoryGroup,
  CategoryItem,
  SubItem,
  TextGroupData,
  ChecklistGroupData,
} from '../types';
import {
  initialTopCategories,
  initialGroups,
  initialCategories,
  initialSubItems,
  initialTextGroups,
  initialChecklistGroups,
} from '../context/initialData';

export const useWorkspaceData = (
  selectCategory: (catId: string) => void,
  selectSubItem: (subId: string) => void
) => {
  const [topCategories, setTopCategories] = useState<TopCategory[]>(initialTopCategories);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>(initialGroups);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(initialCategories);
  const [subItems, setSubItems] = useState<SubItem[]>(initialSubItems);
  const [textGroups, setTextGroups] = useState<TextGroupData[]>(initialTextGroups);
  const [checklistGroups, setChecklistGroups] = useState<ChecklistGroupData[]>(initialChecklistGroups);

  const updateTopCategoryName = (id: string, name: string) => {
    if (id === 'top-1') return; // 1*1 퀵메모는 이름 변경 불가
    setTopCategories((prev) => prev.map((item) => (item.id === id ? { ...item, name } : item)));
  };

  const toggleGroupExpanded = (groupId: string) => {
    setCategoryGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g))
    );
  };

  const addCategoryItem = (topCategoryId: string, groupId?: string) => {
    const newItem: CategoryItem = {
      id: `cat-${Date.now()}`,
      topCategoryId,
      groupId,
      name: '새 카테고리',
      itemCount: 0,
      order: categoryItems.length,
    };
    setCategoryItems((prev) => [...prev, newItem]);
    selectCategory(newItem.id);
  };

  const addSubItem = (categoryId: string) => {
    const newSub: SubItem = {
      id: `sub-${Date.now()}`,
      categoryId,
      title: '새 항목',
      order: subItems.length,
    };
    setSubItems((prev) => [...prev, newSub]);
    selectSubItem(newSub.id);
  };

  const addTextGroup = (subItemId: string) => {
    const newGroup: TextGroupData = {
      id: `tg-${Date.now()}`,
      subItemId,
      name: '새 텍스트그룹',
      isExpanded: true,
      order: textGroups.length,
      blocks: [{ id: `b-${Date.now()}`, text: '', order: 0 }],
    };
    setTextGroups((prev) => [...prev, newGroup]);
  };

  const addChecklistGroup = (subItemId: string) => {
    const newGroup: ChecklistGroupData = {
      id: `cg-${Date.now()}`,
      subItemId,
      name: '새 체크그룹',
      isExpanded: true,
      order: checklistGroups.length,
      items: [{ id: `ci-${Date.now()}`, text: '새 할 일', isCompleted: false, order: 0 }],
    };
    setChecklistGroups((prev) => [...prev, newGroup]);
  };

  return {
    topCategories,
    setTopCategories,
    categoryGroups,
    setCategoryGroups,
    categoryItems,
    setCategoryItems,
    subItems,
    setSubItems,
    textGroups,
    setTextGroups,
    checklistGroups,
    setChecklistGroups,
    updateTopCategoryName,
    toggleGroupExpanded,
    addCategoryItem,
    addSubItem,
    addTextGroup,
    addChecklistGroup,
  };
};
