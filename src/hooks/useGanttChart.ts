import { useState, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CalendarScheduleItem } from '../types';

export interface GanttBarData {
  item: CalendarScheduleItem;
  startDateStr: string;
  endDateStr: string;
  startColIndex: number; // 0-based
  spanCols: number; // 몇 일 동안 지속되는지
  isMilestone: boolean; // 단일일 일정 여부
}

export const useGanttChart = () => {
  const {
    panel3State,
    subItems,
    getAllScheduleItems,
    selectedDetailItem,
    setSelectedDetailItem,
    jumpToSourceItem,
  } = useWorkspace();

  // 현재 활성화된 중분류 ID
  const currentSubItemId = panel3State.subItemId;
  const currentSubItem = useMemo(
    () => subItems.find((s) => s.id === currentSubItemId),
    [subItems, currentSubItemId]
  );

  // 기준 시작 날짜 (기본: 오늘로부터 3일 전 ~ 25일 후 = 총 28일 범위)
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 3);
    return d;
  });

  const totalDays = 28; // 보여줄 일수 (약 4주)

  // 일자 목록 생성
  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [baseDate, totalDays]);

  const startDateStr = days[0]?.toISOString().slice(0, 10) || '';
  const endDateStr = days[days.length - 1]?.toISOString().slice(0, 10) || '';

  // 해당 중분류에 속한 일정들 필터링
  const subItemSchedules = useMemo(() => {
    if (!currentSubItemId) return [];
    const all = getAllScheduleItems();
    return all.filter((s) => s.subItemId === currentSubItemId && s.dueDate);
  }, [getAllScheduleItems, currentSubItemId]);

  // 간트 바 데이터 계산
  const ganttBars = useMemo<GanttBarData[]>(() => {
    if (days.length === 0) return [];
    const firstDayTime = days[0].getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return subItemSchedules.map((item) => {
      const itemStart = item.dueDate;
      const itemEnd = item.endDate && item.endDate >= item.dueDate ? item.endDate : item.dueDate;
      const isMilestone = !item.endDate || item.endDate === item.dueDate;

      const startDateObj = new Date(`${itemStart}T00:00:00`);
      const endDateObj = new Date(`${itemEnd}T00:00:00`);

      // 시작 컬럼 인덱스 계산
      const diffStart = Math.floor((startDateObj.getTime() - firstDayTime) / oneDayMs);
      const diffEnd = Math.floor((endDateObj.getTime() - firstDayTime) / oneDayMs);

      const spanCols = Math.max(1, diffEnd - diffStart + 1);

      return {
        item,
        startDateStr: itemStart,
        endDateStr: itemEnd,
        startColIndex: diffStart,
        spanCols,
        isMilestone,
      };
    });
  }, [subItemSchedules, days]);

  // 날짜 이동 함수들
  const shiftDays = (offset: number) => {
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  };

  const goToToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 3);
    setBaseDate(d);
  };

  const handleSelectItem = (item: CalendarScheduleItem) => {
    setSelectedDetailItem({
      type: item.sourceType === 'checklist' ? 'checklist' : 'text',
      groupId: item.groupId,
      itemId: item.id,
    });
    jumpToSourceItem(item);
  };

  return {
    currentSubItem,
    days,
    startDateStr,
    endDateStr,
    ganttBars,
    totalDays,
    shiftDays,
    goToToday,
    handleSelectItem,
    selectedDetailItemId: selectedDetailItem?.itemId,
  };
};
