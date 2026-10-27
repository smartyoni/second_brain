import React from 'react';
import { CalendarScheduleItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { Check } from 'lucide-react';

interface GoogleCalendarScheduleItemRowProps {
  item: CalendarScheduleItem;
  onSelectItem: (item: CalendarScheduleItem) => void;
  formatTimeRange: (dueTime?: string, endTime?: string) => string;
}

export const GoogleCalendarScheduleItemRow: React.FC<GoogleCalendarScheduleItemRowProps> = ({
  item,
  onSelectItem,
  formatTimeRange,
}) => {
  const colorTheme = getGoogleCategoryColor(item.categoryId);
  const timeText = formatTimeRange(item.dueTime, item.endTime);

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="flex items-center py-2 px-3 rounded-lg hover:bg-[#f1f3f4] transition-colors cursor-pointer group"
    >
      {/* 캘린더 색상 원형 뱃지 점 */}
      <span
        className="w-3 h-3 rounded-full shrink-0 mr-3.5"
        style={{ backgroundColor: colorTheme.rawHex }}
      />
      {/* 시간 표기 (종일 또는 HH:mm~HH:mm) */}
      <span className="w-28 sm:w-32 text-xs text-[#3c4043] font-medium shrink-0">
        {timeText}
      </span>
      {/* 일정 제목 */}
      <span
        className={`text-sm text-[#3c4043] group-hover:text-black font-normal truncate flex-1 ${
          item.isCompleted ? 'line-through text-slate-400' : ''
        }`}
      >
        {item.title}
      </span>
      {/* 완료 상태 아이콘 */}
      {item.isCompleted && (
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
      )}
    </div>
  );
};
