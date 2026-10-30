import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Power } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { FourPanelLayout } from './components/layout/FourPanelLayout';
import { CategoryPanel } from './components/panels/CategoryPanel';
import { SubItemPanel } from './components/panels/SubItemPanel';
import { DetailPanel } from './components/panels/DetailPanel';
import { GanttMemoPanel } from './components/panels/GanttMemoPanel';
import { GoogleCalendarLayout } from './components/googlecalendar/GoogleCalendarLayout';

const AppContent: React.FC = () => {
  const { appMode, setAppMode, mobileStep, setMobileStep } = useWorkspace();
  const [showExitToast, setShowExitToast] = useState(false);

  const navStateRef = useRef({ appMode, mobileStep });
  navStateRef.current = { appMode, mobileStep };

  const lastBackPressRef = useRef<number>(0);
  const toastTimerRef = useRef<number | null>(null);

  const exitApp = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setShowExitToast(false);
    try {
      window.close();
    } catch {}
    if (window.history.length > 1) {
      window.history.go(-window.history.length);
    } else {
      window.history.back();
    }
  };

  const triggerExitConfirm = (fromPopState = false) => {
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      exitApp();
      return;
    }

    lastBackPressRef.current = now;
    setShowExitToast(true);
    if (fromPopState) {
      window.history.pushState({ sbGuard: true }, '');
    }

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setShowExitToast(false);
    }, 2000);
  };

  const handleBackNavigation = (fromPopState = false) => {
    const { appMode: curMode, mobileStep: curStep } = navStateRef.current;

    if (curMode === 'calendar') {
      setAppMode('workspace');
      if (fromPopState) window.history.pushState({ sbGuard: true }, '');
      return;
    }

    if (curStep === 'memo') {
      setMobileStep('detail');
      if (fromPopState) window.history.pushState({ sbGuard: true }, '');
      return;
    }
    if (curStep === 'detail') {
      setMobileStep('subitem');
      if (fromPopState) window.history.pushState({ sbGuard: true }, '');
      return;
    }
    if (curStep === 'subitem') {
      setMobileStep('category');
      if (fromPopState) window.history.pushState({ sbGuard: true }, '');
      return;
    }

    // 최상위 패널(1번 카테고리 패널)인 경우 종료 확인 토스트
    triggerExitConfirm(fromPopState);
  };

  useEffect(() => {
    window.history.pushState({ sbGuard: true }, '');

    const handlePopState = () => {
      handleBackNavigation(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-white">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {appMode === 'calendar' ? (
          <GoogleCalendarLayout />
        ) : (
          <FourPanelLayout
            panel1={<CategoryPanel />}
            panel2={<SubItemPanel />}
            panel3={<DetailPanel panelId="panel-3" />}
            panel4={<GanttMemoPanel />}
          />
        )}
      </div>

      {/* 모바일 전용 하단 푸터 (폰 내비게이션 바 가림 방지를 위해 dvh + safe-area 하단 여백 적용) */}
      <footer className="lg:hidden shrink-0 bg-slate-900 border-t border-slate-700 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] flex items-center gap-2.5 select-none z-40">
        <button
          type="button"
          onClick={() => handleBackNavigation(false)}
          className="flex-1 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300" />
          <span>뒤로가기</span>
        </button>

        <button
          type="button"
          onClick={() => triggerExitConfirm(false)}
          className="flex-1 h-9 rounded-lg bg-red-950/80 hover:bg-red-900 active:bg-red-800 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-800/70 transition-colors cursor-pointer"
        >
          <Power className="w-3.5 h-3.5 text-red-400" />
          <span>앱 종료</span>
        </button>
      </footer>

      {showExitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-slate-900/95 text-white text-xs font-medium rounded-full shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
          한 번 더 누르면 앱이 종료됩니다.
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
};

export default App;
