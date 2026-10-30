import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    // 모바일 하드웨어/브라우저 뒤로가기 방어용 히스토리 엔트리 추가
    window.history.pushState({ sbGuard: true }, '');

    const handlePopState = () => {
      const { appMode: curMode, mobileStep: curStep } = navStateRef.current;

      // 1. 캘린더 모드에서는 지식보관소로 복귀
      if (curMode === 'calendar') {
        setAppMode('workspace');
        window.history.pushState({ sbGuard: true }, '');
        return;
      }

      // 2. 지식보관소 하위 패널(4번 -> 3번 -> 2번 -> 1번)에서는 상위 패널로 이동
      if (curStep === 'memo') {
        setMobileStep('detail');
        window.history.pushState({ sbGuard: true }, '');
        return;
      }
      if (curStep === 'detail') {
        setMobileStep('subitem');
        window.history.pushState({ sbGuard: true }, '');
        return;
      }
      if (curStep === 'subitem') {
        setMobileStep('category');
        window.history.pushState({ sbGuard: true }, '');
        return;
      }

      // 3. 최상위 패널(1번 카테고리 패널)에서 뒤로가기 입력 시: 2초 내 재입력 확인
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        if (toastTimerRef.current) {
          window.clearTimeout(toastTimerRef.current);
        }
        setShowExitToast(false);
        window.history.back();
        return;
      }

      lastBackPressRef.current = now;
      setShowExitToast(true);
      window.history.pushState({ sbGuard: true }, '');

      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setShowExitToast(false);
      }, 2000);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [setAppMode, setMobileStep]);

  return (
    <>
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

      {showExitToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-slate-900/90 text-white text-xs font-medium rounded-full shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
          뒤로가기 버튼을 한 번 더 누르면 앱이 종료됩니다.
        </div>
      )}
    </>
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
