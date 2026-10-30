import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ConfirmPopover } from './ConfirmPopover';

export type MoveDirection = 'top' | 'bottom' | 'up' | 'down';

export interface MenuItem {
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}

interface ThreeDotMenuProps {
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  deleteTitle?: string;
  customItems?: MenuItem[];
  buttonClassName?: string;
  onMove?: (direction: MoveDirection) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  onEdit,
  onCopy,
  onDelete,
  deleteTitle = '삭제하시겠습니까?',
  customItems,
  buttonClassName,
  onMove,
  canMoveUp = true,
  canMoveDown = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleDeleteClick = () => {
    if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center ml-auto mr-0 pr-0">
      <button
        ref={buttonRef}
        type="button"
        title="더보기"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`p-0.5 rounded transition-colors ${
          buttonClassName || 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
        }`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 z-40 w-28 bg-white border border-slate-300 rounded shadow-md py-0.5 text-[11px]"
        >
          {onMove && (
            <div className="flex items-center justify-between px-1 py-1 border-b border-slate-100">
              <button
                type="button"
                title="가장 위로"
                disabled={!canMoveUp}
                onClick={() => {
                  if (!canMoveUp) return;
                  setIsOpen(false);
                  onMove('top');
                }}
                className={`p-1 rounded transition-colors ${
                  canMoveUp
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <ArrowUpToLine className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="가장 아래로"
                disabled={!canMoveDown}
                onClick={() => {
                  if (!canMoveDown) return;
                  setIsOpen(false);
                  onMove('bottom');
                }}
                className={`p-1 rounded transition-colors ${
                  canMoveDown
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="위로"
                disabled={!canMoveUp}
                onClick={() => {
                  if (!canMoveUp) return;
                  setIsOpen(false);
                  onMove('up');
                }}
                className={`p-1 rounded transition-colors ${
                  canMoveUp
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="아래로"
                disabled={!canMoveDown}
                onClick={() => {
                  if (!canMoveDown) return;
                  setIsOpen(false);
                  onMove('down');
                }}
                className={`p-1 rounded transition-colors ${
                  canMoveDown
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="w-full text-left px-2 py-1 text-slate-700 hover:bg-slate-100"
            >
              수정
            </button>
          )}
          {onCopy && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onCopy();
              }}
              className="w-full text-left px-2 py-1 text-slate-700 hover:bg-slate-100"
            >
              복사
            </button>
          )}
          {customItems?.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              className={`w-full text-left px-2 py-1 ${item.isDanger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {item.label}
            </button>
          ))}
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full text-left px-2 py-1 text-red-600 hover:bg-red-50"
            >
              삭제
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full text-left px-2 py-1 text-slate-400 hover:bg-slate-100 border-t border-slate-100"
          >
            취소
          </button>
        </div>
      )}

      {onDelete && (
        <ConfirmPopover
          isOpen={isConfirmOpen}
          anchorRect={anchorRect}
          title={deleteTitle}
          onConfirm={() => {
            setIsConfirmOpen(false);
            onDelete();
          }}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};
