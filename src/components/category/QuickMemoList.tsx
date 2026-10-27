import React, { useState } from 'react';
import { QuickMemo, QuickMemoSegment } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Trash2, ArrowRight, Clock, Plus } from 'lucide-react';
import { SmartText } from '../shared/SmartText';

interface QuickMemoListProps {
  activeSegment: QuickMemoSegment;
  onOpenModal: () => void;
}

export const QuickMemoList: React.FC<QuickMemoListProps> = ({
  activeSegment,
  onOpenModal,
}) => {
  const {
    quickMemos,
    deleteQuickMemo,
    categoryItems,
    addSubItem,
  } = useWorkspace();

  // 이동 모드에서 특정 메모의 대상 카테고리 선택 상태
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [targetCatId, setTargetCatId] = useState<string>('');

  // 퀵메모를 일반 카테고리의 텍스트그룹 항목으로 이동(변환)
  const handleMoveMemo = (memo: QuickMemo, targetCategoryId: string) => {
    if (!targetCategoryId) return;

    // 해당 카테고리에 subItem 등록
    addSubItem(targetCategoryId);
    // 메모 삭제
    deleteQuickMemo(memo.id);
    setSelectedMemoId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-slate-50/50">
      {/* 이동 모드 시 상단 안내 배너 */}
      {activeSegment === 'move' && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-normal">
          <p className="font-semibold mb-0.5">📌 퀵메모 이동 모드</p>
          <p className="text-[11px] text-blue-600">
            임시 보관된 메모를 원하는 카테고리로 정리하여 영구 보관 문서로 전환할 수 있습니다.
          </p>
        </div>
      )}

      {quickMemos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <Clock className="w-10 h-10 mb-3 stroke-[1.5] text-slate-300" />
          <p className="text-xs font-medium text-slate-600 mb-1">보관된 퀵메모가 없습니다</p>
          <p className="text-[11px] text-slate-400 mb-4">떠오르는 생각이나 정보를 빠르게 기록해보세요.</p>
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 퀵메모 작성</span>
          </button>
        </div>
      ) : (
        quickMemos.map((memo) => {
          const isMoving = selectedMemoId === memo.id;

          return (
            <div
              key={memo.id}
              className={`p-3 bg-white rounded-xl border transition-all shadow-xs ${
                isMoving ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {memo.createdAt}
                </span>

                <div className="flex items-center gap-1">
                  {activeSegment === 'move' && (
                    <button
                      type="button"
                      onClick={() => setSelectedMemoId(isMoving ? null : memo.id)}
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-0.5 cursor-pointer ${
                        isMoving
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      <ArrowRight className="w-3 h-3" />
                      이동
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteQuickMemo(memo.id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="메모 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 메모 본문 내용 */}
              <div className="text-xs text-slate-800 whitespace-pre-wrap break-words leading-relaxed font-normal">
                <SmartText text={memo.content} />
              </div>

              {/* 이동 모드 대상 선택기 */}
              {isMoving && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center gap-1.5">
                  <select
                    value={targetCatId}
                    onChange={(e) => setTargetCatId(e.target.value)}
                    className="flex-1 text-[11px] bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none text-slate-700"
                  >
                    <option value="">이동할 카테고리 선택...</option>
                    {categoryItems.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleMoveMemo(memo, targetCatId)}
                    disabled={!targetCatId}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-medium rounded cursor-pointer transition-colors"
                  >
                    완료
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
