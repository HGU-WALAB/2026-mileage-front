/**
 * 섹션 순서 키. 추후 PUT /api/portfolio/settings 의 section_order 와 연동 예정.
 * user_info 는 추후 상단 고정 처리 시 제외할 수 있음.
 */
export type SectionOrderKey =
  | 'user_info'
  | 'tech_stack'
  | 'repo'
  | 'mileage'
  | 'activities';

export const DEFAULT_SECTION_ORDER: SectionOrderKey[] = [
  'user_info',
  'tech_stack',
  'repo',
  'mileage',
  'activities',
];

export const SECTION_TITLES: Record<SectionOrderKey, string> = {
  user_info: '유저정보',
  tech_stack: '기술 스택',
  repo: '깃허브 레포지토리',
  mileage: '마일리지 정보',
  activities: '활동',
};
