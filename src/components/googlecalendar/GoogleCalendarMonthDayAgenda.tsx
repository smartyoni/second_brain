import React from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  Check,
  Clock,
  FileText,
  AlignLeft,
} from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

interface GoogleCalendarMonthDayAgendaProps {
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectItem: (item: CalendarScheduleItem) => void;
  onAddEvent: (dateStr: string) => void;
  onClose?: () => void;
}

export const GoogleCalendarMonthDayAgenda: React.FC<GoogleCalendarMonthDayAgendaProps> = ({
  selectedDate,
  items,
  onSelectItem,
  onAddEvent,
  onClose,
}) => {
  const { toggleCheckItemCompleted, toggleCalendarEventCompleted, subItems } = useWorkspace();

  const dateObj = new Date(selectedDate);
  const isValid = !isNaN(dateObj.getTime());
  const formattedDate = isValid
    ? dateObj.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : selectedDate;
  const yearText = isValid ? `${dateObj.getFullYear()}년` : '';

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  const handleToggleComplete = (item: CalendarScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.sourceType === 'calendar') {
      toggleCalendarEventCompleted(item.id);
    } else if (item.sourceType === 'checklist' && item.groupId) {
      toggleCheckItemCompleted(item.groupId, item.id);
    }
  };

  return (
    <aside className="w-80 shrink-0 bg-white border-l border-[#dadce0] flex flex-col h-full select-none shadow-sm z-10">
      {/* 1. 상단 헤더 */}
      <div className="p-4 border-b border-[#dadce0] bg-[#fafafa]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#5f6368] font-medium">
            <CalendarIcon className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>{yearText}</span>
            {isToday && (
              <span className="px-1.5 py-0.5 bg-[#1a73e8] text-white text-[10px] font-bold rounded-full">
                오늘
              </span>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors cursor-pointer"
              title="패널 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-1.5 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#202124]">{formattedDate}</h2>
          <span className="text-xs text-[#5f6368]">
            일정 <strong className="text-[#1a73e8]">{items.length}</strong>건
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddEvent(selectedDate)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 일정 추가</span>
        </button>
      </div>

      {/* 2. 일정 카드 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f8f9fa]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#70757a]">
            <CalendarIcon className="w-8 h-8 text-[#dadce0] mb-2" />
            <p className="text-xs font-medium text-[#3c4043]">등록된 일정이 없습니다</p>
            <p className="text-[11px] text-[#70757a] mt-1">
              상단의 버튼이나 날짜를 더블 클릭하여 새 일정을 추가해보세요.
            </p>
          </div>
        ) : (
          items.map((schedule) => {
            const color = getGoogleCategoryColor(schedule.categoryId);
            const subItem = subItems.find((s) => s.id === schedule.subItemId);
            const isAllDay = !schedule.dueTime;

            return (
              <div
                key={schedule.id}
                onClick={() => onSelectItem(schedule)}
                className="bg-white rounded-lg border border-[#dadce0]/80 p-3 hover:shadow-md hover:border-[#1a73e8]/50 cursor-pointer transition-all duration-150 flex flex-col gap-2 group"
              >
                {/* 상단: 색상 띠, 출처 뱃지, 완료 체크박스 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                    {schedule.sourceType === 'calendar' ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-medium">
                        캘린더
                      </span>
                    ) : schedule.sourceType === 'checklist' ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                        지식 할일
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium">
                        지식 메모
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleComplete(schedule, e)}
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                      schedule.isCompleted
                        ? 'bg-[#1a73e8] border-[#1a73e8] text-white'
                        : 'border-[#5f6368] hover:border-[#1a73e8] bg-white'
                    }`}
                    title={schedule.isCompleted ? '완료 취소' : '완료 체크'}
                  >
                    {schedule.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                </div>

                {/* 제목 */}
                <h3
                  className={`text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors leading-tight line-clamp-2 ${
                    schedule.isCompleted ? 'line-through text-[#70757a]' : ''
                  }`}
                >
                  {schedule.title}
                </h3>

                {/* 하단 메타 정보 (시간, 장소, 출처 지식문서) */}
                <div className="space-y-1 pt-1.5 border-t border-gray-100 text-[11px] text-[#5f6368]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#70757a] shrink-0" />
                    <span>{isAllDay ? '종일' : schedule.dueTime}</span>
                  </div>

                  {schedule.description && (
                    <div className="flex items-center gap-1.5">
                      <AlignLeft className="w-3.5 h-3.5 text-[#70757a] shrink-0" />
                      <span className="truncate">{schedule.description}</span>
                    </div>
                  )}

                  {subItem && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#70757a] shrink-0" />
                      <span className="truncate">{subItem.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
