import React from 'react';
import { CalendarScheduleItem, SubItem } from '../../types';
import { CheckSquare, Square, FileText, ArrowRight, Clock } from 'lucide-react';

interface CalendarDayTimelineProps {
  selectedDate: string; // YYYY-MM-DD
  scheduleItems: CalendarScheduleItem[];
  subItems: SubItem[];
  onToggleComplete: (groupId: string, itemId: string) => void;
  onJumpToItem: (item: CalendarScheduleItem) => void;
}

export const CalendarDayTimeline: React.FC<CalendarDayTimelineProps> = ({
  selectedDate,
  scheduleItems,
  subItems,
  onToggleComplete,
  onJumpToItem,
}) => {
  // 선택된 날짜에 해당하는 일정만 필터링
  const dayItems = scheduleItems.filter((i) => i.dueDate === selectedDate);

  // 날짜 포맷 (예: 2026년 10월 20일 화요일)
  const dateObj = new Date(selectedDate);
  const formattedDate = isNaN(dateObj.getTime())
    ? selectedDate
    : dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });

  const getSubItemTitle = (subItemId: string) => {
    return subItems.find((s) => s.id === subItemId)?.title || '연결 문서';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 select-none">
      {/* 타임라인 헤더 */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900">{formattedDate}</span>
        </div>
        <span className="text-[11px] text-slate-600 font-semibold">
          총 <span className="text-blue-700 font-bold">{dayItems.length}</span>건
        </span>
      </div>

      {/* 일정 목록 */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
        {dayItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-[1.5]" />
            <p className="font-semibold text-slate-600">등록된 일정이 없습니다</p>
            <p className="text-[11px] text-slate-400 mt-1">
              3번 패널의 체크리스트나 텍스트박스에서 <br />
              3점 메뉴의 [일정 등록]을 눌러보세요.
            </p>
          </div>
        ) : (
          dayItems.map((item) => {
            const subTitle = getSubItemTitle(item.subItemId);

            return (
              <div
                key={item.id}
                className={`p-2.5 bg-white rounded-lg border transition-all shadow-2xs flex flex-col gap-1.5 ${
                  item.isCompleted
                    ? 'border-slate-300 bg-slate-50/70 opacity-70'
                    : 'border-slate-300 hover:border-blue-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* 체크리스트 타입일 경우 원클릭 토글 버튼 */}
                  {item.sourceType === 'checklist' ? (
                    <button
                      type="button"
                      onClick={() => onToggleComplete(item.groupId, item.id)}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors shrink-0"
                    >
                      {item.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}

                  {/* 제목 및 내용 */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-snug break-words ${
                        item.isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 font-medium'
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>

                {/* 하단: 시간, 소속 문서명, 원본 문서 바로가기 */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {item.dueTime && (
                      <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        {item.dueTime}
                      </span>
                    )}
                    <span className="truncate max-w-[150px] text-slate-500">
                      📄 {subTitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToItem(item)}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    title="해당 원본 문서 위치로 이동"
                  >
                    <span>문서 이동</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
