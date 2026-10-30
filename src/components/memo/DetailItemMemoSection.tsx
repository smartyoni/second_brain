import React from 'react';
import { FileText, Calendar, CheckSquare, AlignLeft, Info, Pencil, Check, X } from 'lucide-react';
import { useDetailItemMemo } from '../../hooks/useDetailItemMemo';
import { SmartText } from '../shared/SmartText';

export const DetailItemMemoSection: React.FC = () => {
  const {
    targetItem,
    localMemo,
    isEditing,
    handleStartEdit,
    handleMemoChange,
    handleSave,
    handleCancel,
  } = useDetailItemMemo();

  if (!targetItem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 text-slate-400 select-none text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <FileText className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-600 mb-1">
          선택된 항목이 없습니다.
        </p>
        <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
          3번 패널에서 항목을 클릭하면, 여기에 항목별 세부 메모를 작성할 수 있습니다.
        </p>
      </div>
    );
  }

  const isChecklist = targetItem.type === 'checklist';
  const currentText = isEditing ? localMemo : targetItem.memo;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* 헤더 바 */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex items-center justify-center w-5 h-5 rounded text-white shadow-2xs shrink-0 ${
              isChecklist ? 'bg-blue-600' : 'bg-emerald-600'
            }`}
          >
            {isChecklist ? <CheckSquare className="w-3 h-3" /> : <AlignLeft className="w-3 h-3" />}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-800 truncate">
                <SmartText text={targetItem.title || '(무제 항목)'} />
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-medium shrink-0">
                {isChecklist ? '체크 항목' : '텍스트 블록'}
              </span>
            </div>
            {targetItem.dueDate && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {targetItem.dueDate}
                  {targetItem.endDate ? ` ~ ${targetItem.endDate}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 수정 / 저장·취소 버튼 */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>취소</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>저장</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Pencil className="w-3 h-3 text-slate-500" />
              <span>수정</span>
            </button>
          )}
        </div>
      </div>

      {/* 텍스트 메모 영역 (조회 모드 / 수정 모드) */}
      <div className="flex-1 p-0 m-0 flex flex-col min-h-0">
        {isEditing ? (
          <textarea
            autoFocus
            value={localMemo}
            onChange={(e) => handleMemoChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="이 항목에 대한 추가적인 사항, 진행 내역, 아이디어 등을 자유롭게 기록하세요..."
            className="w-full flex-1 resize-none text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 px-3 py-2 m-0 border-0 rounded-none outline-none font-sans transition-all bg-white"
          />
        ) : (
          <div
            onDoubleClick={handleStartEdit}
            title="더블클릭하거나 상단 [수정] 버튼을 눌러 편집"
            className="w-full flex-1 overflow-y-auto text-xs leading-relaxed text-slate-800 px-3 py-2 m-0 border-0 rounded-none bg-slate-50/40 select-text whitespace-pre-wrap break-words"
          >
            {targetItem.memo ? (
              <SmartText text={targetItem.memo} />
            ) : (
              <span className="text-slate-400">
                등록된 세부 메모가 없습니다. 우측 상단의 [수정] 버튼을 눌러 메모를 작성하세요.
              </span>
            )}
          </div>
        )}
      </div>

      {/* 하단 정보 바 */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 select-none shrink-0">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          {isEditing ? '편집 중 (Ctrl+Enter 저장 / Esc 취소)' : '항목별 전속 메모'}
        </span>
        <span>
          {currentText.length}자 ({currentText ? currentText.split('\n').length : 0}줄)
        </span>
      </div>
    </div>
  );
};
