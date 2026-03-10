import type { ActivityApiItem } from '@/pages/summary/apis/portfolio';

/** display_order 0이 맨 위. 활동 섹션은 category === 0 만 표시 */
export const mockActivitiesResponse: ActivityApiItem[] = [
  {
    id: 1,
    title: '교내 해커톤 대상',
    description: '소프트웨어 중심대학',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    category: 0,
    display_order: 0,
  },
];
