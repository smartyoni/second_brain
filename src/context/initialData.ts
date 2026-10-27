import {
  TopCategory,
  CategoryGroup,
  CategoryItem,
  SubItem,
  TextGroupData,
  ChecklistGroupData,
  QuickMemo,
} from '../types';

// 초기 5x3 대분류 15개 (1*1은 '퀵메모'로 고정)
export const initialTopCategories: TopCategory[] = [
  { id: 'top-1', name: '퀵메모', index: 0 },
  { id: 'top-2', name: '할일관리', index: 1 },
  { id: 'top-3', name: '앱개발', index: 2 },
  { id: 'top-4', name: '블로그', index: 3 },
  { id: 'top-5', name: '공부', index: 4 },
  { id: 'top-6', name: '계약', index: 5 },
  { id: 'top-7', name: '광고', index: 6 },
  { id: 'top-8', name: '매물원', index: 7 },
  { id: 'top-9', name: '고객', index: 8 },
  { id: 'top-10', name: '용지', index: 9 },
  { id: 'top-11', name: '아파트', index: 10 },
  { id: 'top-12', name: '사무실', index: 11 },
  { id: 'top-13', name: '즐겨찾기', index: 12 },
  { id: 'top-14', name: '웹롤링', index: 13 },
  { id: 'top-15', name: '북마크', index: 14 },
];

export const initialGroups: CategoryGroup[] = [
  { id: 'grp-1', topCategoryId: 'top-3', name: '설정집', isExpanded: true, order: 0 },
  { id: 'grp-2', topCategoryId: 'top-3', name: '구상중인앱', isExpanded: true, order: 1 },
];

export const initialCategories: CategoryItem[] = [
  // 1번 패널: 퀵메모 1개월분 모음 (생성 년월)
  { id: 'cat-qm-202610', topCategoryId: 'top-1', name: '2026년 10월', itemCount: 2, order: 0 },
  { id: 'cat-qm-202609', topCategoryId: 'top-1', name: '2026년 09월', itemCount: 1, order: 1 },

  // 일반 카테고리
  { id: 'cat-1', topCategoryId: 'top-3', groupId: 'grp-1', name: '세컨드 브레인앱', itemCount: 10, order: 0 },
  { id: 'cat-2', topCategoryId: 'top-3', groupId: 'grp-1', name: '디테일설정', itemCount: 8, order: 1 },
  { id: 'cat-3', topCategoryId: 'top-3', groupId: 'grp-1', name: '컴포넌트', itemCount: 4, order: 2 },
  { id: 'cat-4', topCategoryId: 'top-3', groupId: 'grp-1', name: '전역규칙', itemCount: 4, order: 3 },
  { id: 'cat-5', topCategoryId: 'top-3', groupId: 'grp-2', name: '일정관리앱', itemCount: 5, order: 0 },
  { id: 'cat-6', topCategoryId: 'top-3', groupId: 'grp-2', name: '신기계 수정기', itemCount: 4, order: 1 },
];

export const initialSubItems: SubItem[] = [
  // 2번 패널: 퀵메모 한 줄 표시
  { id: 'sub-qm-1', categoryId: 'cat-qm-202610', title: '회의 중 나온 세컨드 브레인 모바일 동기화 아이디어 메모', order: 0 },
  { id: 'sub-qm-2', categoryId: 'cat-qm-202610', title: '다음 주 스프린트 미팅 전 체크리스트 점검 필요', order: 1 },
  { id: 'sub-qm-3', categoryId: 'cat-qm-202609', title: '클라우드 비용 절감 방안 및 아키텍처 구상', order: 0 },

  // 일반 카테고리 하위 문서
  { id: 'sub-1', categoryId: 'cat-4', title: '전역규칙 수정판', order: 0 },
  { id: 'sub-2', categoryId: 'cat-4', title: '00.전역규칙', order: 1 },
  { id: 'sub-3', categoryId: 'cat-4', title: '프로젝트 전용규칙', order: 2 },
  { id: 'sub-4', categoryId: 'cat-4', title: '클로드 추천지침', order: 3 },
  { id: 'sub-5', categoryId: 'cat-2', title: '3점메뉴', order: 0 },
  { id: 'sub-6', categoryId: 'cat-2', title: '확인모달', order: 1 },
  { id: 'sub-7', categoryId: 'cat-2', title: '더블클릭 인라인 텍스트편집', order: 2 },
];

export const initialTextGroups: TextGroupData[] = [
  // 3·4번 패널: 퀵메모 전체 내용 (하나의 텍스트박스로 표시)
  {
    id: 'tg-qm-1',
    subItemId: 'sub-qm-1',
    name: '퀵메모 원본',
    isExpanded: true,
    order: 0,
    blocks: [
      {
        id: 'tb-qm-1',
        text: '회의 중 나온 세컨드 브레인 모바일 동기화 아이디어 메모\n\n1. 모바일 앱 환경에서 오프라인 퀵메모 즉시 저장\n2. 네트워크 복구 시 Firebase 실시간 동기화\n3. 1개월 단위 월별 자동 아카이빙',
        order: 0,
      },
    ],
  },
  {
    id: 'tg-qm-2',
    subItemId: 'sub-qm-2',
    name: '퀵메모 원본',
    isExpanded: true,
    order: 0,
    blocks: [
      {
        id: 'tb-qm-2',
        text: '다음 주 스프린트 미팅 전 체크리스트 점검 필요\n\n- 디자인 시스템 가이드라인 검토\n- 성능 최적화 계획 보고서 작성\n- 담당자 확인: 010-9876-5432',
        order: 0,
      },
    ],
  },
  {
    id: 'tg-qm-3',
    subItemId: 'sub-qm-3',
    name: '퀵메모 원본',
    isExpanded: true,
    order: 0,
    blocks: [
      {
        id: 'tb-qm-3',
        text: '클라우드 비용 절감 방안 및 아키텍처 구상\n\n- 불필요한 인스턴스 정지 및 리전 최적화\n- 캐싱 레이어 도입 검토',
        order: 0,
      },
    ],
  },

  // 일반 카테고리 텍스트 그룹
  {
    id: 'tg-1',
    subItemId: 'sub-1',
    name: '전역규칙 핵심 요약',
    isExpanded: true,
    order: 0,
    blocks: [
      { id: 'tb-1', text: '1. 모든 3점 메뉴는 pr-0 우측 끝에 완전히 밀착 배치한다.', order: 0 },
      { id: 'tb-2', text: '2. 삭제 팝오버는 4px 오프셋 위치 밀착형으로 Enter 키 즉시 실행을 지원한다.', order: 1, dueDate: '2026-10-25' },
      { id: 'tb-3', text: '3. 스마트링크 자동감지: https://github.com 및 010-1234-5678 테스트', order: 2 },
    ],
  },
];

export const initialChecklistGroups: ChecklistGroupData[] = [
  {
    id: 'cg-1',
    subItemId: 'sub-1',
    name: '구현 체크리스트',
    isExpanded: true,
    order: 0,
    items: [
      { id: 'ci-1', text: '4패널 레이아웃 구현 및 활성화 상태 스타일 적용', isCompleted: true, order: 0 },
      { id: 'ci-2', text: '3점 메뉴 우측 끝 밀착 및 팝오버 연동', isCompleted: true, order: 1 },
      { id: 'ci-3', text: '텍스트박스 그룹 및 체크리스트 그룹 화면 분리', isCompleted: false, order: 2, dueDate: '2026-10-20', dueTime: '18:00' },
      { id: 'ci-4', text: '스마트링크 파싱 테스트(010-9876-5432)', isCompleted: false, order: 3, dueDate: '2026-10-22', dueTime: '14:00' },
    ],
  },
];

export const initialQuickMemos: QuickMemo[] = [
  {
    id: 'qm-1',
    content: '회의 중 나온 세컨드 브레인 모바일 동기화 아이디어 메모\n\n1. 모바일 앱 환경에서 오프라인 퀵메모 즉시 저장\n2. 네트워크 복구 시 Firebase 실시간 동기화\n3. 1개월 단위 월별 자동 아카이빙',
    createdAt: '2026-10',
  },
  {
    id: 'qm-2',
    content: '다음 주 스프린트 미팅 전 체크리스트 점검 필요\n\n- 디자인 시스템 가이드라인 검토\n- 성능 최적화 계획 보고서 작성\n- 담당자 확인: 010-9876-5432',
    createdAt: '2026-10',
  },
];
