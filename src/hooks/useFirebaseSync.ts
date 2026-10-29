import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  TopCategory,
  CategoryGroup,
  CategoryItem,
  SubItem,
  TextGroupData,
  ChecklistGroupData,
  QuickMemo,
  CalendarEvent,
} from '../types';
import { initialTopCategories } from '../context/initialData';

interface FirebaseSyncProps {
  topCategories: TopCategory[];
  setTopCategories: React.Dispatch<React.SetStateAction<TopCategory[]>>;
  categoryGroups: CategoryGroup[];
  setCategoryGroups: React.Dispatch<React.SetStateAction<CategoryGroup[]>>;
  categoryItems: CategoryItem[];
  setCategoryItems: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  subItems: SubItem[];
  setSubItems: React.Dispatch<React.SetStateAction<SubItem[]>>;
  textGroups: TextGroupData[];
  setTextGroups: React.Dispatch<React.SetStateAction<TextGroupData[]>>;
  checklistGroups: ChecklistGroupData[];
  setChecklistGroups: React.Dispatch<React.SetStateAction<ChecklistGroupData[]>>;
  quickMemos: QuickMemo[];
  setQuickMemos: React.Dispatch<React.SetStateAction<QuickMemo[]>>;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

interface WorkspacePayload {
  topCategories: TopCategory[];
  categoryGroups: CategoryGroup[];
  categoryItems: CategoryItem[];
  subItems: SubItem[];
  textGroups: TextGroupData[];
  checklistGroups: ChecklistGroupData[];
  quickMemos: QuickMemo[];
  calendarEvents: CalendarEvent[];
}

interface CachedWorkspace {
  payload: WorkspacePayload;
  updatedAt: string;
  pendingSync: boolean;
}

const CACHE_KEY = 'sb_workspace_cache_v2';
const LEGACY_KEYS = [
  'sb_top_categories',
  'sb_category_groups',
  'sb_category_items',
  'sb_sub_items',
  'sb_text_groups',
  'sb_checklist_groups',
  'sb_quick_memos',
  'sb_calendar_events',
  'sb_panel3_state',
  'sb_panel4_state',
];

const sanitizePayload = (payload: WorkspacePayload): WorkspacePayload =>
  JSON.parse(JSON.stringify(payload));

export const useFirebaseSync = ({
  topCategories,
  setTopCategories,
  categoryGroups,
  setCategoryGroups,
  categoryItems,
  setCategoryItems,
  subItems,
  setSubItems,
  textGroups,
  setTextGroups,
  checklistGroups,
  setChecklistGroups,
  quickMemos,
  setQuickMemos,
  calendarEvents,
  setCalendarEvents,
}: FirebaseSyncProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const lastSyncedJsonRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const applyPayloadToState = (payload: WorkspacePayload) => {
    setTopCategories(payload.topCategories);
    setCategoryGroups(payload.categoryGroups);
    setCategoryItems(payload.categoryItems);
    setSubItems(payload.subItems);
    setTextGroups(payload.textGroups);
    setChecklistGroups(payload.checklistGroups);
    setQuickMemos(payload.quickMemos);
    setCalendarEvents(payload.calendarEvents);
  };

  // 1. 초기 캐시 복원 및 Firestore 실시간 동기화 수신 (Firestore -> Local)
  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      const rawCache = localStorage.getItem(CACHE_KEY);
      if (rawCache) {
        const cached: CachedWorkspace = JSON.parse(rawCache);
        if (cached?.payload) {
          applyPayloadToState(cached.payload);
          if (!cached.pendingSync) {
            lastSyncedJsonRef.current = JSON.stringify(cached.payload);
          }
        }
      }
    } catch (e) {
      console.error('로컬 캐시 복원 오류:', e);
    }

    const docRef = doc(db, 'workspace', 'main');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setSyncError(null);
        if (!snapshot.exists()) {
          setIsLoaded(true);
          return;
        }

        const data = snapshot.data();
        if (data) {
          const remotePayload = sanitizePayload({
            topCategories:
              Array.isArray(data.topCategories) && data.topCategories.length > 0
                ? data.topCategories
                : initialTopCategories,
            categoryGroups: Array.isArray(data.categoryGroups) ? data.categoryGroups : [],
            categoryItems: Array.isArray(data.categoryItems) ? data.categoryItems : [],
            subItems: Array.isArray(data.subItems) ? data.subItems : [],
            textGroups: Array.isArray(data.textGroups) ? data.textGroups : [],
            checklistGroups: Array.isArray(data.checklistGroups) ? data.checklistGroups : [],
            quickMemos: Array.isArray(data.quickMemos) ? data.quickMemos : [],
            calendarEvents: Array.isArray(data.calendarEvents) ? data.calendarEvents : [],
          });

          const remoteUpdatedAt = typeof data.updatedAt === 'string' ? data.updatedAt : '';

          // 새로고침 직전 미전송(pendingSync) 로컬 변경본이 더 최신이면 로컬 변경본 유지 후 업로드 유도
          try {
            const rawCache = localStorage.getItem(CACHE_KEY);
            if (rawCache) {
              const cached: CachedWorkspace = JSON.parse(rawCache);
              if (cached?.pendingSync && cached.updatedAt > remoteUpdatedAt) {
                lastSyncedJsonRef.current = JSON.stringify(remotePayload);
                applyPayloadToState(cached.payload);
                setIsLoaded(true);
                return;
              }
            }
          } catch {}

          const remoteJson = JSON.stringify(remotePayload);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                payload: remotePayload,
                updatedAt: remoteUpdatedAt || new Date().toISOString(),
                pendingSync: false,
              })
            );
          } catch {}

          if (remoteJson !== lastSyncedJsonRef.current) {
            lastSyncedJsonRef.current = remoteJson;
            applyPayloadToState(remotePayload);
          }
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error('Firestore onSnapshot 에러:', error);
        setSyncError('클라우드 연결 오류');
      }
    );

    return () => unsubscribe();
  }, [
    setTopCategories,
    setCategoryGroups,
    setCategoryItems,
    setSubItems,
    setTextGroups,
    setChecklistGroups,
    setQuickMemos,
    setCalendarEvents,
  ]);

  // 2. 로컬 변경 사항 즉시 캐시 백업 및 Firestore 자동 저장 (Local -> Firestore)
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const cleanPayload = sanitizePayload({
      topCategories,
      categoryGroups,
      categoryItems,
      subItems,
      textGroups,
      checklistGroups,
      quickMemos,
      calendarEvents,
    });
    const currentJson = JSON.stringify(cleanPayload);

    // Firestore에서 방금 수신한 상태와 동일하면 저장 건너뜀
    if (currentJson === lastSyncedJsonRef.current) {
      return;
    }

    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          payload: cleanPayload,
          updatedAt: nowIso,
          pendingSync: true,
        })
      );
    } catch {}

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSyncError(null);
        lastSyncedJsonRef.current = currentJson;
        const docRef = doc(db, 'workspace', 'main');
        await setDoc(
          docRef,
          {
            ...cleanPayload,
            updatedAt: nowIso,
          },
          { merge: true }
        );
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              payload: cleanPayload,
              updatedAt: nowIso,
              pendingSync: false,
            })
          );
        } catch {}
      } catch (error) {
        console.error('Firestore 저장 실패:', error);
        lastSyncedJsonRef.current = '';
        setSyncError('저장 실패');
      } finally {
        setIsSaving(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    isLoaded,
    topCategories,
    categoryGroups,
    categoryItems,
    subItems,
    textGroups,
    checklistGroups,
    quickMemos,
    calendarEvents,
  ]);

  return { isLoaded, isSaving, syncError };
};
