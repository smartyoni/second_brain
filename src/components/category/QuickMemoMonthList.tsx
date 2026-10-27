import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Calendar, ChevronRight } from 'lucide-react';
import { InlineEditableText } from '../shared/InlineEditableText';
import { ThreeDotMenu } from '../shared/ThreeDotMenu';

interface QuickMemoMonthListProps {
  selectedCategoryId: string | null;
  onSelectMonth: (catId: string) => void;
}

export const QuickMemoMonthList: React.FC<QuickMemoMonthListProps> = ({
  selectedCategoryId,
  onSelectMonth,
}) => {
  const {
    categoryItems,
    setCategoryItems,
    subItems,
    setSubItems,
    setTextGroups,
  } = useWorkspace();

  const [editingId, setEditingId] = useState<string | null>(null);

  // 1*1 퀵메모 탭에 속한 1개월분 모음 카테고리 필터링
  const monthCategories = categoryItems.filter((c) => c.topCategoryId === 'top-1');

  const handleDeleteMonth = (catId: string) => {
    // 해당 월 카테고리와 하위 퀵메모 및 텍스트그룹 일괄 정리
    const relatedSubIds = subItems.filter((s) => s.categoryId === catId).map((s) => s.id);
    setCategoryItems((prev) => prev.filter((c) => c.id !== catId));
    setSubItems((prev) => prev.filter((s) => s.categoryId !== catId));
    setTextGroups((prev) => prev.filter((g) => !relatedSubIds.includes(g.subItemId)));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/30 select-none">
      {/* 상단 1개월분 퀵메모 모음 헤더 */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>월별 퀵메모 모음</span>
        </span>
        <span className="text-[11px] text-slate-600 font-semibold">
          총 {monthCategories.length}개월
        </span>
      </div>

      {monthCategories.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-[1.5]" />
          <p className="font-semibold text-slate-600">등록된 퀵메모 모음이 없습니다.</p>
          <p className="text-[11px] text-slate-400 mt-1">상단 퀵메모 버튼으로 첫 메모를 작성해보세요.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {monthCategories.map((month) => {
            const isSelected = month.id === selectedCategoryId;
            const count = subItems.filter((s) => s.categoryId === month.id).length;
            const isEditing = editingId === month.id;

            return (
              <div
                key={month.id}
                onClick={() => onSelectMonth(month.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(month.id);
                }}
                className={`group relative h-9 px-3 flex items-center gap-2 cursor-pointer transition-colors pr-0 ${
                  isSelected
                    ? 'bg-blue-100 text-blue-950 font-bold border-l-4 border-blue-600 shadow-xs'
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <Calendar
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <InlineEditableText
                    value={month.name}
                    isEditing={isEditing}
                    onSave={(newName) => {
                      setCategoryItems((prev) =>
                        prev.map((c) => (c.id === month.id ? { ...c, name: newName } : c))
                      );
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    className="text-xs truncate block font-medium"
                    inputClassName="text-xs h-6 py-0 px-1 font-normal"
                  />
                </div>

                {/* 해당 월에 보관된 퀵메모 개수 뱃지 */}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                    isSelected
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}건
                </span>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
                  }`}
                />

                <ThreeDotMenu
                  onEdit={() => setEditingId(month.id)}
                  onDelete={() => handleDeleteMonth(month.id)}
                  deleteTitle={`'${month.name}' 퀵메모 모음을 삭제하시겠습니까?`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
