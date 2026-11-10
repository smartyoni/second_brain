import React, { useState, useMemo } from 'react';
import { CheckSquare, FileText } from 'lucide-react';
import { DetailItemChecklistSection } from '../memo/DetailItemChecklistSection';
import { DetailItemMemoSection } from '../memo/DetailItemMemoSection';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SmartText } from '../shared/SmartText';

export const GanttMemoPanel: React.FC = () => {
  // 기본 화면: 체크리스트, [체크] [텍스트] 순서로 탭 전환
  const [activeTab, setActiveTab] = useState<'check' | 'text'>('check');
  const { selectedDetailItem, checklistGroups, textGroups } = useWorkspace();

  // 현재 선택된 항목의 제목 및 하위 항목 숫자(체크/텍스트) 계산
  const { targetTitle, checkCount, textCount } = useMemo(() => {
    if (!selectedDetailItem) {
      return { targetTitle: '', checkCount: 0, textCount: 0 };
    }
    const { type, groupId, itemId } = selectedDetailItem;

    let title = '';
    let checklistLen = 0;
    let memoText = '';

    if (type === 'checklist') {
      const grp = checklistGroups.find((g) => g.id === groupId);
      const itm = grp?.items.find((i) => i.id === itemId);
      title = itm?.text || '';
      checklistLen = itm?.checklist?.length || 0;
      memoText = itm?.memo || '';
    } else {
      const grp = textGroups.find((g) => g.id === groupId);
      const blk = grp?.blocks.find((b) => b.id === itemId);
      title = blk?.text.split('\n')[0] || grp?.name || '';
      checklistLen = blk?.checklist?.length || 0;
      memoText = blk?.memo || '';
    }

    const hasMemo = memoText.trim().length > 0;

    return {
      targetTitle: title,
      checkCount: checklistLen,
      textCount: hasMemo ? 1 : 0,
    };
  }, [selectedDetailItem, checklistGroups, textGroups]);

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-slate-200 overflow-hidden select-none">
      {/* 4번 패널 상단 헤더: 1·2·3번 패널과 일관된 높이 및 디자인 규격 */}
      <div className="h-11 lg:h-9 px-3 lg:px-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-sm lg:text-xs shrink-0 select-none">
        {/* 체크 / 텍스트 순서의 탭 전환 세그먼트 버튼 (하위 항목 숫자 표기) */}
        <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded text-xs lg:text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('check')}
            className={`flex items-center gap-1 px-2.5 py-1 lg:py-0.5 rounded transition-all cursor-pointer font-medium ${
              activeTab === 'check'
                ? 'bg-white text-blue-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`체크리스트 보기 (${checkCount}개)`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>체크</span>
            <span className="text-[11px] lg:text-[10px] font-normal opacity-85">
              ({checkCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1 px-2.5 py-1 lg:py-0.5 rounded transition-all cursor-pointer font-medium ${
              activeTab === 'text'
                ? 'bg-white text-blue-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`텍스트 세부 메모 보기 (${textCount}개)`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>텍스트</span>
            <span className="text-[11px] lg:text-[10px] font-normal opacity-85">
              ({textCount})
            </span>
          </button>
        </div>

        {/* 우측: 선택된 항목 제목 또는 미선택 안내 */}
        {targetTitle ? (
          <div className="flex items-center gap-1 min-w-0 max-w-[220px] text-xs text-slate-500 truncate pl-2">
            <span className="truncate font-normal">
              <SmartText text={targetTitle} />
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-normal">
            항목 미선택
          </span>
        )}
      </div>

      {/* 4번 패널 본문 영역 (탭에 따라 단일 컴포넌트 100% 렌더링) */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'check' ? (
          <DetailItemChecklistSection />
        ) : (
          <DetailItemMemoSection />
        )}
      </div>
    </div>
  );
};
