import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  FileText,
} from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

interface GoogleCalendarMonthDayAgendaProps {
  selectedDate: string;
  items: CalendarScheduleItem[];
  onSelectItem: (item: CalendarScheduleItem) => void;
  onAddEvent: (dateStr: string) => void;
}

export const GoogleCalendarMonthDayAgenda: React.FC<GoogleCalendarMonthDayAgendaProps> = ({
  selectedDate,
  items,
  onSelectItem,
  onAddEvent,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { toggleCheckItemCompleted, toggleCalendarEventCompleted, subItems } = useWorkspace();

  const dateObj = new Date(selectedDate);
  const isValid = !isNaN(dateObj.getTime());
  const formattedDate = isValid
    ? dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : selectedDate;

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
    <div className="shrink-0 bg-white border-t border-[#dadce0] flex flex-col select-none transition-all duration-200">
      {/* 1. 아젠다 상단 헤더 바 */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-[#dadce0]/70 bg-[#fafafa]">
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#1a73e8] shrink-0" />
          <span className="text-sm font-semibold text-[#202124] truncate">
            {formattedDate}
          </span>
          {isToday && (
            <span className="px-2 py-0.5 bg-[#1a73e8] text-white text-[11px] font-bold rounded-full shrink-0">
              오늘
            </span>
          )}
          <span className="text-xs text-[#5f6368] font-medium shrink-0 ml-1">
            등록된 일정 <strong className="text-[#1a73e8]">{items.length}</strong>건
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onAddEvent(selectedDate)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] border border-[#dadce0] rounded transition-colors cursor-pointer"
            title="선택한 날짜에 새 일정 만들기"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>일정 추가</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[#e8eaed] text-[#5f6368] rounded transition-colors cursor-pointer"
            title={isExpanded ? '일정 목록 접기' : '일정 목록 펼치기'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. 하단 일정 목록 (펼침 상태일 때) */}
      {isExpanded && (
        <div className="h-48 overflow-y-auto p-2 bg-white space-y-1">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#70757a]">
              <p className="text-xs font-medium">선택한 날짜에 등록된 일정이 없습니다.</p>
              <button
                type="button"
                onClick={() => onAddEvent(selectedDate)}
                className="mt-2 text-xs text-[#1a73e8] hover:underline cursor-pointer font-medium"
              >
                + 이 날짜에 새 일정 만들기
              </button>
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
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#f1f3f4] cursor-pointer group transition-colors border border-transparent hover:border-[#dadce0]/60"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    {/* 카테고리 색상 바 */}
                    <div className={`w-1 h-7 rounded-full shrink-0 ${color.bg}`} />

                    {/* 완료 체크박스 (체크리스트 or 캘린더 일정) */}
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

                    {/* 시간 표기 */}
                    <div className="w-24 shrink-0 flex items-center gap-1 text-xs text-[#5f6368]">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {isAllDay ? '종일' : schedule.dueTime}
                      </span>
                    </div>

                    {/* 출처 뱃지 */}
                    {schedule.sourceType === 'calendar' ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-medium shrink-0">
                        캘린더
                      </span>
                    ) : schedule.sourceType === 'checklist' ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium shrink-0">
                        지식 할일
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium shrink-0">
                        지식 메모
                      </span>
                    )}

                    {/* 일정 제목 및 문서 경로 */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`text-xs font-medium text-[#202124] truncate ${
                          schedule.isCompleted ? 'line-through text-[#70757a]' : ''
                        }`}
                      >
                        {schedule.title}
                      </span>
                      {subItem && (
                        <span className="text-[11px] text-[#70757a] truncate flex items-center gap-1 shrink-0">
                          <FileText className="w-3 h-3" />
                          {subItem.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-[#1a73e8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-medium">
                    상세보기 &gt;
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
