import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Check, X, Trash2 } from 'lucide-react';

interface SchedulePickerPopoverProps {
  isOpen: boolean;
  initialDate?: string;
  initialTime?: string;
  initialEndDate?: string;
  onSave: (date: string, time?: string, endDate?: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const SchedulePickerPopover: React.FC<SchedulePickerPopoverProps> = ({
  isOpen,
  initialDate,
  initialTime,
  initialEndDate,
  onSave,
  onRemove,
  onClose,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(initialDate || todayStr);
  const [time, setTime] = useState<string>(initialTime || '');
  const [endDate, setEndDate] = useState<string>(initialEndDate || '');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!date) return;
    onSave(date, time || undefined, endDate || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-300 p-3.5 w-64 flex flex-col gap-2.5 select-none animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>일정 등록 및 관리</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 날짜 선택 */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-slate-400" />
            시작일 / 일정일
          </label>
          <input
            type="date"
            autoFocus
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* 마감일 선택 (선택 사항) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-indigo-400" />
              마감일 (선택)
            </label>
            {endDate && (
              <button
                type="button"
                onClick={() => setEndDate('')}
                className="text-[10px] text-slate-400 hover:text-red-500 underline cursor-pointer"
              >
                마감일 해제
              </button>
            )}
          </div>
          <input
            type="date"
            value={endDate}
            min={date}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-sans"
          />
          <p className="text-[10px] text-slate-400">
            {endDate ? '기간 일정으로 간트차트에 표시됩니다.' : '미지정 시 해당일 단일 일정으로 표시됩니다.'}
          </p>
        </div>

        {/* 시간 선택 (선택 사항) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            시간 지정 (선택)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
          {initialDate ? (
            <button
              type="button"
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="text-[11px] text-red-600 hover:bg-red-50 px-2 py-1 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>일정 해제</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!date}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>저장</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
