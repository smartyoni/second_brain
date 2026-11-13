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
  const activeBorderColor = isProjectTab ? 'border-indigo-600' : 'border-blue-600';

  const handlePanelFocus = (panel: WorkspacePanelId) => {
    setFocusedPanel(panel);
    try {
      localStorage.setItem('sb_focused_panel', panel);
    } catch {}
  };

  // 4번 패널 포커스로 인해 발생할 수 있는 activePanel 오염 방지 (항상 panel-3 유지)
  useEffect(() => {
    if (activePanel === 'panel-4') {
      setActivePanel('panel-3');
    }
  }, [activePanel, setActivePanel]);

  // 전역 Shift+Enter 단축키: 현재 선택된(강조된) 패널에 항목 추가 이벤트 발송
  useEffect(() => {
    const handleGlobalShiftEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey) {
        // 이미 텍스트 입력창(textarea, input)에서 편집 중인 경우 인라인 핸들러(onSaveAndAddNew 등)가 우선 처리하므로 중복 방지
        const activeEl = document.activeElement;
        const isInputField =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable);

        if (isInputField) {
          return;
        }

        // 모달이나 팝오버 등이 열려있는 경우 제외
        const hasOpenModal = document.querySelector('[role="dialog"], .fixed.inset-0:not(.pointer-events-none)');
        if (hasOpenModal) {
          return;
        }

        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent('secondbrain-panel-add-item', {
            detail: { panelId: focusedPanel },
          })
        );
      }
    };

    window.addEventListener('keydown', handleGlobalShiftEnter);
    return () => window.removeEventListener('keydown', handleGlobalShiftEnter);
  }, [focusedPanel]);

  return (
    <div className="h-full w-full overflow-hidden bg-slate-300">
      {/* 1. PC / 태블릿 가로모드 뷰 (1200px 이상 & landscape): 상시 4패널 고정 분할 */}
      <div className="hidden lg:flex h-full w-full divide-x divide-slate-400">
        {/* 1번 패널: 카테고리 패널 (276px의 120% 확장: 331px 고정) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-1')}
          onClickCapture={() => handlePanelFocus('panel-1')}
          onTouchStartCapture={() => handlePanelFocus('panel-1')}
          onFocusCapture={() => handlePanelFocus('panel-1')}
          className="w-[331px] shrink-0 h-full bg-white flex flex-col overflow-hidden relative"
        >
          {focusedPanel === 'panel-1' && (
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
          )}
          {panel1}
        </div>

        {/* 2번 패널: 하위 항목 리스트 패널 (2·3·4번 패널 동일 너비: flex-1 1:1:1 분할) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-2')}
          onClickCapture={() => handlePanelFocus('panel-2')}
          onTouchStartCapture={() => handlePanelFocus('panel-2')}
          onFocusCapture={() => handlePanelFocus('panel-2')}
          className="flex-1 min-w-0 h-full bg-white flex flex-col overflow-hidden relative"
        >
          {focusedPanel === 'panel-2' && (
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
          )}
          {panel2}
        </div>

        {/* 3번 패널: 메인 상세 내용 (2·3·4번 패널 동일 너비: flex-1 1:1:1 분할) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-3')}
          onClickCapture={() => handlePanelFocus('panel-3')}
          onTouchStartCapture={() => handlePanelFocus('panel-3')}
          onFocusCapture={() => handlePanelFocus('panel-3')}
          className="flex-1 min-w-0 h-full bg-white flex flex-col overflow-hidden relative"
        >
          {focusedPanel === 'panel-3' && (
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
          )}
          {panel3}
        </div>

        {/* 4번 패널: 항목 연동 세부 메모 및 체크리스트 (2·3·4번 패널 동일 너비: flex-1 1:1:1 분할) */}
        <div
          onMouseDownCapture={() => handlePanelFocus('panel-4')}
          onClickCapture={() => handlePanelFocus('panel-4')}
          onTouchStartCapture={() => handlePanelFocus('panel-4')}
          onFocusCapture={() => handlePanelFocus('panel-4')}
          className="flex-1 min-w-0 h-full bg-white flex flex-col overflow-hidden relative"
        >
          {focusedPanel === 'panel-4' && (
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
          )}
          {panel4}
        </div>
      </div>

      {/* 2. 모바일 / 태블릿 세로모드 뷰: 1개 패널 순차 드릴다운 네비게이션 */}
      <div className="flex lg:hidden h-full w-full bg-white flex-col overflow-hidden">
        {mobileStep === 'category' && (
          <div className="h-full w-full flex flex-col overflow-hidden relative">
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
            {panel1}
          </div>
        )}

        {mobileStep === 'subitem' && (
          <div className="h-full w-full flex flex-col overflow-hidden relative">
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
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
          <div className="h-full w-full flex flex-col overflow-hidden relative">
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
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
          <div className="h-full w-full flex flex-col overflow-hidden relative">
            <div
              className={`pointer-events-none absolute inset-0 border-2 border-t-4 ${activeBorderColor} z-30 shadow-xs`}
            />
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
