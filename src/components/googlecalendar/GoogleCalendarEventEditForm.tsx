import React, { useState } from 'react';
import { Clock, Calendar as CalendarIcon, Check, Palette } from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { GOOGLE_COLORS, getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

interface GoogleCalendarEventEditFormProps {
  item: CalendarScheduleItem;
  onSave: (updates: {
    title: string;
    dueDate: string;
    endDate?: string;
    dueTime?: string;
    categoryId: string;
    description?: string;
  }) => void;
  onCancel: () => void;
}

export const GoogleCalendarEventEditForm: React.FC<GoogleCalendarEventEditFormProps> = ({
  item,
  onSave,
  onCancel,
}) => {
  const currentColor = getGoogleCategoryColor(item.categoryId);

  const [editTitle, setEditTitle] = useState(item.title);
  const [editDate, setEditDate] = useState(item.dueDate || '');
  const [editEndDate, setEditEndDate] = useState(item.endDate || '');
  const [editTime, setEditTime] = useState(item.dueTime || '10:00');
  const [editIsAllDay, setEditIsAllDay] = useState(!item.dueTime);
  const [editColorId, setEditColorId] = useState(
    GOOGLE_COLORS.some((c) => c.id === item.categoryId)
      ? item.categoryId
      : currentColor.id
  );
  const [editDescription, setEditDescription] = useState(
    item.description ?? item.memo ?? ''
  );

  const activeColor = getGoogleCategoryColor(editColorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate) return;

    const validEndDate =
      editEndDate && editEndDate >= editDate ? editEndDate : undefined;

    onSave({
      title: editTitle.trim(),
      dueDate: editDate,
      endDate: validEndDate,
      dueTime: editIsAllDay ? undefined : editTime,
      categoryId: editColorId,
      description: editDescription.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
      {/* 제목 입력 */}
      <div>
        <input
          type="text"
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="일정 제목 입력"
          className="w-full text-base font-medium px-3 py-2 border-b-2 border-[#1a73e8] outline-none text-[#202124] bg-transparent"
        />
      </div>

      {/* 날짜 및 시간 선택 */}
      <div className="space-y-2 bg-[#f8f9fa] p-3 rounded-lg border border-[#dadce0]">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarIcon className="w-4 h-4 text-[#5f6368] shrink-0" />
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="px-2 py-1.5 border border-[#dadce0] rounded-md text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
            title="시작일"
          />
          <span className="text-[#5f6368]">~</span>
          <input
            type="date"
            value={editEndDate}
            min={editDate}
            onChange={(e) => setEditEndDate(e.target.value)}
            className="px-2 py-1.5 border border-[#dadce0] rounded-md text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
            title="종료일 (선택)"
          />
          <label className="flex items-center gap-1.5 text-xs text-[#3c4043] cursor-pointer ml-auto select-none">
            <input
              type="checkbox"
              checked={editIsAllDay}
              onChange={(e) => setEditIsAllDay(e.target.checked)}
              className="rounded text-[#1a73e8] focus:ring-0"
            />
            <span>종일</span>
          </label>
        </div>

        {!editIsAllDay && (
          <div className="flex items-center gap-2 pl-6">
            <Clock className="w-3.5 h-3.5 text-[#5f6368] shrink-0" />
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="px-2.5 py-1.5 border border-[#dadce0] rounded-md text-xs bg-white text-[#3c4043] outline-none focus:border-[#1a73e8]"
            />
          </div>
        )}
      </div>

      {/* 구글 캘린더 색상 라벨 팔레트 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#5f6368] font-medium">
          <Palette className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>
            색상 라벨: <strong className="text-[#3c4043]">{activeColor.name}</strong>
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2 p-2.5 bg-[#f8f9fa] rounded-lg border border-[#dadce0]">
          {GOOGLE_COLORS.map((c) => {
            const isSelected = editColorId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setEditColorId(c.id)}
                className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-2xs ${
                  isSelected ? 'ring-2 ring-offset-2 ring-[#1a73e8] scale-110' : 'hover:opacity-90'
                }`}
                title={c.name}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 메모(설명) */}
      <div>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="설명(메모) 추가..."
          rows={3}
          className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs outline-none focus:border-[#1a73e8] resize-none text-[#3c4043] placeholder-[#70757a]"
        />
      </div>

      {/* 편집 하단 액션 버튼 */}
      <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#dadce0]">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!editTitle.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-slate-300 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>저장</span>
        </button>
      </div>
    </form>
  );
};
