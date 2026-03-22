import type { ActivityApiItem } from '@/pages/summary/apis/portfolio';

/** display_order 0이 맨 위. category는 사용자 정의 문자열 */
export const mockActivitiesResponse: ActivityApiItem[] = [
  {
    id: 1,
    title: '교내 해커톤 대상',
    description: '소프트웨어 중심대학',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    category: '수상',
    display_order: 0,
  },
  {
    id: 2,
    title: '오픈소스 기여',
    description: '문서 번역 PR',
    start_date: '2024-03-01',
    end_date: '2024-12-31',
    category: '대외활동',
    display_order: 1,
  },
];
