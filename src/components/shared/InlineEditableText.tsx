import React, { useState, useRef, useEffect } from 'react';
import { SmartText } from './SmartText';

interface InlineEditableTextProps {
  value: string;
  isEditing: boolean;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  isEditing,
  onSave,
  onCancel,
  placeholder = '',
  className = '',
  inputClassName = '',
}) => {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(draft.trim() || value || placeholder);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraft(value);
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(draft.trim() || value || placeholder);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-800 outline-none shadow-inner ${inputClassName}`}
      />
    );
  }

  return (
    <span className={`truncate ${className}`}>
      {value ? (
        <SmartText text={value} />
      ) : (
        <span className="opacity-60 italic">{placeholder || '(제목 없음)'}</span>
      )}
    </span>
  );
};
