import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calendar, FolderKanban, PenLine, ArrowRightLeft, Home } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { getTodayDateStr } from './utils/calendarUtils';
import { FourPanelLayout } from './components/layout/FourPanelLayout';
import { CategoryPanel } from './components/panels/CategoryPanel';
import { SubItemPanel } from './components/panels/SubItemPanel';
import { DetailPanel } from './components/panels/DetailPanel';
import { GanttMemoPanel } from './components/panels/GanttMemoPanel';
import { ProjectTaskPanel } from './components/project/ProjectTaskPanel';
import { ProjectDetailPanel } from './components/project/ProjectDetailPanel';
import { ProjectTimelinePanel } from './components/project/ProjectTimelinePanel';
import { GoogleCalendarLayout } from './components/googlecalendar/GoogleCalendarLayout';
import { QuickMemoModal } from './components/category/QuickMemoModal';

const AppContent: React.FC = () => {
  const {
    appMode,
    setAppMode,
    mobileStep,
    setMobileStep,
    addQuickMemo,
    selectTopCategory,
    setSelectedCalendarDate,
    getCurrentActiveState,
  } = useWorkspace();
  const [showExitToast, setShowExitToast] = useState(false);
  const [isQuickMemoOpen, setIsQuickMemoOpen] = useState(false);

  const isProjectTab = getCurrentActiveState().topCategoryId === 'top-3';

  const handleQuickMove = () => {
    setAppMode('workspace');
    selectTopCategory('top-1');
    setMobileStep('category');
  };

  const handleHomeNavigation = () => {
    if (appMode === 'workspace') {
      // 지식보관소 모드: 현재 선택된 카테고리/대분류 유지한 채 1번 패널(카테고리 목록)로 복귀
      setMobileStep('category');
    } else {
      // 캘린더 모드: 당일 일간뷰로 이동
      setSelectedCalendarDate(getTodayDateStr());
      window.dispatchEvent(new CustomEvent('calendar-go-today-day'));
    }
  };

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
            panel2={isProjectTab ? <ProjectTaskPanel /> : <SubItemPanel />}
            panel3={
              isProjectTab ? (
                <ProjectDetailPanel />
              ) : (
                <DetailPanel panelId="panel-3" />
              )
            }
            panel4={
              isProjectTab ? (
                <ProjectTimelinePanel />
              ) : (
                <GanttMemoPanel />
              )
            }
          />
        )}
      </div>

      {/* 모바일 전용 하단 컨트롤 바 */}
      <footer className="lg:hidden shrink-0 bg-slate-900 border-t border-slate-700 px-2.5 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] flex items-center gap-1.5 select-none z-40">
        {/* 1. 퀵이동 버튼 */}
        <button
          type="button"
          onClick={handleQuickMove}
          className="flex-1 h-9 rounded-lg bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1 border border-teal-600 transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-teal-100" />
          <span>퀵이동</span>
        </button>

        {/* 2. 퀵메모 버튼 */}
        <button
          type="button"
          onClick={() => setIsQuickMemoOpen(true)}
          className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 border border-emerald-500 transition-colors cursor-pointer"
        >
          <PenLine className="w-3.5 h-3.5 text-emerald-100" />
          <span>퀵메모</span>
        </button>

        {/* 3. 지식보관소 / 캘린더 모드 전환 버튼 */}
        <button
          type="button"
          onClick={() => setAppMode(appMode === 'calendar' ? 'workspace' : 'calendar')}
          className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 border border-blue-500 transition-colors cursor-pointer"
        >
          {appMode === 'calendar' ? (
            <>
              <FolderKanban className="w-3.5 h-3.5 text-blue-100" />
              <span>지식보관소</span>
            </>
          ) : (
            <>
              <Calendar className="w-3.5 h-3.5 text-blue-100" />
              <span>캘린더</span>
            </>
          )}
        </button>

        {/* 4. 홈 버튼: 뒤로가기 바로 좌측, 동일 크기(w-10 h-9) */}
        <button
          type="button"
          onClick={handleHomeNavigation}
          className="w-10 h-9 shrink-0 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
          title={appMode === 'workspace' ? '1번 패널(카테고리 목록)로 이동' : '당일 일간뷰로 이동'}
        >
          <Home className="w-4 h-4 text-slate-200" />
        </button>

        {/* 5. 뒤로가기 버튼: 가장 우측에 고정, 크기는 약 1/4로 축소, 텍스트 없이 화살표 기호로 표시 */}
        <button
          type="button"
          onClick={() => handleBackNavigation(false)}
          className="w-10 h-9 shrink-0 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
          title="뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 text-slate-200" />
        </button>
      </footer>

      <QuickMemoModal
        isOpen={isQuickMemoOpen}
        onClose={() => setIsQuickMemoOpen(false)}
        onSave={addQuickMemo}
      />

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
