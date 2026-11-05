import {
  TopCategory,
  CategoryGroup,
  CategoryItem,
  SubItem,
  TextGroupData,
  ChecklistGroupData,
  QuickMemo,
} from '../types';

// 초기 5x3 대분류 15개 (1*1은 '퀵메모', 1*2는 '할일관리', 1*3은 '프로젝트'로 고정)
export const initialTopCategories: TopCategory[] = [
  { id: 'top-1', name: '퀵메모', index: 0 },
  { id: 'top-2', name: '할일관리', index: 1 },
  { id: 'top-3', name: '프로젝트', index: 2 },
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

// 할일관리(top-2) 전용 하드코딩 기본 그룹
export const initialTodoGroups: CategoryGroup[] = [
  {
    id: 'grp-1793352952647',
    topCategoryId: 'top-2',
    name: 'TODO LIST',
    order: 0,
    isExpanded: true,
  },
  {
    id: 'grp-1793598347056',
    topCategoryId: 'top-2',
    name: 'PROJECT',
    order: 1,
    isExpanded: true,
  },
];

// 할일관리(top-2) 전용 하드코딩 기본 카테고리 (TODO LIST 하위 고정)
export const initialTodoCategories: CategoryItem[] = [
  {
    id: 'cat-1793318137485',
    topCategoryId: 'top-2',
    groupId: 'grp-1793352952647',
    name: '오늘',
    order: 0,
    itemCount: 0,
  },
  {
    id: 'cat-1793318170840',
    topCategoryId: 'top-2',
    groupId: 'grp-1793352952647',
    name: '예정된 일정',
    order: 1,
    itemCount: 0,
  },
  {
    id: 'cat-1793318181104',
    topCategoryId: 'top-2',
    groupId: 'grp-1793352952647',
    name: '대기중',
    order: 2,
    itemCount: 0,
  },
  {
    id: 'cat-1793318196496',
    topCategoryId: 'top-2',
    groupId: 'grp-1793352952647',
    name: '언젠가/어쩌면',
    order: 3,
    itemCount: 0,
  },
];

export const FIXED_TODO_GROUP_IDS = new Set(initialTodoGroups.map((g) => g.id));
export const FIXED_TODO_CATEGORY_IDS = new Set(initialTodoCategories.map((c) => c.id));

// 프로젝트(top-3) 전용 하드코딩 기본 그룹
export const initialProjectGroups: CategoryGroup[] = [
  {
    id: 'grp-project-active',
    topCategoryId: 'top-3',
    name: '진행중 프로젝트',
    order: 0,
    isExpanded: true,
  },
  {
    id: 'grp-project-done',
    topCategoryId: 'top-3',
    name: '완료된 프로젝트',
    order: 1,
    isExpanded: true,
  },
];

// 프로젝트(top-3) 전용 하드코딩 기본 카테고리
export const initialProjectCategories: CategoryItem[] = [
  {
    id: 'cat-project-1',
    topCategoryId: 'top-3',
    groupId: 'grp-project-active',
    name: '신규 프로젝트',
    order: 0,
    itemCount: 0,
  },
];

export const FIXED_PROJECT_GROUP_IDS = new Set(initialProjectGroups.map((g) => g.id));
export const FIXED_PROJECT_CATEGORY_IDS = new Set(initialProjectCategories.map((c) => c.id));

export const initialGroups: CategoryGroup[] = [...initialTodoGroups, ...initialProjectGroups];
export const initialCategories: CategoryItem[] = [...initialTodoCategories, ...initialProjectCategories];
export const initialSubItems: SubItem[] = [];
export const initialTextGroups: TextGroupData[] = [];
export const initialChecklistGroups: ChecklistGroupData[] = [];
export const initialQuickMemos: QuickMemo[] = [];
