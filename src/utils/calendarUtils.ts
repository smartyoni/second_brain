// 구글 캘린더 스타일 시간대 슬롯 (오전 7시 ~ 오후 11시)
export const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
export const HOUR_HEIGHT = 52; // 1시간당 픽셀 높이

/**
 * 오늘 날짜를 사용자의 로컬 시간대 기준 'YYYY-MM-DD' 형식으로 반환합니다.
 * (UTC 기준 toISOString()을 쓰면 한국 시간 오전 9시 이전/새벽에 전날로 판정되는 버그 원천 차단)
 */
export const getTodayDateStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Date 객체를 사용자의 로컬 시간대 기준 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
 */
export const formatLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 'YYYY-MM-DD' 문자열을 로컬 시간대 기준 Date 객체(00:00:00)로 파싱합니다.
 * (new Date('YYYY-MM-DD')는 브라우저 엔진에 따라 UTC 자정으로 해석되어 시간대 왜곡 발생 가능)
 */
export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
};

/**
 * 특정 'YYYY-MM-DD' 날짜를 로컬 일 단위로 이동합니다.
 */
export const shiftDateStr = (dateStr: string, days: number): string => {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDateStr(d);
};

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '오전 12시';
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return '오후 12시';
  return `오후 ${hour - 12}시`;
};

// "14:30" 같은 문자열을 분 단위로 변환 (기본값: null)
export const parseTimeToMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

// 카테고리 ID나 문자열 해시 기반 색상 태그 클래스 반환
const COLOR_PALETTES = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-500' },
];

export const getCategoryColor = (categoryId?: string) => {
  if (!categoryId) return COLOR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash << 5) - hash + categoryId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
};

/**
 * 일정이 주어진 날짜(targetDate)에 포함되는지 확인합니다.
 * - '진행중'이고 아직 '완료'되지 않은 경우: 항상 '오늘'의 종일 영역에만 표시 (오늘 이후/이전 날짜에는 미표시)
 * - endDate(마감일)가 있는 경우: dueDate <= targetDate <= endDate 범위 내에 있으면 true
 * - endDate가 없거나 dueDate와 같은 경우: dueDate === targetDate 이면 true
 */
export const isItemOnDate = (
  item: { dueDate?: string; endDate?: string; isInProgress?: boolean; isCompleted?: boolean },
  targetDate: string
): boolean => {
  if (!targetDate) return false;

  // 진행중 체크 시 완료되기 전까지 항상 '오늘'의 종일 영역에만 표시
  if (item.isInProgress && !item.isCompleted) {
    return targetDate === getTodayDateStr();
  }

  if (!item.dueDate) return false;

  if (!item.endDate || item.endDate <= item.dueDate) {
    return item.dueDate === targetDate;
  }
  return targetDate >= item.dueDate && targetDate <= item.endDate;
};

/**
 * startDate부터 endDate까지의 모든 'YYYY-MM-DD' 날짜 목록을 반환합니다.
 */
export const getDatesInRange = (startDate: string, endDate?: string): string[] => {
  if (!startDate) return [];
  if (!endDate || endDate <= startDate) return [startDate];

  const dates: string[] = [];
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  let count = 0;
  const curr = new Date(start);
  while (curr <= end && count < 366) {
    dates.push(formatLocalDateStr(curr));
    curr.setDate(curr.getDate() + 1);
    count++;
  }
  return dates;
};

/**
 * 시작일(dueDate)과 마감일(endDate)을 기반으로 일정뷰 기간 텍스트를 반환합니다.
 * 같은 달인 경우: "13~15"
 * 다른 달인 경우: "11.30~12.2"
 * 다른 연도인 경우: "25.12.30~26.1.2"
 * 마감일이 없거나 시작일 이하인 경우: null
 */
export const formatSchedulePeriod = (
  dueDate?: string,
  endDate?: string
): string | null => {
  if (!dueDate || !endDate || endDate <= dueDate) return null;
  const [sy, sm, sd] = dueDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  if (isNaN(sy) || isNaN(ey) || isNaN(sd) || isNaN(ed)) return null;

  if (sy === ey && sm === em) {
    return `${sd}~${ed}`;
  } else if (sy === ey) {
    return `${sm}.${sd}~${em}.${ed}`;
  } else {
    return `${String(sy).slice(2)}.${sm}.${sd}~${String(ey).slice(2)}.${em}.${ed}`;
  }
};


