import { CalendarScheduleItem } from '../types';
import { parseTimeToMinutes } from './calendarUtils';

// 구글 캘린더 공식 머티리얼 컬러 팔레트
export interface GoogleColorTheme {
  id: string;
  name: string;
  bg: string;          // 칩 배경 (종일)
  text: string;        // 칩 텍스트
  dot: string;         // 점 색상 (시간제)
  lightBg: string;     // 시간제 호버 배경
  border: string;      // 테두리
  rawHex: string;
}

export const GOOGLE_COLORS: GoogleColorTheme[] = [
  { id: 'peacock', name: '공작새', bg: 'bg-[#039be5]', text: 'text-white', dot: 'bg-[#039be5]', lightBg: 'bg-[#e1f5fe]', border: 'border-[#039be5]', rawHex: '#039be5' },
  { id: 'blueberry', name: '블루베리', bg: 'bg-[#3f51b5]', text: 'text-white', dot: 'bg-[#3f51b5]', lightBg: 'bg-[#e8eaf6]', border: 'border-[#3f51b5]', rawHex: '#3f51b5' },
  { id: 'sage', name: '세이지', bg: 'bg-[#33b679]', text: 'text-white', dot: 'bg-[#33b679]', lightBg: 'bg-[#e8f5e9]', border: 'border-[#33b679]', rawHex: '#33b679' },
  { id: 'basil', name: '바질', bg: 'bg-[#0b8043]', text: 'text-white', dot: 'bg-[#0b8043]', lightBg: 'bg-[#e6f4ea]', border: 'border-[#0b8043]', rawHex: '#0b8043' },
  { id: 'flamingo', name: '플라밍고', bg: 'bg-[#e67c73]', text: 'text-white', dot: 'bg-[#e67c73]', lightBg: 'bg-[#fce8e6]', border: 'border-[#e67c73]', rawHex: '#e67c73' },
  { id: 'tomato', name: '토마토', bg: 'bg-[#d50000]', text: 'text-white', dot: 'bg-[#d50000]', lightBg: 'bg-[#ffebee]', border: 'border-[#d50000]', rawHex: '#d50000' },
  { id: 'tangerine', name: '탠저린', bg: 'bg-[#f4511e]', text: 'text-white', dot: 'bg-[#f4511e]', lightBg: 'bg-[#fbe9e7]', border: 'border-[#f4511e]', rawHex: '#f4511e' },
  { id: 'banana', name: '바나나', bg: 'bg-[#f6bf26]', text: 'text-slate-900', dot: 'bg-[#f6bf26]', lightBg: 'bg-[#fef7e0]', border: 'border-[#f6bf26]', rawHex: '#f6bf26' },
  { id: 'grape', name: '포도', bg: 'bg-[#8e24aa]', text: 'text-white', dot: 'bg-[#8e24aa]', lightBg: 'bg-[#f3e5f5]', border: 'border-[#8e24aa]', rawHex: '#8e24aa' },
  { id: 'amethyst', name: '자수정', bg: 'bg-[#7986cb]', text: 'text-white', dot: 'bg-[#7986cb]', lightBg: 'bg-[#ede7f6]', border: 'border-[#7986cb]', rawHex: '#7986cb' },
  { id: 'graphite', name: '흑연', bg: 'bg-[#616161]', text: 'text-white', dot: 'bg-[#616161]', lightBg: 'bg-[#f5f5f5]', border: 'border-[#616161]', rawHex: '#616161' },
];

export const getGoogleCategoryColor = (categoryId?: string): GoogleColorTheme => {
  if (!categoryId) return GOOGLE_COLORS[0];
  const directMatch = GOOGLE_COLORS.find((c) => c.id === categoryId);
  if (directMatch) return directMatch;

  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash << 5) - hash + categoryId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GOOGLE_COLORS.length;
  return GOOGLE_COLORS[index];
};

// 24시간 타임라인 (0시 ~ 23시)
// 시간 체계: 당일 07:00 시작 ~ 다음날 06:59 종료 (24시간제)
export const TIMELINE_START_HOUR = 7;
export const TIMELINE_HOURS = Array.from({ length: 24 }, (_, i) => (TIMELINE_START_HOUR + i) % 24);

// 날짜 문자열(YYYY-MM-DD)을 일 단위로 이동
export const shiftDateStr = (dateStr: string, days: number): string => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

// 분(0~1439)을 타임라인 시작(07:00) 기준 오프셋 분으로 변환
export const toTimelineOffsetMinutes = (minutes: number): number =>
  (minutes - TIMELINE_START_HOUR * 60 + 1440) % 1440;

// 일정이 표시될 타임라인 컬럼 날짜 (07:00 이전 시각은 전날 컬럼에 표시)
export const getTimelineColumnDate = (dueDate: string, dueTime?: string): string => {
  const m = parseTimeToMinutes(dueTime);
  return m !== null && m !== undefined && m < TIMELINE_START_HOUR * 60 ? shiftDateStr(dueDate, -1) : dueDate;
};

// 컬럼 날짜 + 슬롯 시각 → 실제 날짜 (07시 이전 슬롯은 다음날)
export const getSlotRealDate = (columnDate: string, hour: number): string =>
  hour < TIMELINE_START_HOUR ? shiftDateStr(columnDate, 1) : columnDate;

// 현재 시각의 타임라인 컬럼 날짜와 세로 위치
export const getNowTimelinePosition = (hourHeight: number = 48) => {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return {
    dateStr: mins < TIMELINE_START_HOUR * 60 ? shiftDateStr(local, -1) : local,
    top: (toTimelineOffsetMinutes(mins) / 60) * hourHeight,
  };
};
export const TIMELINE_HOUR_HEIGHT = 48; // 구글 캘린더 1시간당 48px

export const formatGoogleHourLabel = (hour: number): string => {
  return `${String(hour).padStart(2, '0')}:00`;
};

// 타임라인 오버랩(시간 겹침) 구글 캘린더 스타일 분할 레이아웃 계산
export interface TimedEventLayout {
  item: CalendarScheduleItem;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
}

export function computeOverlappingLayout(
  items: CalendarScheduleItem[],
  hourHeight: number = TIMELINE_HOUR_HEIGHT,
  defaultDurationMinutes: number = 60
): TimedEventLayout[] {
  if (items.length === 0) return [];

  // 1. 분 단위 시작/종료 계산
  const parsed = items.map((item) => {
    const rawStart = parseTimeToMinutes(item.dueTime) ?? 9 * 60;
    const rawEnd = item.endTime
      ? parseTimeToMinutes(item.endTime) ?? (rawStart + defaultDurationMinutes)
      : rawStart + defaultDurationMinutes;
    // 최소 지속시간 30분 (자정을 넘기는 종료 시각은 +24시간 보정)
    let span = rawEnd - rawStart;
    if (item.endTime && span < 0) span += 1440;
    // 타임라인(07:00 시작) 기준 오프셋 분으로 변환 (컬럼 하단을 넘지 않도록 제한)
    const start = toTimelineOffsetMinutes(rawStart);
    const duration = Math.max(30, Math.min(span, 1440 - start));
    return {
      item,
      start,
      end: start + duration,
      duration,
    };
  });

  // 2. 시작 시간순 정렬 (같으면 긴 지속시간 우선)
  parsed.sort((a, b) => a.start - b.start || b.end - a.end);

  const result: TimedEventLayout[] = [];
  let cluster: typeof parsed = [];
  let clusterEnd = -1;

  const processCluster = (eventsInCluster: typeof parsed) => {
    if (eventsInCluster.length === 0) return;

    // 각 이벤트에 최적 컬럼 할당 (Greedy Column Allocation)
    const columns: number[] = [];
    const eventAssignments: { event: (typeof parsed)[0]; colIndex: number }[] = [];

    eventsInCluster.forEach((ev) => {
      let placedCol = -1;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= ev.start) {
          placedCol = c;
          columns[c] = ev.end;
          break;
        }
      }
      if (placedCol === -1) {
        placedCol = columns.length;
        columns.push(ev.end);
      }
      eventAssignments.push({ event: ev, colIndex: placedCol });
    });

    const totalCols = columns.length;
    const widthPercent = 100 / totalCols;

    eventAssignments.forEach(({ event, colIndex }) => {
      const top = (event.start / 60) * hourHeight;
      const height = Math.max(28, (event.duration / 60) * hourHeight);
      result.push({
        item: event.item,
        top,
        height,
        leftPercent: colIndex * widthPercent,
        widthPercent,
      });
    });
  };

  parsed.forEach((ev) => {
    if (cluster.length > 0 && ev.start >= clusterEnd) {
      processCluster(cluster);
      cluster = [];
      clusterEnd = -1;
    }
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.end);
  });

  if (cluster.length > 0) {
    processCluster(cluster);
  }

  return result;
}

export function getGoogleCalendarHeaderTitle(
  viewType: string,
  currentDateObj: Date,
  selectedCalendarDate: string,
  filteredItems: CalendarScheduleItem[]
): string {
  const currentYear = currentDateObj.getFullYear();
  const currentMonth = currentDateObj.getMonth();

  if (viewType === 'month') {
    return `${currentYear}년 ${currentMonth + 1}월`;
  }
  if (viewType === 'week') {
    const dayOfWeek = currentDateObj.getDay();
    const sunday = new Date(currentDateObj);
    sunday.setDate(sunday.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6);
    return `${sunday.getMonth() + 1}월 ${sunday.getDate()}일 ~ ${saturday.getMonth() + 1}월 ${saturday.getDate()}일`;
  }
  if (viewType === 'threeDay') {
    const endObj = new Date(currentDateObj);
    endObj.setDate(endObj.getDate() + 2);
    return `${currentDateObj.getMonth() + 1}월 ${currentDateObj.getDate()}일 ~ ${endObj.getMonth() + 1}월 ${endObj.getDate()}일`;
  }
  if (viewType === 'schedule') {
    const dates = filteredItems.map((i) => i.dueDate).filter(Boolean).sort();
    if (dates.length > 0) {
      const minDate = new Date(dates[0]);
      const maxDate = new Date(dates[dates.length - 1]);
      if (!isNaN(minDate.getTime()) && !isNaN(maxDate.getTime())) {
        const minStr = `${minDate.getFullYear()}년 ${minDate.getMonth() + 1}월`;
        const maxStr = `${maxDate.getFullYear()}년 ${maxDate.getMonth() + 1}월`;
        return minStr === maxStr ? minStr : `${minStr} ~ ${maxStr}`;
      }
    }
    return `${currentYear}년 ${currentMonth + 1}월`;
  }

  return !isNaN(currentDateObj.getTime())
    ? currentDateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : selectedCalendarDate;
}

export function shiftDateBySideView(
  selectedDate: string,
  sideViewType: string,
  direction: 'prev' | 'next'
): string {
  const d = new Date(selectedDate);
  const base = isNaN(d.getTime()) ? new Date() : d;
  const delta = direction === 'prev' ? -1 : 1;

  if (sideViewType === 'week') {
    base.setDate(base.getDate() + delta * 7);
  } else if (sideViewType === 'threeDay') {
    base.setDate(base.getDate() + delta * 3);
  } else {
    base.setDate(base.getDate() + delta * 1);
  }
  return base.toISOString().slice(0, 10);
}

export function getSidePanelDateLabel(
  sideViewType: string,
  currentDateObj: Date,
  selectedDate: string
): string {
  const isValid = !isNaN(currentDateObj.getTime());
  if (!isValid) return selectedDate;

  if (sideViewType === 'week') {
    const dayOfWeek = currentDateObj.getDay();
    const sunday = new Date(currentDateObj);
    sunday.setDate(sunday.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6);
    return `${sunday.getMonth() + 1}월 ${sunday.getDate()}일 ~ ${saturday.getMonth() + 1}월 ${saturday.getDate()}일`;
  }

  if (sideViewType === 'threeDay') {
    const endObj = new Date(currentDateObj);
    endObj.setDate(endObj.getDate() + 2);
    return `${currentDateObj.getMonth() + 1}월 ${currentDateObj.getDate()}일 ~ ${endObj.getMonth() + 1}월 ${endObj.getDate()}일`;
  }

  return currentDateObj.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}
