import React from 'react';
import { X, ExternalLink, CheckCircle, Clock, FileText, Trash2, AlignLeft } from 'lucide-react';
import { CalendarScheduleItem, CategoryItem, SubItem } from '../../types';
import { getGoogleCategoryColor } from '../../utils/googleCalendarUtils';
import { useWorkspace } from '../../context/WorkspaceContext';

interface GoogleCalendarEventDialogProps {
  item: CalendarScheduleItem;
  category?: CategoryItem;
  subItem?: SubItem;
  onClose: () => void;
  onToggleComplete: () => void;
  onJumpToSource: () => void;
}

export const GoogleCalendarEventDialog: React.FC<GoogleCalendarEventDialogProps> = ({
  item,
  category,
  subItem,
  onClose,
  onToggleComplete,
  onJumpToSource,
}) => {
  const { deleteCalendarEvent, toggleCalendarEventCompleted } = useWorkspace();
  const color = getGoogleCategoryColor(item.categoryId);
  const isCalendarOwnEvent = item.sourceType === 'calendar';

  const handleDelete = () => {
    if (isCalendarOwnEvent) {
      deleteCalendarEvent(item.id);
      onClose();
    }
  };

  const handleToggle = () => {
    if (isCalendarOwnEvent) {
      toggleCalendarEventCompleted(item.id);
    } else {
      onToggleComplete();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 select-none p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md overflow-hidden"
      >
        {/* 상단 툴바 (구글 캘린더 스타일) */}
        <div className="px-4 py-2.5 bg-white flex items-center justify-end gap-1 border-b border-[#dadce0]/60">
          {isCalendarOwnEvent && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-full hover:bg-red-50 text-[#5f6368] hover:text-red-600 transition-colors cursor-pointer"
              title="일정 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-3.5 h-3.5 rounded-xs mt-1 shrink-0 ${color.bg}`} />
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg font-normal text-[#3c4043] leading-snug break-words ${
                  item.isCompleted ? 'line-through text-[#70757a]' : ''
                }`}
              >
                {item.title}
              </h3>
              <p className="text-xs text-[#70757a] mt-0.5">
                {isCalendarOwnEvent
                  ? '캘린더 일정'
                  : item.sourceType === 'checklist'
                  ? '체크리스트 할 일'
                  : '텍스트 메모'}
              </p>
            </div>
          </div>

          {/* 일시 */}
          <div className="flex items-center gap-4 text-xs text-[#3c4043]">
            <Clock className="w-4 h-4 text-[#5f6368] shrink-0" />
            <span>
              {item.dueDate} {item.dueTime ? `· ${item.dueTime}` : '· 종일'}
            </span>
          </div>

          {/* 소속 카테고리 및 문서 */}
          <div className="flex items-center gap-4 text-xs text-[#3c4043]">
            <FileText className="w-4 h-4 text-[#5f6368] shrink-0" />
            <span className="truncate">
              {category?.name || '기본 카테고리'}
              {subItem && ` > ${subItem.title}`}
            </span>
          </div>

          {/* 상세 설명(메모) */}
          {item.description && (
            <div className="flex items-start gap-4 text-xs text-[#3c4043]">
              <AlignLeft className="w-4 h-4 text-[#5f6368] shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-wrap text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                {item.description}
              </div>
            </div>
          )}
        </div>

        {/* 하단 액션 바 */}
        <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#dadce0] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
              item.isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-[#3c4043] border-[#dadce0] hover:bg-[#f1f3f4]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{item.isCompleted ? '완료 취소' : '완료 체크'}</span>
          </button>

          {!isCalendarOwnEvent && subItem && (
            <button
              type="button"
              onClick={onJumpToSource}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>세컨드브레인 문서에서 열기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
