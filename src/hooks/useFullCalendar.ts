import { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CalendarScheduleItem } from '../types';

export type FullCalendarViewType = 'month' | 'week' | 'threeDay' | 'day' | 'schedule';

export const useFullCalendar = () => {
  const {
    getAllScheduleItems,
    selectedCalendarDate,
    setSelectedCalendarDate,
    categoryItems,
    topCategories,
    toggleCheckItemCompleted,
    jumpToSourceItem,
    setAppMode,
    setMobileStep,
  } = useWorkspace();

  const [viewType, setViewType] = useState<FullCalendarViewType>('month');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<CalendarScheduleItem | null>(null);

  // 날짜 객체
  const currentDateObj = useMemo(() => {
    const d = new Date(selectedCalendarDate);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [selectedCalendarDate]);

  const currentYear = currentDateObj.getFullYear();
  const currentMonth = currentDateObj.getMonth(); // 0 ~ 11
  const currentDate = currentDateObj.getDate();

  // 모든 일정 수집
  const allItems = useMemo(() => {
    return getAllScheduleItems();
  }, [getAllScheduleItems]);

  // 필터링된 일정 목록
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. 카테고리 필터
      if (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes(item.categoryId)) {
        return false;
      }
      // 2. 완료 여부 필터
      if (!showCompleted && item.isCompleted) {
        return false;
      }
      // 3. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        if (!matchesTitle) return false;
      }
      return true;
    });
  }, [allItems, selectedCategoryIds, showCompleted, searchQuery]);

  // 카테고리 필터 토글
  const toggleCategoryFilter = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  // 날짜 이동
  const goToPrev = () => {
    const d = new Date(currentDateObj);
    if (viewType === 'month' || viewType === 'schedule') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewType === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewType === 'threeDay') {
      d.setDate(d.getDate() - 3);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedCalendarDate(d.toISOString().slice(0, 10));
  };

  const goToNext = () => {
    const d = new Date(currentDateObj);
    if (viewType === 'month' || viewType === 'schedule') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewType === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewType === 'threeDay') {
      d.setDate(d.getDate() + 3);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedCalendarDate(d.toISOString().slice(0, 10));
  };

  const goToToday = () => {
    setSelectedCalendarDate(new Date().toISOString().slice(0, 10));
  };

  const setDateByString = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
  };

  // 원본 문서로 이동 (모드를 워크스페이스로 변경 후 해당 항목 선택)
  const handleJumpToSource = (item: CalendarScheduleItem) => {
    jumpToSourceItem(item);
    setAppMode('workspace');
    setMobileStep('detail');
  };

  return {
    viewType,
    setViewType,
    currentDateObj,
    currentYear,
    currentMonth,
    currentDate,
    selectedCalendarDate,
    allItems,
    filteredItems,
    selectedCategoryIds,
    toggleCategoryFilter,
    selectAllCategories,
    showCompleted,
    setShowCompleted,
    searchQuery,
    setSearchQuery,
    selectedScheduleItem,
    setSelectedScheduleItem,
    goToPrev,
    goToNext,
    goToToday,
    setDateByString,
    toggleCheckItemCompleted,
    handleJumpToSource,
    categoryItems,
    topCategories,
    setAppMode,
  };
};
