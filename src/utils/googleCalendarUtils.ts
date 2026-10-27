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
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash << 5) - hash + categoryId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GOOGLE_COLORS.length;
  return GOOGLE_COLORS[index];
};

// 24시간 타임라인 (0시 ~ 23시)
export const TIMELINE_HOURS = Array.from({ length: 24 }, (_, i) => i);
export const TIMELINE_HOUR_HEIGHT = 48; // 구글 캘린더 1시간당 48px

export const formatGoogleHourLabel = (hour: number): string => {
  if (hour === 0) return '';
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return '오후 12시';
  return `오후 ${hour - 12}시`;
};
