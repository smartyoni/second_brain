import React, { useState } from 'react';
import { Calendar as _CalendarIcon, Clock, AlignLeft } from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { TimePicker24h } from '../shared/TimePicker24h';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

export interface EventInlineUpdateData {
  title: string;
  dueDate: string;
  endDate?: string;
  dueTime?: string;
  description?: string;
  isInProgress?: boolean;
  isCompleted?: boolean;
}

interface GoogleCalendarEventInlineEditProps {
  item: CalendarScheduleItem;
  onSubmit: (updates: EventInlineUpdateData) => void;
  className?: string;
}

export const GoogleCalendarEventInlineEdit: React.FC<GoogleCalendarEventInlineEditProps> = ({
  item,
  onSubmit,
  className = '',
}) => {
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDate, setEditDate] = useState(item.dueDate || '');
  const [editEndDate, setEditEndDate] = useState(item.endDate || '');
  const [editTime, setEditTime] = useState(item.dueTime || '10:00');
  const [editIsAllDay, setEditIsAllDay] = useState(!item.dueTime || !!item.isInProgress);
  const [editIsInProgress, setEditIsInProgress] = useState(!!item.isInProgress);
  const [editIsCompleted, setEditIsCompleted] = useState(!!item.isCompleted);
  const [editDescription, setEditDescription] = useState(
    item.description ?? item.memo ?? ''
  );

  const isOngoing = editIsInProgress && !editIsCompleted;
  const activeColor = getGoogleCategoryColor(item.categoryId, isOngoing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate) return;

    const validEndDate =
      editEndDate && editEndDate >= editDate ? editEndDate : undefined;

    onSubmit({
      title: editTitle.trim(),
      dueDate: editDate,
      endDate: validEndDate,
      dueTime: editIsAllDay ? undefined : editTime,
      description: editDescription.trim() || undefined,
      isInProgress: editIsInProgress,
      isCompleted: editIsCompleted,
    });
  };

  return (
    <form
      id="calendar-event-inline-edit-form"
      onSubmit={handleSubmit}
      className={`p-5 sm:p-6 space-y-4 overflow-y-auto text-xs ${className}`}
    >
      {/* 1. 색상 사각형 + 제목 인풋 (읽기 뷰와 1:1 일치) */}
      <div className="flex items-start gap-4">
        <div className={`w-3.5 h-3.5 rounded-xs mt-2 shrink-0 ${activeColor.bg}`} />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="일정 제목"
            className="w-full text-base font-normal text-[#3c4043] px-2 py-1 border-b-2 border-[#1a73e8] outline-none bg-blue-50/20 rounded-t focus:bg-blue-50/40 transition-colors"
          />
        </div>
      </div>

      {/* 2. 시계 아이콘 + 날짜 / 종일 / 시간 / 진행중 버튼 (읽기 뷰와 1:1 일치) */}
      <div className="flex items-start gap-4 text-xs text-[#3c4043]">
        <Clock className="w-4 h-4 text-[#5f6368] shrink-0 mt-1" />
        <div className="flex-1 space-y-2">
          {/* 시작일 ~ 종료일 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="px-2 py-1 border border-[#dadce0] rounded text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
              title="시작일"
              required
            />
            <span className="text-[#5f6368]">~</span>
            <input
              type="date"
              value={editEndDate}
              min={editDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              className="px-2 py-1 border border-[#dadce0] rounded text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
              title="종료일 (선택)"
            />
          </div>

          {/* 종일 & 시간 & 진행중 상태 토글 */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-[#3c4043] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsAllDay}
                onChange={(e) => setEditIsAllDay(e.target.checked)}
                className="rounded text-[#1a73e8] focus:ring-0 cursor-pointer"
              />
              <span>종일</span>
            </label>

            {!editIsAllDay && (
              <TimePicker24h
                value={editTime}
                onChange={setEditTime}
                className="px-2 py-0.5 border border-[#dadce0] rounded text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
              />
            )}

            <button
              type="button"
              onClick={() => {
                const next = !editIsInProgress;
                setEditIsInProgress(next);
                if (next) {
                  setEditIsCompleted(false);
                  setEditIsAllDay(true);
                }
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                isOngoing
                  ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title="진행중으로 설정하면 완료 전까지 종일 영역에 항상 노출됩니다"
            >
              진행중 {isOngoing ? '✓' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 메모 아이콘 + 상세 설명 텍스트영역 (읽기 뷰와 1:1 일치) */}
      <div className="flex items-start gap-4 text-xs text-[#3c4043]">
        <AlignLeft className="w-4 h-4 text-[#5f6368] shrink-0 mt-2" />
        <div className="flex-1">
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="설명(메모) 입력..."
            rows={3}
            className="w-full whitespace-pre-wrap text-slate-700 bg-slate-50 p-2.5 rounded-md border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white outline-none resize-none transition-colors"
          />
        </div>
      </div>
    </form>
  );
};
