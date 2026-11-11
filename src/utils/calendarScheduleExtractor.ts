import {
  CalendarScheduleItem,
  ChecklistGroupData,
  TextGroupData,
  SubItem,
  CategoryItem,
  CalendarEvent,
} from '../types';

export const SUBCHECK_SCHEDULE_COLOR_ID = 'basil'; // 하위할일 일정 전용 고정 녹색 (구글 캘린더 바질 그린)

interface ExtractScheduleParams {
  checklistGroups: ChecklistGroupData[];
  textGroups: TextGroupData[];
  calendarEvents: CalendarEvent[];
  subItems: SubItem[];
  categoryItems: CategoryItem[];
}

export const extractAllScheduleItems = ({
  checklistGroups,
  textGroups,
  calendarEvents,
  subItems,
  categoryItems,
}: ExtractScheduleParams): CalendarScheduleItem[] => {
  const list: CalendarScheduleItem[] = [];

  // 1. 체크리스트 그룹 항목들 수집
  checklistGroups.forEach((group) => {
    const subItem = subItems.find((s) => s.id === group.subItemId);
    const category = subItem ? categoryItems.find((c) => c.id === subItem.categoryId) : null;

    group.items.forEach((item) => {
      // 상위 일정 자체 수집
      if (item.dueDate) {
        list.push({
          id: item.id,
          title: item.text,
          dueDate: item.dueDate,
          dueTime: item.dueTime,
          endDate: item.endDate,
          memo: item.memo,
          isCompleted: item.isCompleted,
          isInProgress: item.isInProgress,
          sourceType: 'checklist',
          subItemId: group.subItemId,
          groupId: group.id,
          categoryId: item.colorId || category?.id || '',
          topCategoryId: category?.topCategoryId || '',
          checklist: item.checklist || [],
        });
      }

      // 상위 할일이 완료되지 않은 경우에만 하위할일 일정을 캘린더에 표시 (녹색 고정)
      if (!item.isCompleted && item.checklist) {
        item.checklist.forEach((sub) => {
          if (sub.dueDate) {
            list.push({
              id: sub.id,
              title: sub.text,
              dueDate: sub.dueDate,
              dueTime: sub.dueTime,
              endDate: sub.endDate,
              isCompleted: sub.isCompleted,
              sourceType: 'subcheck',
              subItemId: group.subItemId,
              groupId: group.id,
              categoryId: SUBCHECK_SCHEDULE_COLOR_ID,
              topCategoryId: category?.topCategoryId || '',
              parentItemId: item.id,
              parentItemTitle: item.text,
            });
          }
        });
      }
    });
  });

  // 2. 텍스트 그룹 블록들 수집
  textGroups.forEach((group) => {
    const subItem = subItems.find((s) => s.id === group.subItemId);
    const category = subItem ? categoryItems.find((c) => c.id === subItem.categoryId) : null;

    group.blocks.forEach((block) => {
      const firstLine = block.text.split('\n')[0].trim();

      // 상위 텍스트 일정 자체 수집
      if (block.dueDate) {
        list.push({
          id: block.id,
          title: firstLine || group.name,
          dueDate: block.dueDate,
          dueTime: block.dueTime,
          endDate: block.endDate,
          memo: block.memo,
          isCompleted: block.isCompleted,
          isInProgress: block.isInProgress,
          sourceType: 'text',
          subItemId: group.subItemId,
          groupId: group.id,
          categoryId: block.colorId || category?.id || '',
          topCategoryId: category?.topCategoryId || '',
          checklist: block.checklist || [],
        });
      }

      // 상위 블록이 완료되지 않은 경우에만 하위할일 일정을 캘린더에 표시 (녹색 고정)
      if (!block.isCompleted && block.checklist) {
        block.checklist.forEach((sub) => {
          if (sub.dueDate) {
            list.push({
              id: sub.id,
              title: sub.text,
              dueDate: sub.dueDate,
              dueTime: sub.dueTime,
              endDate: sub.endDate,
              isCompleted: sub.isCompleted,
              sourceType: 'subcheck',
              subItemId: group.subItemId,
              groupId: group.id,
              categoryId: SUBCHECK_SCHEDULE_COLOR_ID,
              topCategoryId: category?.topCategoryId || '',
              parentItemId: block.id,
              parentItemTitle: firstLine || group.name,
            });
          }
        });
      }
    });
  });

  // 3. 캘린더 자체 독립 일정들 수집
  calendarEvents.forEach((evt) => {
    const category = categoryItems.find((c) => c.id === evt.categoryId);

    // 상위 일정 자체 수집
    list.push({
      id: evt.id,
      title: evt.title,
      dueDate: evt.dueDate,
      dueTime: evt.dueTime,
      endDate: evt.endDate,
      endTime: evt.endTime,
      isCompleted: evt.isCompleted,
      isInProgress: evt.isInProgress,
      sourceType: 'calendar',
      subItemId: '',
      groupId: '',
      categoryId: evt.categoryId || categoryItems[0]?.id || '',
      topCategoryId: category?.topCategoryId || '',
      description: evt.description,
      checklist: evt.checklist || [],
    });

    // 상위 일정이 완료되지 않은 경우에만 하위할일 일정을 캘린더에 표시 (녹색 고정)
    if (!evt.isCompleted && evt.checklist) {
      evt.checklist.forEach((sub) => {
        if (sub.dueDate) {
          list.push({
            id: sub.id,
            title: sub.text,
            dueDate: sub.dueDate,
            dueTime: sub.dueTime,
            endDate: sub.endDate,
            isCompleted: sub.isCompleted,
            sourceType: 'subcheck',
            subItemId: '',
            groupId: '',
            categoryId: SUBCHECK_SCHEDULE_COLOR_ID,
            topCategoryId: category?.topCategoryId || '',
            parentItemId: evt.id,
            parentItemTitle: evt.title,
          });
        }
      });
    }
  });

  return list.sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));
};
