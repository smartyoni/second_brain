// 음력 변환 유틸리티 (Intl.DateTimeFormat ko-KR-u-ca-chinese 기반)

export interface LunarDateInfo {
  month: string;
  day: string;
  text: string; // 예: "1.1", "윤6.1"
  display: string; // 예: "(음 1.1)", "(음 윤6.1)"
  fullText: string; // 예: "음력 1월 1일", "음력 윤6월 1일"
}

const lunarCache = new Map<string, LunarDateInfo | null>();

let lunarFormatter: Intl.DateTimeFormat | null = null;

function getFormatter(): Intl.DateTimeFormat | null {
  if (lunarFormatter) return lunarFormatter;
  try {
    lunarFormatter = new Intl.DateTimeFormat('ko-KR-u-ca-chinese', {
      month: 'numeric',
      day: 'numeric',
    });
    return lunarFormatter;
  } catch (err) {
    console.warn('Lunar calendar format not supported in this environment:', err);
    return null;
  }
}

/**
 * YYYY-MM-DD 형식의 양력 날짜 문자열을 전달받아 음력 날짜 정보를 반환합니다.
 */
export function getLunarDate(dateStr: string): LunarDateInfo | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  if (lunarCache.has(dateStr)) {
    return lunarCache.get(dateStr) || null;
  }

  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);

    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

    const formatter = getFormatter();
    if (!formatter) return null;

    // 타임존 오차 방지를 위해 정오(12:00) 기준으로 Date 객체 생성
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    const formattedParts = formatter.formatToParts(dateObj);

    const monthPart = formattedParts.find((p) => p.type === 'month')?.value?.trim() || '';
    const dayPart = formattedParts.find((p) => p.type === 'day')?.value?.trim() || '';

    if (!monthPart || !dayPart) {
      lunarCache.set(dateStr, null);
      return null;
    }

    const info: LunarDateInfo = {
      month: monthPart,
      day: dayPart,
      text: `${monthPart}.${dayPart}`,
      display: `(음 ${monthPart}.${dayPart})`,
      fullText: `음력 ${monthPart}월 ${dayPart}일`,
    };

    lunarCache.set(dateStr, info);
    return info;
  } catch {
    lunarCache.set(dateStr, null);
    return null;
  }
}
