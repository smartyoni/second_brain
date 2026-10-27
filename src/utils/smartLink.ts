export interface SmartTextToken {
  type: 'text' | 'url' | 'phone';
  content: string;
  href?: string;
}

export function parseSmartText(text: string): SmartTextToken[] {
  if (!text) return [];

  // URL 및 휴대폰 번호 통합 정규식
  const pattern = /(https?:\/\/[^\s]+)|(010[-.\s]?[0-9]{4}[-.\s]?[0-9]{4}|010[0-9]{8})/g;
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
      tokens.push({
        type: 'url',
        content: match[1],
        href: match[1],
      });
    } else if (match[2]) {
      // 휴대폰 번호
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
