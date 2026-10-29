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
  const isRemoteUpdatingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 실시간 동기화 수신 (Firestore -> Local)
  useEffect(() => {
    const docRef = doc(db, 'workspace', 'main');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setIsLoaded(true);
          return;
        }

        const data = snapshot.data();
        if (data) {
          isRemoteUpdatingRef.current = true;
          if (Array.isArray(data.topCategories)) setTopCategories(data.topCategories);
          if (Array.isArray(data.categoryGroups)) setCategoryGroups(data.categoryGroups);
          if (Array.isArray(data.categoryItems)) setCategoryItems(data.categoryItems);
          if (Array.isArray(data.subItems)) setSubItems(data.subItems);
          if (Array.isArray(data.textGroups)) setTextGroups(data.textGroups);
          if (Array.isArray(data.checklistGroups)) setChecklistGroups(data.checklistGroups);
          if (Array.isArray(data.quickMemos)) setQuickMemos(data.quickMemos);
          if (Array.isArray(data.calendarEvents)) setCalendarEvents(data.calendarEvents);

          // React 상태 업데이트 주기 이후 플래그 해제
          setTimeout(() => {
            isRemoteUpdatingRef.current = false;
          }, 100);
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error('Firestore onSnapshot 에러:', error);
        setIsLoaded(true);
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

  // 2. 로컬 변경 사항 Firestore 자동 저장 (Local -> Firestore)
  useEffect(() => {
    // 최초 로드 전이거나 Firestore로부터의 수신 업데이트인 경우 저장 건너뜀
    if (!isLoaded || isRemoteUpdatingRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        const docRef = doc(db, 'workspace', 'main');
        await setDoc(
          docRef,
          {
            topCategories,
            categoryGroups,
            categoryItems,
            subItems,
            textGroups,
            checklistGroups,
            quickMemos,
            calendarEvents,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Firestore 저장 실패:', error);
      } finally {
        setIsSaving(false);
      }
    }, 800);

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

  return { isLoaded, isSaving };
};
