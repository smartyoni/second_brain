export interface SmartTextToken {
  type: 'text' | 'url' | 'phone';
  content: string;
  href?: string;
}

export function parseSmartText(text: string): SmartTextToken[] {
  if (!text) return [];

  // URL(http/https/www) 및 전화번호(휴대폰 01X, 일반전화 02/0XX, 070/050 등) 통합 정규식
  const pattern =
    /(https?:\/\/[^\s]+|www\.[^\s]+)|((?<![0-9-])(?:01[016789][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4}|01[016789][0-9]{7,8}|0(?:2|[3-6][1-5]|70|50[0-9]?)[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4})(?![0-9-]))/g;
  const tokens: SmartTextToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      // URL
      const rawUrl = match[1];
      const href = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      tokens.push({
        type: 'url',
        content: rawUrl,
        href,
      });
    } else if (match[2]) {
      // 전화번호 -> SMS 연결
      const cleanPhone = match[2].replace(/[^0-9]/g, '');
      tokens.push({
        type: 'phone',
        content: match[2],
        href: `sms:${cleanPhone}`,
      });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return tokens;
}
