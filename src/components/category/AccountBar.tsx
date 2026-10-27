import React from 'react';
import { Settings, LogOut, User } from 'lucide-react';

export const AccountBar: React.FC = () => {
  return (
    <div className="h-9 px-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs text-slate-700 shrink-0">
      <div className="flex items-center gap-1.5 truncate">
        <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="truncate font-semibold text-slate-800">관리자 (sin***@gmail.com)</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
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
