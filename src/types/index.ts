// 1번 패널: 5x3 그리드 최상위 대분류
export interface TopCategory {
  id: string;
  name: string;
  index: number; // 0 ~ 14
}

// 1번 패널: 중분류 카테고리
export interface CategoryItem {
  id: string;
  topCategoryId: string;
  groupId?: string; // 소속 그룹이 없으면 '미분류 카테고리'
  name: string;
  itemCount: number;
  order: number;
}

// 1번 및 2번 패널: 그룹 헤더 (파란색 바)
export interface CategoryGroup {
  id: string;
  topCategoryId: string;
  name: string;
  isExpanded: boolean;
  order: number;
}

// 2번 패널: 하위 항목 (문서/주제)
export interface SubItem {
  id: string;
  categoryId: string;
  groupId?: string;
  title: string;
  order: number;
}

// 3번 패널: 텍스트 블록
export interface TextBlock {
  id: string;
  text: string;
  order: number;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD (마감일)
  memo?: string; // 4번 패널 하단 전속 추가 메모
}

// 3번 패널: 텍스트 그룹
export interface TextGroupData {
  id: string;
  subItemId: string;
  name: string;
  isExpanded: boolean;
  order: number;
  blocks: TextBlock[];
}

// 3번 패널: 체크리스트 항목
export interface CheckItem {
  id: string;
  text: string;
  isCompleted: boolean;
  order: number;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD (마감일)
  memo?: string; // 4번 패널 하단 전속 추가 메모
}

// 캘린더 자체 독립 일정 모델
export interface CalendarEvent {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD (마감일)
  memo?: string; // 4번 패널 하단 전속 추가 메모
  endTime?: string;
  isCompleted?: boolean;
  categoryId?: string; // 소속 카테고리 (색상/분류)
  description?: string;
  eventType?: 'event' | 'task';
}

// 4번 패널 및 통합 캘린더에서 집계하는 전체 일정 모델
export interface CalendarScheduleItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  endDate?: string; // YYYY-MM-DD (마감일)
  memo?: string;
  endTime?: string;
  isCompleted?: boolean;
  sourceType: 'checklist' | 'text' | 'calendar';
  subItemId: string;
  groupId: string;
  categoryId: string;
  topCategoryId: string;
  description?: string;
}

// 4번 패널 하단 메모 연동용 선택 아이템 정보
export interface SelectedDetailItemInfo {
  type: 'checklist' | 'text';
  groupId: string;
  itemId: string;
}

// 3번 패널: 체크리스트 그룹
export interface ChecklistGroupData {
  id: string;
  subItemId: string;
  name: string;
  isExpanded: boolean;
  order: number;
  items: CheckItem[];
}

// 4패널 상태 모델
export type ActivePanel = 'panel-3' | 'panel-4';
export type DetailTab = 'text' | 'check';
export type MobileStep = 'category' | 'subitem' | 'detail';
export type AppMode = 'workspace' | 'calendar';

export interface PanelDetailState {
  topCategoryId: string | null;
  categoryId: string | null;
  subItemId: string | null;
  activeTab: DetailTab;
}

// 퀵메모 데이터 모델
export interface QuickMemo {
  id: string;
  content: string;
  createdAt: string; // ISO 문자열 또는 표시용 날짜
}

export type QuickMemoSegment = 'memo' | 'move';

export type CalendarViewMode = 'day' | 'threeDay' | 'month';

export interface WorkspaceContextType {
  // 앱 전체 모드 (4패널 작업공간 vs 통합 캘린더)
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // 모바일 전용 네비게이션
  mobileStep: MobileStep;
  setMobileStep: (step: MobileStep) => void;

  // 패널 활성 상태
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;

  // 패널별 상태
  panel3State: PanelDetailState;
  panel4State: PanelDetailState;
  getCurrentActiveState: () => PanelDetailState;
  setPanelDetailTab: (panel: ActivePanel, tab: DetailTab) => void;

  // 선택 핸들러 (현재 활성 패널에 반영)
  selectTopCategory: (topId: string) => void;
  selectCategory: (catId: string) => void;
  selectSubItem: (subId: string) => void;

  // 데이터
  topCategories: TopCategory[];
  setTopCategories: React.Dispatch<React.SetStateAction<TopCategory[]>>;
  categoryGroups: CategoryGroup[];
  setCategoryGroups: React.Dispatch<React.SetStateAction<CategoryGroup[]>>;
  categoryItems: CategoryItem[];
  setCategoryItems: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  subItems: SubItem[];
  setSubItems: React.Dispatch<React.SetStateAction<SubItem[]>>;
  textGroups: TextGroupData[];
  setTextGroups: React.Dispatch<React.SetStateAction<TextGroupData[]>>;
  checklistGroups: ChecklistGroupData[];
  setChecklistGroups: React.Dispatch<React.SetStateAction<ChecklistGroupData[]>>;
  quickMemos: QuickMemo[];
  setQuickMemos: React.Dispatch<React.SetStateAction<QuickMemo[]>>;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;

  // 캘린더 및 일정 상태
  selectedDetailItem: SelectedDetailItemInfo | null;
  setSelectedDetailItem: (item: SelectedDetailItemInfo | null) => void;
  jumpedFromCalendar: boolean;
  setJumpedFromCalendar: (val: boolean) => void;
  returnToCalendar: () => void;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  updateCheckItemDueDate: (groupId: string, itemId: string, dueDate?: string, dueTime?: string, endDate?: string) => void;
  updateTextBlockDueDate: (groupId: string, blockId: string, dueDate?: string, dueTime?: string, endDate?: string) => void;
  updateCheckItemMemo: (groupId: string, itemId: string, memo: string) => void;
  updateTextBlockMemo: (groupId: string, blockId: string, memo: string) => void;
  toggleCheckItemCompleted: (groupId: string, itemId: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEventCompleted: (id: string) => void;
  getAllScheduleItems: () => CalendarScheduleItem[];
  jumpToSourceItem: (item: CalendarScheduleItem) => void;

  // 액션
  addQuickMemo: (content: string) => void;
  deleteQuickMemo: (id: string) => void;
  updateTopCategoryName: (id: string, name: string) => void;
  toggleGroupExpanded: (groupId: string) => void;
  addCategoryItem: (topCategoryId: string, groupId?: string) => void;
  addSubItem: (categoryId: string) => void;
  addTextGroup: (subItemId: string) => void;
  addChecklistGroup: (subItemId: string) => void;
}
