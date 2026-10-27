import {
  TopCategory,
  CategoryGroup,
  CategoryItem,
  SubItem,
  TextGroupData,
  ChecklistGroupData,
  QuickMemo,
} from '../types';

// 초기 5x3 대분류 15개 (1*1은 '퀵메모'로 고정)
export const initialTopCategories: TopCategory[] = [
  { id: 'top-1', name: '퀵메모', index: 0 },
  { id: 'top-2', name: '할일관리', index: 1 },
  { id: 'top-3', name: '앱개발', index: 2 },
  { id: 'top-4', name: '블로그', index: 3 },
  { id: 'top-5', name: '공부', index: 4 },
  { id: 'top-6', name: '계약', index: 5 },
  { id: 'top-7', name: '광고', index: 6 },
  { id: 'top-8', name: '매물원', index: 7 },
  { id: 'top-9', name: '고객', index: 8 },
  { id: 'top-10', name: '용지', index: 9 },
  { id: 'top-11', name: '아파트', index: 10 },
  { id: 'top-12', name: '사무실', index: 11 },
  { id: 'top-13', name: '즐겨찾기', index: 12 },
  { id: 'top-14', name: '웹롤링', index: 13 },
  { id: 'top-15', name: '북마크', index: 14 },
];

export const initialGroups: CategoryGroup[] = [];
export const initialCategories: CategoryItem[] = [];
export const initialSubItems: SubItem[] = [];
export const initialTextGroups: TextGroupData[] = [];
export const initialChecklistGroups: ChecklistGroupData[] = [];
export const initialQuickMemos: QuickMemo[] = [];
