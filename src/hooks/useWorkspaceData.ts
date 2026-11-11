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
    if (id === 'top-1' || id === 'top-2' || id === 'top-3') return; // 1*1 퀵메모, 1*2 할일관리, 1*3 프로젝트는 이름 변경 불가 (하드코딩 고정)
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
      ...(groupId ? { groupId } : {}),
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
      isCompleted: false,
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

  const addChecklistGroup = (subItemId: string): string => {
    const groupId = `cg-${Date.now()}`;
    const newGroup: ChecklistGroupData = {
      id: groupId,
      subItemId,
      name: '',
      isExpanded: true,
      order: checklistGroups.length,
      items: [],
    };
    setChecklistGroups((prev) => [...prev, newGroup]);
    return groupId;
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
