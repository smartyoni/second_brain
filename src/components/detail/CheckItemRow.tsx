import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckSquare, Square } from 'lucide-react';
import { CheckItem } from '../../types';
import { SmartText } from '../shared/SmartText';
import { ThreeDotMenu } from '../shared/ThreeDotMenu';
import { InlineEditableTextarea } from '../shared/InlineEditableTextarea';
import { useWorkspace } from '../../context/WorkspaceContext';

interface CheckItemRowProps {
  item: CheckItem;
  groupId: string;
  onToggleComplete: (groupId: string, itemId: string) => void;
  onUpdateText: (groupId: string, itemId: string, text: string) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
  onOpenSchedule: (itemId: string) => void;
}

export const CheckItemRow: React.FC<CheckItemRowProps> = ({
  item,
  groupId,
  onToggleComplete,
  onUpdateText,
  onDeleteItem,
  onOpenSchedule,
}) => {
  const { setSelectedCalendarDate } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = (newText: string) => {
    onUpdateText(groupId, item.id, newText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div
      onClick={() => {
        if (!isEditing && item.dueDate) {
          setSelectedCalendarDate(item.dueDate);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
      className={`p-2.5 hover:bg-slate-50 transition-colors group select-text text-xs border-b border-slate-100 last:border-b-0 ${
        item.dueDate ? 'cursor-pointer hover:bg-blue-50/30' : ''
      }`}
      title={
        !isEditing
          ? item.dueDate
            ? `더블클릭: 인라인 편집 | 클릭: 등록된 일정(${item.dueDate})으로 이동`
            : '더블클릭하여 내용 수정'
          : undefined
      }
    >
      {isEditing ? (
        <InlineEditableTextarea
          value={item.text}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          rows={2}
          saveOnEnter={true}
          placeholder="(체크 항목을 입력하세요)"
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(groupId, item.id);
              }}
              className="mt-0.5 text-slate-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              {item.isCompleted ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <div
              className={`flex-1 whitespace-pre-wrap leading-relaxed ${
                item.isCompleted
                  ? 'line-through text-slate-400'
                  : 'text-slate-800'
              }`}
            >
              <SmartText text={item.text} />
            </div>

            {/* 날짜 뱃지: 클릭 시 4번 패널 캘린더의 해당 일정 날짜로 즉시 이동 */}
            {item.dueDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCalendarDate(item.dueDate!);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 hover:bg-blue-200 active:bg-blue-300 text-blue-700 border border-blue-300 shrink-0 font-semibold cursor-pointer transition-colors shadow-2xs"
                title={`클릭 시 캘린더의 등록된 일정(${item.dueDate})으로 이동`}
              >
                <CalendarIcon className="w-3 h-3 text-blue-600" />
                <span>{item.dueDate.slice(5)}</span>
                {item.dueTime && <span>{item.dueTime}</span>}
              </button>
            )}
          </div>

          <ThreeDotMenu
            onEdit={() => setIsEditing(true)}
            onCopy={() => copyToClipboard(item.text)}
            onDelete={() => onDeleteItem(groupId, item.id)}
            deleteTitle="이 체크 항목을 삭제하시겠습니까?"
            customItems={[
              ...(item.dueDate
                ? [
                    {
                      label: '📅 캘린더 일정으로 이동',
                      onClick: () => setSelectedCalendarDate(item.dueDate!),
                    },
                  ]
                : []),
              {
                label: item.dueDate ? '📅 일정 수정/해제' : '📅 일정 등록',
                onClick: () => onOpenSchedule(item.id),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
