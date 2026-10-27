import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FourPanelLayoutProps {
  panel1: React.ReactNode;
  panel2: React.ReactNode;
  panel3: React.ReactNode;
  panel4: React.ReactNode;
}

export const FourPanelLayout: React.FC<FourPanelLayoutProps> = ({
  panel1,
  panel2,
  panel3,
  panel4,
}) => {
  const { mobileStep, setMobileStep } = useWorkspace();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-300">
      {/* 1. PC/태블릿 뷰 (1024px 이상): 상시 4패널 고정 분할 */}
      <div className="hidden lg:flex h-full w-full divide-x divide-slate-400">
        {/* 1번 패널: 카테고리 패널 (너비 345px) */}
        <div className="w-[345px] shrink-0 h-full bg-white flex flex-col overflow-hidden">
          {panel1}
        </div>

        {/* 2번 패널: 하위 항목 리스트 패널 (기존 345px의 130% 확장: 449px) */}
        <div className="w-[449px] shrink-0 h-full bg-white flex flex-col overflow-hidden">
          {panel2}
        </div>

        {/* 3번 패널: 메인 상세 내용 (텍스트/체크 - 2번 패널이 늘어난 만큼 가변 flex-1 축소) */}
        <div className="flex-1 h-full bg-white flex flex-col overflow-hidden relative">
          {panel3}
        </div>

        {/* 4번 패널: 상시 캘린더 패널 (기존의 130% 확장: 468px ~ 494px) */}
        <div className="w-[468px] xl:w-[494px] shrink-0 h-full bg-white flex flex-col overflow-hidden">
          {panel4}
        </div>
      </div>

      {/* 2. 모바일/스마트폰 뷰 (1024px 미만): 1개 패널 순차 드릴다운 네비게이션 */}
      <div className="flex lg:hidden h-full w-full bg-white flex-col overflow-hidden">
        {mobileStep === 'category' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {panel1}
          </div>
        )}

        {mobileStep === 'subitem' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* 뒤로가기 네비게이션 바 */}
            <div className="h-9 px-3 bg-slate-100 border-b border-slate-300 flex items-center gap-2 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setMobileStep('category')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-600"
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
            <div className="h-9 px-3 bg-slate-100 border-b border-slate-300 flex items-center gap-2 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setMobileStep('subitem')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>문서 목록으로</span>
              </button>
            </div>
            {/* 모바일에서는 3번 단일 상세 패널만 표시 */}
            <div className="flex-1 overflow-hidden">{panel3}</div>
          </div>
        )}
      </div>
    </div>
  );
};
