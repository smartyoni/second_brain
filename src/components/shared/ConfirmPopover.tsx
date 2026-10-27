import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmPopoverProps {
  isOpen: boolean;
  anchorRect: DOMRect | null;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
  isOpen,
  anchorRect,
  title = '삭제하시겠습니까?',
  onConfirm,
  onCancel,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // autoFocus 부여
    confirmBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !anchorRect) return null;

  // 4px 밀착 오프셋 계산 (화면 밖으로 나가지 않도록 조정)
  const top = anchorRect.bottom + 4;
  const left = Math.max(8, Math.min(window.innerWidth - 170, anchorRect.right - 160));

  return createPortal(
    <div
      ref={popoverRef}
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed z-50 w-40 bg-white border border-slate-300 rounded shadow-lg p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <p className="text-slate-700 font-medium mb-2 text-center">{title}</p>
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-[11px]"
        >
          취소
        </button>
        <button
          ref={confirmBtnRef}
          type="button"
          onClick={onConfirm}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] font-medium"
        >
          삭제
        </button>
      </div>
    </div>,
    document.body
  );
};
