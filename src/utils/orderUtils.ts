import { MoveDirection } from '../components/shared/ThreeDotMenu';

/**
 * 단일 배열 내에서 특정 ID 항목의 위치를 이동(가장 위로 / 가장 아래로 / 위로 / 아래로)하고 order를 재정렬합니다.
 */
export const moveArrayItem = <T extends { id: string; order: number }>(
  list: T[],
  targetId: string,
  direction: MoveDirection
): T[] => {
  const idx = list.findIndex((item) => item.id === targetId);
  if (idx === -1) return list;

  const next = [...list];
  if (direction === 'top') {
    if (idx === 0) return list;
    const [target] = next.splice(idx, 1);
    next.unshift(target);
  } else if (direction === 'bottom') {
    if (idx === next.length - 1) return list;
    const [target] = next.splice(idx, 1);
    next.push(target);
  } else if (direction === 'up') {
    if (idx === 0) return list;
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
  } else if (direction === 'down') {
    if (idx === next.length - 1) return list;
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
  }

  return next.map((item, i) => ({ ...item, order: i }));
};

/**
 * 전체 배열(allItems) 중 특정 조건(scopePredicate)에 해당하는 부분 집합 내에서만 순서를 이동합니다.
 */
export const moveScopedItem = <T extends { id: string; order: number }>(
  allItems: T[],
  scopePredicate: (item: T) => boolean,
  targetId: string,
  direction: MoveDirection
): T[] => {
  const scoped = allItems.filter(scopePredicate);
  const reorderedScoped = moveArrayItem(scoped, targetId, direction);
  if (reorderedScoped === scoped) return allItems;

  let ptr = 0;
  return allItems.map((item) => (scopePredicate(item) ? reorderedScoped[ptr++] : item));
};

/**
 * 체크리스트 배열(미완료 상단 / 완료 하단 유지) 내에서 동일 완료 상태 그룹 안에서 순서를 이동합니다.
 */
export const moveChecklistItem = <
  T extends { id: string; isCompleted: boolean; order: number }
>(
  items: T[],
  targetId: string,
  direction: MoveDirection
): T[] => {
  const target = items.find((i) => i.id === targetId);
  if (!target) return items;

  const incomplete = items.filter((i) => !i.isCompleted);
  const completed = items.filter((i) => i.isCompleted);

  const nextIncomplete = !target.isCompleted
    ? moveArrayItem(incomplete, targetId, direction)
    : incomplete;
  const nextCompleted = target.isCompleted
    ? moveArrayItem(completed, targetId, direction)
    : completed;

  return [...nextIncomplete, ...nextCompleted].map((item, idx) => ({
    ...item,
    order: idx,
  }));
};

/**
 * 체크리스트 항목의 상하 이동 가능 여부(미완료 그룹 / 완료 그룹 내부 기준)를 반환합니다.
 */
export const getChecklistMoveBounds = <
  T extends { id: string; isCompleted: boolean }
>(
  items: T[],
  targetId: string
): { canMoveUp: boolean; canMoveDown: boolean } => {
  const target = items.find((i) => i.id === targetId);
  if (!target) return { canMoveUp: false, canMoveDown: false };

  const sameSection = items.filter((i) => i.isCompleted === target.isCompleted);
  const idx = sameSection.findIndex((i) => i.id === targetId);
  return {
    canMoveUp: idx > 0,
    canMoveDown: idx !== -1 && idx < sameSection.length - 1,
  };
};
