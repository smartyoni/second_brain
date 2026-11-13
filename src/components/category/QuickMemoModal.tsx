import React, { useState, useEffect, useRef } from 'react';

interface QuickMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}

export const QuickMemoModal: React.FC<QuickMemoModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      // 모달이 열릴 때 자동 포커스
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);

      // 모바일 키보드 및 뷰포트 높이 감지
      const updateHeight = () => {
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        setAvailableHeight(vh);
      };

      updateHeight();
      const vv = window.visualViewport;
      if (vv) {
        vv.addEventListener('resize', updateHeight);
      }
      window.addEventListener('resize', updateHeight);

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        if (vv) {
          vv.removeEventListener('resize', updateHeight);
        }
        window.removeEventListener('resize', updateHeight);
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  // 모바일 여부 확인 (sm 기준 640px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  // 모바일에서는 키보드를 가리지 않도록 상단 여백(16px) 및 하단 여백(16px)을 제외한 가용 높이로 제한
  const dynamicMaxHeight = availableHeight
    ? `${Math.max(180, availableHeight - (isMobile ? 24 : 40))}px`
    : isMobile
      ? 'calc(100dvh - 24px)'
      : '90vh';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-0 sm:items-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-[520px] max-w-[95vw] h-[480px] flex flex-col justify-between border border-slate-300 transform transition-all select-none sm:my-auto"
        style={{ maxHeight: dynamicMaxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 본문 입력 영역 */}
        <div className="flex-1 flex flex-col min-h-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메모할 내용을 자유롭게 입력하세요.."
            className="w-full flex-1 min-h-0 resize-none border-none outline-none focus:outline-none focus:ring-0 text-sm text-slate-700 leading-relaxed placeholder:text-slate-400 p-0"
          />
        </div>

        {/* 하단 우측 버튼 영역 */}
        <div className="flex items-center justify-end gap-2 pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
