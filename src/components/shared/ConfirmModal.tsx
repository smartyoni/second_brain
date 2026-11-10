import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = '삭제 확인',
  message = '정말 삭제하시겠습니까?',
  confirmLabel = '삭제',
  cancelLabel = '취소',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 모달 열림 시 확인 버튼에 자동 포커스
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 select-none p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-sm overflow-hidden p-5 space-y-4 animate-in zoom-in-95 duration-100"
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full shrink-0 ${
              isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[#202124]">{title}</h4>
            <p className="text-xs text-[#5f6368] mt-1 whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f3f4]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer text-white ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1a73e8] hover:bg-[#1557b0]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
