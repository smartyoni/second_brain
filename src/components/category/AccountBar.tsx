import React from 'react';
import { Settings, LogOut, User, Cloud, AlertCircle, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AccountBar: React.FC = () => {
  const { isLoaded, isSaving, syncError } = useWorkspace();

  return (
    <div className="h-9 px-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs text-slate-700 shrink-0">
      <div className="flex items-center gap-1.5 truncate">
        <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="truncate font-semibold text-slate-800">관리자 (sin***@gmail.com)</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {syncError ? (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[10px] font-medium">
            <AlertCircle className="w-3 h-3" />
            {syncError}
          </span>
        ) : isSaving || !isLoaded ? (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {!isLoaded ? '연결 중' : '저장 중'}
          </span>
        ) : (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
            <Cloud className="w-3 h-3" />
            동기화됨
          </span>
        )}
        <button
          type="button"
          title="설정"
          className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="로그아웃"
          className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
