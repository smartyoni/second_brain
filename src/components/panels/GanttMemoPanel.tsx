import React, { useState, useMemo, useRef } from 'react';
import { CheckSquare, FileText } from 'lucide-react';
import { DetailItemChecklistSection } from '../memo/DetailItemChecklistSection';
import { DetailItemMemoSection } from '../memo/DetailItemMemoSection';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SmartText } from '../shared/SmartText';
import { getDetailItemSummary } from '../../utils/detailItemSummary';

export const GanttMemoPanel: React.FC = () => {
  // 기본 화면: 체크리스트, [체크] [텍스트] 순서로 탭 전환
  const [activeTab, setActiveTab] = useState<'check' | 'text'>('check');
  const { selectedDetailItem, checklistGroups, textGroups } = useWorkspace();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 모바일/터치 기기 좌우 스와이프 탭 전환 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    // 텍스트/입력 필드 내에서는 커서 조작 보호를 위해 스와이프 전환 비활성화
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      touchStartRef.current = null;
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const SWIPE_THRESHOLD = 45;
    // 수평 스와이프가 수직 스크롤보다 우세하고 임계치(45px)를 넘는 경우 탭 전환
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0 && activeTab === 'check') {
        // 왼쪽으로 스와이프: [체크] -> [텍스트] 이동
        setActiveTab('text');
      } else if (deltaX > 0 && activeTab === 'text') {
        // 오른쪽으로 스와이프: [텍스트] -> [체크] 이동
        setActiveTab('check');
      }
    }
  };

  // 현재 선택된 항목의 제목 및 하위 항목 숫자(체크/텍스트) 계산
  const { targetTitle, checkCount, textCount } = useMemo(
    () => getDetailItemSummary(selectedDetailItem, checklistGroups, textGroups),
    [selectedDetailItem, checklistGroups, textGroups]
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-full w-full bg-white border-l border-slate-200 overflow-hidden select-none"
    >
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

      {/* 4번 패널 본문 영역 (탭에 따라 단일 컴포넌트 100% 렌더링, 부드러운 페이드 전환) */}
      <div
        key={activeTab}
        className="flex-1 overflow-hidden flex flex-col min-h-0 animate-in fade-in duration-150"
      >
        {activeTab === 'check' ? (
          <DetailItemChecklistSection />
        ) : (
          <DetailItemMemoSection />
        )}
      </div>
    </div>
  );
};
