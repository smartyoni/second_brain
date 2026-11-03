import React, { useMemo } from 'react';

interface TimePicker24hProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  stepMinutes?: number;
  disabled?: boolean;
}

export const TimePicker24h: React.FC<TimePicker24hProps> = ({
  value,
  onChange,
  className = '',
  stepMinutes = 30,
  disabled = false,
}) => {
  // 00:00 ~ 23:59 24시간제 옵션 목록 생성
  const options = useMemo(() => {
    const list: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        list.push(`${hh}:${mm}`);
      }
    }
    // 현재 value가 목록에 없으면 정렬된 위치에 삽입
    if (value && !list.includes(value)) {
      list.push(value);
      list.sort();
    }
    return list;
  }, [value, stepMinutes]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`cursor-pointer ${className}`}
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
};
