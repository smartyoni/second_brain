import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export type WorkspacePanelId = 'panel-1' | 'panel-2' | 'panel-3' | 'panel-4';

interface FourPanelLayoutProps {
  panel1: React.ReactNode;
  panel2: React.ReactNode;
  panel3: React.ReactNode;
  panel4: React.ReactNode;
}

const loadSavedFocusedPanel = (): WorkspacePanelId => {
  try {
    const saved = localStorage.getItem('sb_focused_panel');
    if (saved === 'panel-1' || saved === 'panel-2' || saved === 'panel-3' || saved === 'panel-4') {
      return saved;
    }
  } catch {}
  return 'panel-2';
};

export const FourPanelLayout: React.FC<FourPanelLayoutProps> = ({
  panel1,
  panel2,
  panel3,
  panel4,
}) => {
  const { mobileStep, setMobileStep, activePanel, setActivePanel, getCurrentActiveState } = useWorkspace();
  const [focusedPanel, setFocusedPanel] = useState<WorkspacePanelId>(loadSavedFocusedPanel);

  const isProjectTab = getCurrentActiveState().topCategoryId === 'top-3';
  const activeRingColor = isProjectTab ? 'ring-indigo-600' : 'ring-blue-600';

  const handlePanelFocus = (panel: WorkspacePanelId) => {
    setFocusedPanel(panel);
    try {
      localStorage.setItem('sb_focused_panel', panel);
    } catch {}

    if (panel === 'panel-3' && activePanel !== 'panel-3') {
      setActivePanel('panel-3');
    } else if (panel === 'panel-4' && activePanel !== 'panel-4') {
      setActivePanel('panel-4');
    }
  };

  // activePanel이 외부에서 변경되면 3·4번 포커스 상태 동기화
  useEffect(() => {
    if (activePanel === 'panel-3' && focusedPanel === 'panel-4') {
      setFocusedPanel('panel-3');
    } else if (activePanel === 'panel-4' && focusedPanel === 'panel-3') {
      setFocusedPanel('panel-4');
    }
  }, [activePanel]);

  return (
    <div className="h-full w-full overflow-hidden bg-slate-300">
      {/* 1. PC / 태블릿 가로모드 뷰 (1200px 이상 & landscape): 상시 4패널 고정 분할 */}
      <div className="hidden lg:flex h-full w-full divide-x divide-slate-400">
        {/* 1번 패널: 카테고리 패널 (276px의 120% 확장: 331px 고정) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-1')}
          onFocusCapture={() => handlePanelFocus('panel-1')}
          className={`w-[331px] shrink-0 h-full bg-white flex flex-col overflow-hidden transition-[box-shadow] duration-150 relative ${
            focusedPanel === 'panel-1'
              ? `ring-2 ring-inset ${activeRingColor} z-10`
              : 'z-0'
          }`}
        >
          {panel1}
        </div>

        {/* 2번 패널: 하위 항목 리스트 패널 (2·3·4번 패널 동일 너비: flex-1 1:1:1 분할) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-2')}
          onFocusCapture={() => handlePanelFocus('panel-2')}
          className={`flex-1 min-w-0 h-full bg-white flex flex-col overflow-hidden transition-[box-shadow] duration-150 relative ${
            focusedPanel === 'panel-2'
              ? `ring-2 ring-inset ${activeRingColor} z-10`
              : 'z-0'
          }`}
        >
          {panel2}
        </div>

        {/* 3번 패널: 메인 상세 내용 (2·3·4번 패널 동일 너비: flex-1 1:1:1 분할) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-3')}
          onFocusCapture={() => handlePanelFocus('panel-3')}
          className={`flex-1 min-w-0 h-full bg-white flex flex-col overflow-hidden relative transition-[box-shadow] duration-150 ${
            focusedPanel === 'panel-3'
              ? `ring-2 ring-inset ${activeRingColor} z-10`
              : 'z-0'
          }`}
        >
          {panel3}
        </div>

        {/* 4번 패널: 항목 연동 세부 메모 및 체크리스트 (2·3·4번 패널 동일 너비: flex-1 1:1:1 분할) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-4')}
          onFocusCapture={() => handlePanelFocus('panel-4')}
          className={`flex-1 min-w-0 h-full bg-white flex flex-col overflow-hidden transition-[box-shadow] duration-150 relative ${
            focusedPanel === 'panel-4'
              ? `ring-2 ring-inset ${activeRingColor} z-10`
              : 'z-0'
          }`}
        >
          {panel4}
        </div>
      </div>

      {/* 2. 모바일 / 태블릿 세로모드 뷰: 1개 패널 순차 드릴다운 네비게이션 */}
      <div className="flex lg:hidden h-full w-full bg-white flex-col overflow-hidden">
        {mobileStep === 'category' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {panel1}
          </div>
        )}

        {mobileStep === 'subitem' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* 뒤로가기 네비게이션 바 */}
            <div className="h-11 px-3.5 bg-slate-100 border-b border-slate-300 flex items-center gap-2 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setMobileStep('category')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-blue-600 active:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>카테고리 목록으로</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{panel2}</div>
          </div>
        )}

        {mobileStep === 'detail' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* 뒤로가기 네비게이션 바 */}
            <div className="h-11 px-3.5 bg-slate-100 border-b border-slate-300 flex items-center gap-2 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setMobileStep('subitem')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-blue-600 active:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>문서 목록으로</span>
              </button>
            </div>
            {/* 모바일에서는 3번 단일 상세 패널만 표시 */}
            <div className="flex-1 overflow-hidden">{panel3}</div>
          </div>
        )}

        {mobileStep === 'memo' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* 뒤로가기 네비게이션 바 */}
            <div className="h-11 px-3.5 bg-slate-100 border-b border-slate-300 flex items-center gap-2 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setMobileStep('detail')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-blue-600 active:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>상세 항목으로</span>
              </button>
            </div>
            {/* 모바일 4번 패널: 항목 세부 메모 및 체크리스트 */}
            <div className="flex-1 overflow-hidden">{panel4}</div>
          </div>
        )}
      </div>
    </div>
  );
};
