import React, { useRef } from 'react';
import { Calendar, CalendarDays, Clock, List, ListTodo } from 'lucide-react';
import { CalendarSideViewType } from './GoogleCalendarRightPanel';

export type CalendarMobilePanel = 'month' | 'detail' | 'sidebar';

interface GoogleCalendarMobileNavBarProps {
  activePanel: CalendarMobilePanel;
  sideViewType: CalendarSideViewType;
  onChangePanel: (panel: CalendarMobilePanel) => void;
  onSideViewTypeChange: (type: CalendarSideViewType) => void;
}

export const GoogleCalendarMobileNavBar: React.FC<GoogleCalendarMobileNavBarProps> = ({
  activePanel,
  sideViewType,
  onChangePanel,
  onSideViewTypeChange,
}) => {
  const isMonthActive = activePanel === 'month';

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);
  const swipedRef = useRef<boolean>(false);

  const handleSelectMonth = () => {
    onChangePanel('month');
  };

  const handleSelectSideView = (type: CalendarSideViewType) => {
    onSideViewTypeChange(type);
    onChangePanel('detail');
  };

  const navItems = [
    {
      id: 'month' as const,
      label: '월간',
      Icon: CalendarDays,
      isActive: isMonthActive,
      onClick: handleSelectMonth,
    },
    {
      id: 'day' as const,
      label: '일',
      Icon: Clock,
      isActive: !isMonthActive && sideViewType === 'day',
      onClick: () => handleSelectSideView('day'),
    },
    {
      id: 'threeDay' as const,
      label: '3일',
      Icon: Calendar,
      isActive: !isMonthActive && sideViewType === 'threeDay',
      onClick: () => handleSelectSideView('threeDay'),
    },
    {
      id: 'todo' as const,
      label: 'TODO',
      Icon: ListTodo,
      isActive: !isMonthActive && sideViewType === 'todo',
      onClick: () => handleSelectSideView('todo'),
    },
    {
      id: 'schedule' as const,
      label: '일정',
      Icon: List,
      isActive: !isMonthActive && sideViewType === 'schedule',
      onClick: () => handleSelectSideView('schedule'),
    },
  ];

  // 현재 활성 뷰 인덱스 구하기 (0: 월간, 1: 일, 2: 3일, 3: TODO, 4: 일정)
  const getActiveIndex = (): number => {
    if (isMonthActive) return 0;
    if (sideViewType === 'day') return 1;
    if (sideViewType === 'threeDay') return 2;
    if (sideViewType === 'todo') return 3;
    if (sideViewType === 'schedule') return 4;
    return 0;
  };

  const switchToIndex = (index: number) => {
    if (index < 0 || index >= navItems.length) return;
    navItems[index].onClick();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore vibrate error on unsupported devices
      }
    }
  };

  // 터치 스와이프 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    swipedRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    const SWIPE_THRESHOLD = 30;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      swipedRef.current = true;
      const currentIdx = getActiveIndex();
      if (deltaX < 0) {
        // 왼쪽으로 스와이프 -> 다음 뷰 전환
        if (currentIdx < navItems.length - 1) {
          switchToIndex(currentIdx + 1);
        }
      } else {
        // 오른쪽으로 스와이프 -> 이전 뷰 전환
        if (currentIdx > 0) {
          switchToIndex(currentIdx - 1);
        }
      }
      setTimeout(() => {
        swipedRef.current = false;
      }, 200);
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // 마우스 드래그 스와이프 핸들러 (PC 모바일 에뮬레이션 지원)
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartXRef.current = e.clientX;
    swipedRef.current = false;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartXRef.current === null) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    const SWIPE_THRESHOLD = 30;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      swipedRef.current = true;
      const currentIdx = getActiveIndex();
      if (deltaX < 0) {
        if (currentIdx < navItems.length - 1) {
          switchToIndex(currentIdx + 1);
        }
      } else {
        if (currentIdx > 0) {
          switchToIndex(currentIdx - 1);
        }
      }
      setTimeout(() => {
        swipedRef.current = false;
      }, 200);
    }

    mouseStartXRef.current = null;
  };

  return (
    <nav
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="h-12 bg-white border-t border-[#dadce0] flex items-center justify-around px-1 shrink-0 select-none z-20 shadow-xs lg:hidden touch-pan-y"
    >
      {navItems.map(({ id, label, Icon, isActive, onClick }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            if (swipedRef.current) return;
            onClick();
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center transition-all cursor-pointer relative ${
            isActive
              ? 'text-[#1a73e8] font-bold'
              : 'text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          {isActive && (
            <span className="absolute top-0 left-2 right-2 h-0.5 bg-[#1a73e8] rounded-full" />
          )}
          <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] leading-tight">{label}</span>
        </button>
      ))}
    </nav>
  );
};
