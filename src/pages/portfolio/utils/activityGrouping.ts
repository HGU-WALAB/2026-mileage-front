import type { ActivityItem } from '../types/portfolioItems';

/** 카테고리 문자열 기준 그룹. 구간 내에서는 display_order 순 */
export function groupActivitiesByCategory(
  items: ActivityItem[],
): [string, ActivityItem[]][] {
  const map = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const cat = item.category.trim() || '기타';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  for (const [, arr] of map) {
    arr.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === '기타') return 1;
    if (b[0] === '기타') return -1;
    return a[0].localeCompare(b[0], 'ko');
  });
}
