import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlignLeft } from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { TimePicker24h } from '../shared/TimePicker24h';
import { GoogleCalendarStatusToggle } from './GoogleCalendarStatusToggle';

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
      {/* 1. 제목 입력 */}
      <div>
        <label className="block text-[11px] font-semibold text-[#5f6368] mb-1">
          제목
        </label>
        <input
          type="text"
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="일정 제목 입력"
          className="w-full text-base font-semibold px-2.5 py-1.5 border border-[#dadce0] rounded-md outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] text-[#202124] bg-white transition-colors"
        />
      </div>

      {/* 2. 일시, 기간, 종일, 시간 및 진행상태 설정 */}
      <div className="space-y-2.5 bg-[#f8f9fa] p-3 rounded-lg border border-[#dadce0]">
        <div>
          <span className="block text-[11px] font-semibold text-[#5f6368] mb-1.5">
            일시 및 기간
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <CalendarIcon className="w-4 h-4 text-[#5f6368] shrink-0" />
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="px-2 py-1 border border-[#dadce0] rounded-md text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
              title="시작일"
              required
            />
            <span className="text-[#5f6368] text-xs">~</span>
            <input
              type="date"
              value={editEndDate}
              min={editDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              className="px-2 py-1 border border-[#dadce0] rounded-md text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
              title="종료일 (선택)"
            />
          </div>
        </div>

        {/* 종일 여부 & 시간 선택 & 진행 상태 */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-[#e8eaed]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-[#3c4043] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsAllDay}
                onChange={(e) => setEditIsAllDay(e.target.checked)}
                className="rounded text-[#1a73e8] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium">종일</span>
            </label>

            {!editIsAllDay && (
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#5f6368] shrink-0" />
                <TimePicker24h
                  value={editTime}
                  onChange={setEditTime}
                  className="px-2 py-1 border border-[#dadce0] rounded-md text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
                />
              </div>
            )}
          </div>

          <GoogleCalendarStatusToggle
            isInProgress={editIsInProgress}
            isCompleted={editIsCompleted}
            onChange={({ isInProgress, isCompleted }) => {
              setEditIsInProgress(isInProgress);
              setEditIsCompleted(isCompleted);
              if (isInProgress) {
                setEditIsAllDay(true);
              }
            }}
          />
        </div>
      </div>

      {/* 3. 메모(설명) 입력 */}
      <div>
        <label className="flex items-center gap-1 text-[11px] font-semibold text-[#5f6368] mb-1">
          <AlignLeft className="w-3.5 h-3.5 text-[#5f6368]" />
          <span>설명 (메모)</span>
        </label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="메모나 세부 내용을 입력하세요..."
          rows={3}
          className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] resize-none text-[#3c4043] placeholder-[#70757a] bg-white transition-colors"
        />
      </div>
    </form>
  );
};
