import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, AlignLeft, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

export interface QuickCreateState {
  isOpen: boolean;
  date: string;
  time?: string;
  isAllDay: boolean;
}

interface GoogleCalendarQuickCreateModalProps {
  createState: QuickCreateState;
  onClose: () => void;
}

export const GoogleCalendarQuickCreateModal: React.FC<GoogleCalendarQuickCreateModalProps> = ({
  createState,
  onClose,
}) => {
  const { categoryItems, addCalendarEvent } = useWorkspace();
  const [eventType, setEventType] = useState<'event' | 'task'>('event');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(createState.date);
  const [time, setTime] = useState(createState.time || '10:00');
  const [isAllDay, setIsAllDay] = useState(createState.isAllDay);
  const [selectedCatId, setSelectedCatId] = useState<string>(categoryItems[0]?.id || 'cat-1');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (createState.isOpen) {
      setDate(createState.date);
      setTime(createState.time || '10:00');
      setIsAllDay(createState.isAllDay);
      setTitle('');
      setDescription('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && createState.isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createState, onClose]);

  if (!createState.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCalendarEvent({
      title: title.trim(),
      dueDate: date,
      dueTime: isAllDay ? undefined : time,
      categoryId: selectedCatId,
      description: description.trim() || undefined,
      eventType,
      isCompleted: false,
    });

    onClose();
  };

  const selectedColor = getGoogleCategoryColor(selectedCatId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 select-none p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden"
      >
        {/* 상단 툴바 & 닫기 */}
        <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
          {/* 구글 캘린더 특유의 [ 이벤트 | 할 일 ] 탭 */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEventType('event')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                eventType === 'event'
                  ? 'bg-white text-[#1a73e8] font-bold shadow-2xs'
                  : 'text-[#5f6368] hover:bg-slate-200/60'
              }`}
            >
              이벤트
            </button>
            <button
              type="button"
              onClick={() => setEventType('task')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                eventType === 'task'
                  ? 'bg-white text-[#1a73e8] font-bold shadow-2xs'
                  : 'text-[#5f6368] hover:bg-slate-200/60'
              }`}
            >
              할 일
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-[#5f6368] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* 제목 추가 인풋 */}
          <div>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 추가"
              className="w-full text-lg font-normal text-[#3c4043] border-b-2 border-[#1a73e8] pb-1.5 focus:outline-none placeholder-[#70757a]"
            />
          </div>

          {/* 일시 및 시간 / 종일 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[#3c4043]">
              <Clock className="w-4 h-4 text-[#5f6368] shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f1f3f4] rounded text-xs text-[#3c4043] outline-none border border-transparent focus:border-[#1a73e8]"
              />

              {!isAllDay && (
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f1f3f4] rounded text-xs text-[#3c4043] outline-none border border-transparent focus:border-[#1a73e8]"
                />
              )}
            </div>

            {/* 종일 체크박스 */}
            <div className="pl-7">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[#3c4043]">
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors border ${
                    isAllDay
                      ? 'bg-[#1a73e8] border-transparent text-white'
                      : 'border-[#5f6368] bg-transparent'
                  }`}
                  onClick={() => setIsAllDay(!isAllDay)}
                >
                  {isAllDay && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs" onClick={() => setIsAllDay(!isAllDay)}>
                  종일
                </span>
              </label>
            </div>
          </div>

          {/* 캘린더 / 카테고리 선택 */}
          <div className="flex items-center gap-3 text-[#3c4043]">
            <CalendarIcon className="w-4 h-4 text-[#5f6368] shrink-0" />
            <div className="flex items-center gap-2 flex-1 bg-[#f1f3f4] px-2.5 py-1.5 rounded">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedColor.dot}`} />
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full bg-transparent text-xs text-[#3c4043] outline-none cursor-pointer"
              >
                {categoryItems.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 설명 추가 */}
          <div className="flex items-start gap-3 text-[#3c4043]">
            <AlignLeft className="w-4 h-4 text-[#5f6368] shrink-0 mt-2" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 추가 (메모, 링크, 장소 등)"
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#f1f3f4] rounded text-xs text-[#3c4043] outline-none border border-transparent focus:border-[#1a73e8] resize-none"
            />
          </div>

          {/* 하단 액션 버튼 */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#3c4043] hover:bg-[#f1f3f4] rounded-md font-medium cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md font-medium shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
