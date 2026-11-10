import React, { useRef } from 'react';
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
import { getGoogleCategoryColor, getTodayDateStr, parseLocalDate } from '../../utils/googleCalendarUtils';
import { getLunarDate } from '../../utils/lunarCalendar';
import { SmartText } from '../shared/SmartText';
import { useSwipeDownToClose } from '../../hooks/useSwipeDownToClose';

interface GoogleCalendarMonthDayAgendaProps {
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectItem: (item: CalendarScheduleItem) => void;
  onAddEvent: (dateStr: string) => void;
  onClose?: () => void;
  className?: string;
}

export const GoogleCalendarMonthDayAgenda: React.FC<GoogleCalendarMonthDayAgendaProps> = ({
  selectedDate,
  items,
  onSelectItem,
  onAddEvent,
  onClose,
  className,
}) => {
  const { toggleCheckItemCompleted, toggleCalendarEventCompleted, subItems } = useWorkspace();
  const listRef = useRef<HTMLDivElement>(null);

  const {
    translateY,
    isDragging,
    headerTouchHandlers,
    contentTouchHandlers,
  } = useSwipeDownToClose({
    onClose,
    threshold: 50,
    scrollContainerRef: listRef,
  });

  const dateObj = parseLocalDate(selectedDate);
  const isValid = !isNaN(dateObj.getTime());
  const formattedDate = isValid
    ? dateObj.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : selectedDate;
  const yearText = isValid ? `${dateObj.getFullYear()}년` : '';

  const todayStr = getTodayDateStr();
  const isToday = selectedDate === todayStr;
  const lunar = getLunarDate(selectedDate);

  const handleToggleComplete = (item: CalendarScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.sourceType === 'calendar') {
      toggleCalendarEventCompleted(item.id);
    } else if (item.sourceType === 'checklist' && item.groupId) {
      toggleCheckItemCompleted(item.groupId, item.id);
    }
  };

  return (
    <aside
      className={
        className
          ? className
          : 'w-[448px] shrink-0 bg-white border-l border-[#dadce0] flex flex-col h-full select-none shadow-sm z-10'
      }
      style={{
        transform: translateY > 0 ? `translate3d(0, ${translateY}px, 0)` : undefined,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        touchAction: 'pan-y',
      }}
    >
      {/* 1. 상단 헤더 */}
      <div
        className="p-3 sm:p-4 border-b border-[#dadce0] bg-[#fafafa] touch-none select-none"
        {...headerTouchHandlers}
      >
        {/* 모바일 시트 핸들 바 */}
        <div
          onClick={onClose}
          className="w-full flex justify-center py-1 -mt-1 mb-1.5 sm:hidden cursor-pointer active:opacity-70 transition-opacity"
          title="아래로 스와이프하거나 터치하여 닫기"
        >
          <div className="w-10 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>
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

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#202124] flex items-center gap-1.5 shrink-0">
              <span>{formattedDate}</span>
              {lunar && (
                <span className="text-xs font-medium text-purple-600" title={lunar.fullText}>
                  ({lunar.text})
                </span>
              )}
            </h2>
            <span className="text-xs text-[#5f6368] shrink-0">
              일정 <strong className="text-[#1a73e8]">{items.length}</strong>건
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddEvent(selectedDate)}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새일정</span>
          </button>
        </div>
      </div>

      {/* 2. 일정 카드 리스트 */}
      <div
        ref={listRef}
        {...contentTouchHandlers}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f8f9fa] overscroll-contain"
      >
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
            const color = getGoogleCategoryColor(schedule.categoryId, schedule.isInProgress && !schedule.isCompleted);
            const subItem = subItems.find((s) => s.id === schedule.subItemId);
            const isAllDay = !schedule.dueTime || (schedule.isInProgress && !schedule.isCompleted);

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
                    {schedule.isInProgress && !schedule.isCompleted && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold">
                        진행중
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
                  <SmartText text={schedule.title} />
                </h3>

                {/* 하단 메타 정보 (시간, 장소, 출처 지식문서) */}
                <div className="space-y-1 pt-1.5 border-t border-gray-100 text-[11px] text-[#5f6368]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#70757a] shrink-0" />
                    <span className={schedule.isInProgress && !schedule.isCompleted ? 'text-[#d50000] font-semibold' : ''}>
                      {schedule.isInProgress && !schedule.isCompleted
                        ? '진행중'
                        : isAllDay
                        ? '종일'
                        : schedule.dueTime}
                    </span>
                  </div>

                  {schedule.description && (
                    <div className="flex items-center gap-1.5">
                      <AlignLeft className="w-3.5 h-3.5 text-[#70757a] shrink-0" />
                      <span className="truncate">
                        <SmartText text={schedule.description} />
                      </span>
                    </div>
                  )}

                  {subItem && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#70757a] shrink-0" />
                      <span className="truncate">
                        <SmartText text={subItem.title} />
                      </span>
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
