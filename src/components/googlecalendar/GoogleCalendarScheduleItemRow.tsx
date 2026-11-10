import React from 'react';
import { CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { Check } from 'lucide-react';
import { SmartText } from '../shared/SmartText';

interface GoogleCalendarScheduleItemRowProps {
  item: CalendarScheduleItem;
  onSelectItem: (item: CalendarScheduleItem) => void;
  formatTimeRange: (item: CalendarScheduleItem) => string;
  onContextMenu?: (item: CalendarScheduleItem, e: React.MouseEvent) => void;
}

export const GoogleCalendarScheduleItemRow: React.FC<GoogleCalendarScheduleItemRowProps> = ({
  item,
  onSelectItem,
  formatTimeRange,
  onContextMenu,
}) => {
  const colorTheme = getGoogleCategoryColor(item.categoryId, item.isInProgress && !item.isCompleted);
  const timeText = formatTimeRange(item);

  return (
    <div
      onClick={() => onSelectItem(item)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(item, e);
      }}
      className="flex items-center py-1.5 px-2 rounded-lg hover:bg-[#f1f3f4] transition-colors cursor-pointer group"
    >
      {/* 캘린더 색상 원형 뱃지 점 */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 mr-2"
        style={{ backgroundColor: colorTheme.rawHex }}
      />
      {/* 시간 또는 기간 표기 (예: "종일", "13~15", "09:00~10:00") */}
      <span className="min-w-[64px] max-w-[96px] mr-2 text-xs text-[#3c4043] font-medium shrink-0 whitespace-nowrap">
        {timeText}
      </span>
      {/* 일정 제목 */}
      <span
        className={`text-sm text-[#3c4043] group-hover:text-black font-normal truncate flex-1 min-w-0 ${
          item.isCompleted ? 'line-through text-slate-400' : ''
        }`}
      >
        <SmartText text={item.title} />
      </span>
      {/* 완료 상태 아이콘 */}
      {item.isCompleted && (
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1.5" />
      )}
    </div>
  );
};
