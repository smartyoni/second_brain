import React, { useState } from 'react';
import { X, Clock, Folder, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface GoogleCalendarCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export const GoogleCalendarCreateModal: React.FC<GoogleCalendarCreateModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
}) => {
  const { categoryItems, subItems, checklistGroups, setChecklistGroups } = useWorkspace();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [isAllDay, setIsAllDay] = useState(false);
  const [dueTime, setDueTime] = useState('09:00');
  const [selectedSubId, setSelectedSubId] = useState<string>(subItems[0]?.id || '');

  // 모달이 열릴 때 선택된 날짜로 업데이트 및 ESC 키 감지
  React.useEffect(() => {
    if (isOpen) {
      setDueDate(selectedDate);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedDate, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetGroup = checklistGroups.find((g) => g.subItemId === selectedSubId);
    if (targetGroup) {
      setChecklistGroups((prev) =>
        prev.map((g) =>
          g.id === targetGroup.id
            ? {
                ...g,
                items: [
                  ...g.items,
                  {
                    id: `chk-${Date.now()}`,
                    text: title.trim(),
                    isCompleted: false,
                    order: g.items.length + 1,
                    dueDate,
                    dueTime: isAllDay ? undefined : dueTime || undefined,
                  },
                ],
              }
            : g
        )
      );
    }

    setTitle('');
    setIsAllDay(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 select-none p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden"
      >
        {/* 헤더 */}
        <div className="px-6 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
          <span className="text-sm font-medium text-[#3c4043]">새 일정 만들기</span>
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
          <div>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 추가"
              className="w-full text-base font-normal text-[#3c4043] border-b-2 border-[#1a73e8] pb-1.5 focus:outline-none placeholder-[#70757a]"
            />
          </div>

          {/* 일자 및 시간 / 종일 토글 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[#3c4043]">
              <Clock className="w-4 h-4 text-[#5f6368] shrink-0" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f1f3f4] rounded text-xs text-[#3c4043] outline-none border border-transparent focus:border-[#1a73e8]"
              />

              {!isAllDay && (
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f1f3f4] rounded text-xs text-[#3c4043] outline-none border border-transparent focus:border-[#1a73e8]"
                />
              )}
            </div>

            {/* 구글 캘린더 스타일 종일 체크박스 */}
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
                <span className="text-xs font-normal" onClick={() => setIsAllDay(!isAllDay)}>
                  종일
                </span>
              </label>
            </div>
          </div>

          {/* 소속 문서(카테고리) 선택 */}
          <div className="flex items-center gap-3 text-[#3c4043]">
            <Folder className="w-4 h-4 text-[#5f6368] shrink-0" />
            <select
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-[#f1f3f4] rounded text-xs text-[#3c4043] outline-none border border-transparent focus:border-[#1a73e8]"
            >
              {subItems.map((sub) => {
                const cat = categoryItems.find((c) => c.id === sub.categoryId);
                return (
                  <option key={sub.id} value={sub.id}>
                    [{cat?.name || '기본'}] {sub.title}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
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
