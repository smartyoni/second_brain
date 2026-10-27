import React from 'react';
import { parseSmartText } from '../../utils/smartLink';

interface SmartTextProps {
  text: string;
  className?: string;
}

export const SmartText: React.FC<SmartTextProps> = ({ text, className = '' }) => {
  const tokens = parseSmartText(text);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.type === 'url') {
          return (
            <a
              key={idx}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:underline inline-block break-all"
            >
              {token.content}
            </a>
          );
        }
        if (token.type === 'phone') {
          return (
            <a
              key={idx}
              href={token.href}
              onClick={(e) => e.stopPropagation()}
              className="text-emerald-600 hover:underline font-mono inline-block"
            >
              {token.content}
            </a>
          );
        }
        return <React.Fragment key={idx}>{token.content}</React.Fragment>;
      })}
    </span>
  );
};
