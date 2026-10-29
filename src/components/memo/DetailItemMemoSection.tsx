import React from 'react';
import { FileText, CheckCircle2, Calendar, CheckSquare, AlignLeft, Info } from 'lucide-react';
import { useDetailItemMemo } from '../../hooks/useDetailItemMemo';

export const DetailItemMemoSection: React.FC = () => {
  const { targetItem, localMemo, isSaved, handleMemoChange } = useDetailItemMemo();

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
          3번 패널이나 하단 간트차트에서 항목을 클릭하면, 여기에 항목별 세부 메모를 작성할 수 있습니다.
        </p>
      </div>
    );
  }

  const isChecklist = targetItem.type === 'checklist';

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* 헤더 바 */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
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
                {targetItem.title || '(무제 항목)'}
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

        {/* 저장 상태 */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>{isSaved ? '자동 저장됨' : '저장 중...'}</span>
        </div>
      </div>

      {/* 텍스트 메모 작성 영역 */}
      <div className="flex-1 p-3 flex flex-col min-h-0">
        <textarea
          value={localMemo}
          onChange={(e) => handleMemoChange(e.target.value)}
          placeholder="이 항목에 대한 추가적인 사항, 진행 내역, 아이디어 등을 자유롭게 기록하세요..."
          className="w-full flex-1 resize-none text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 p-2.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 font-sans transition-all"
        />
      </div>

      {/* 하단 정보 바 */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 select-none shrink-0">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          항목별 전속 메모
        </span>
        <span>
          {localMemo.length}자 ({localMemo.split('\n').length}줄)
        </span>
      </div>
    </div>
  );
};
