import React from 'react';
import { Check } from 'lucide-react';

interface GoogleCalendarStatusToggleProps {
  isInProgress: boolean;
  isCompleted: boolean;
  onChange: (status: { isInProgress: boolean; isCompleted: boolean }) => void;
  className?: string;
}

export const GoogleCalendarStatusToggle: React.FC<GoogleCalendarStatusToggleProps> = ({
  isInProgress,
  isCompleted,
  onChange,
  className = '',
}) => {
  const handleToggleInProgress = () => {
    if (isInProgress) {
      onChange({ isInProgress: false, isCompleted });
    } else {
      onChange({ isInProgress: true, isCompleted: false });
    }
  };

  const handleToggleCompleted = () => {
    if (isCompleted) {
      onChange({ isInProgress, isCompleted: false });
    } else {
      onChange({ isInProgress: false, isCompleted: true });
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-[#f1f3f4] p-0.5 rounded-md border border-[#dadce0] ${className}`}
    >
      {/* 진행중 버튼 */}
      <button
        type="button"
        onClick={handleToggleInProgress}
        className={`px-2 py-0.5 text-xs rounded transition-all font-medium flex items-center gap-1 cursor-pointer select-none ${
          isInProgress
            ? 'bg-[#1a73e8] text-white shadow-2xs font-semibold'
            : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/70'
        }`}
        title="진행중으로 설정하면 완료되기 전까지 오늘 종일 영역에 항상 표시됩니다"
      >
        {isInProgress && <Check className="w-3 h-3 stroke-[2.5]" />}
        <span>진행중</span>
      </button>

      {/* 완료 버튼 */}
      <button
        type="button"
        onClick={handleToggleCompleted}
        className={`px-2 py-0.5 text-xs rounded transition-all font-medium flex items-center gap-1 cursor-pointer select-none ${
          isCompleted
            ? 'bg-[#137333] text-white shadow-2xs font-semibold'
            : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/70'
        }`}
        title="완료 상태로 설정합니다"
      >
        {isCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
        <span>완료</span>
      </button>
    </div>
  );
};
