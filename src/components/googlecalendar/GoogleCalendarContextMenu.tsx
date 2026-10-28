import React, { useEffect, useRef } from 'react';
import { Pencil, Trash2, Check } from 'lucide-react';
import { CalendarScheduleItem } from '../../types';
import { GOOGLE_COLORS, getGoogleCategoryColor } from '../../utils/googleCalendarUtils';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  item: CalendarScheduleItem | null;
}

interface GoogleCalendarContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onColorChange: (item: CalendarScheduleItem, colorId: string) => void;
  onEdit: (item: CalendarScheduleItem) => void;
  onDelete: (item: CalendarScheduleItem) => void;
}

export const GoogleCalendarContextMenu: React.FC<GoogleCalendarContextMenuProps> = ({
  state,
  onClose,
  onColorChange,
  onEdit,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isOpen, onClose]);

  if (!state.isOpen || !state.item) return null;

  const item = state.item;
  const isCalendarOwnEvent = item.sourceType === 'calendar';
  const currentColor = getGoogleCategoryColor(item.categoryId);

  // 화면 밖으로 나가지 않도록 위치 보정 (메뉴 크기 약 200px x 180px)
  const menuWidth = 210;
  const menuHeight = 180;
  const adjustedX = Math.min(state.x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(state.y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-[#dadce0] p-2 text-xs select-none animate-in fade-in zoom-in-95 duration-100 min-w-[200px]"
    >
      {/* 1. 색상 선택 팔레트 (11개 구글 컬러) */}
      <div className="px-1 py-1">
        <span className="text-[10px] text-[#70757a] font-medium block mb-1.5">
          색상 변경 ({currentColor.name})
        </span>
        <div className="grid grid-cols-6 gap-1.5 pb-2 border-b border-[#dadce0]">
          {GOOGLE_COLORS.map((c) => {
            const isSelected = item.categoryId === c.id || (!item.categoryId && c.id === GOOGLE_COLORS[0].id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onColorChange(item, c.id);
                  onClose();
                }}
                className={`w-5 h-5 rounded-full ${c.bg} flex items-center justify-center transition-all cursor-pointer hover:scale-120 ${
                  isSelected ? 'ring-2 ring-offset-1 ring-[#1a73e8] scale-110' : ''
                }`}
                title={c.name}
              >
                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 수정 & 삭제 액션 메뉴 */}
      <div className="pt-1 space-y-0.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(item);
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#f1f3f4] text-[#3c4043] font-medium transition-colors cursor-pointer text-left"
        >
          <Pencil className="w-3.5 h-3.5 text-[#5f6368]" />
          <span>수정</span>
        </button>

        {isCalendarOwnEvent && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(item);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-50 text-red-600 font-medium transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>삭제</span>
          </button>
        )}
      </div>
    </div>
  );
};
