import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { ConfirmPopover } from './ConfirmPopover';

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
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  onEdit,
  onCopy,
  onDelete,
  deleteTitle = '삭제하시겠습니까?',
  customItems,
  buttonClassName,
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

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
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
          className="absolute right-0 top-full mt-1 z-40 w-24 bg-white border border-slate-300 rounded shadow-md py-0.5 text-[11px]"
        >
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
