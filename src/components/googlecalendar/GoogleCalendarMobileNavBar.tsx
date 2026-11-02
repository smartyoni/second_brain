import React from 'react';
import { Calendar, CalendarDays, CalendarRange, Clock, List } from 'lucide-react';
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
      id: 'week' as const,
      label: '주',
      Icon: CalendarRange,
      isActive: !isMonthActive && sideViewType === 'week',
      onClick: () => handleSelectSideView('week'),
    },
    {
      id: 'schedule' as const,
      label: '일정',
      Icon: List,
      isActive: !isMonthActive && sideViewType === 'schedule',
      onClick: () => handleSelectSideView('schedule'),
    },
  ];

  return (
    <nav className="h-12 bg-white border-t border-[#dadce0] flex items-center justify-around px-1 shrink-0 select-none z-20 shadow-xs lg:hidden">
      {navItems.map(({ id, label, Icon, isActive, onClick }) => (
        <button
          key={id}
          type="button"
          onClick={onClick}
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
