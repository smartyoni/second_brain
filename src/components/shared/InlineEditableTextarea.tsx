import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface InlineEditableTextareaProps {
  value: string;
  isEditing: boolean;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  rows?: number;
  placeholder?: string;
  saveOnEnter?: boolean; // true면 Enter 즉시 저장(Shift+Enter 줄바꿈), false면 Ctrl+Enter 저장(Enter 줄바꿈)
  className?: string;
  textareaClassName?: string;
}

export const InlineEditableTextarea: React.FC<InlineEditableTextareaProps> = ({
  value,
  isEditing,
  onSave,
  onCancel,
  rows = 3,
  placeholder = '',
  saveOnEnter = false,
  className = '',
  textareaClassName = '',
}) => {
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isActionRef = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setDraft(value);
      onCancel();
    } else if (saveOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onSave(draft);
    } else if (!saveOnEnter && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      onSave(draft);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (isActionRef.current) {
      isActionRef.current = false;
      return;
    }
    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('.inline-edit-action-btn')) {
      return;
    }
    onSave(draft);
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-1.5 w-full ${className}`}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={rows}
        placeholder={placeholder}
        className={`w-full text-xs text-slate-800 bg-white border border-blue-500 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500 font-sans shadow-inner resize-y leading-relaxed ${textareaClassName}`}
      />
      <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 px-0.5">
        <span className="text-[10px] text-slate-600">
          {saveOnEnter ? 'Enter 저장 · Shift+Enter 줄바꿈 · Esc 취소' : 'Ctrl+Enter 저장 · Enter 줄바꿈 · Esc 취소'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="inline-edit-action-btn px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded text-xs transition-colors cursor-pointer"
            onMouseDown={(e) => {
              isActionRef.current = true;
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setDraft(value);
              onCancel();
            }}
          >
            취소
          </button>
          <button
            type="button"
            className="inline-edit-action-btn inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-xs"
            onMouseDown={(e) => {
              isActionRef.current = true;
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSave(draft);
            }}
          >
            <Check className="w-3 h-3" />
            <span>완료</span>
          </button>
        </div>
      </div>
    </div>
  );
};
