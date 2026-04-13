/**
 * 편집 페이지 섹션 키. `user_info` 는 상단 고정 블록이라 아래 순서 배열에는 포함하지 않습니다.
 */
export type SectionOrderKey =
  | 'user_info'
  | 'tech'
  | 'repo'
  | 'mileage'
  | 'activities';

/** `user_info` 제외 — 기술 스택·레포·활동·마일리지 카드 섹션 */
export type DraggableSectionKey = Exclude<SectionOrderKey, 'user_info'>;

/** 프롬프트 품질 대시보드 미니카드 → 스크롤 대상 섹션 */
export type PortfolioPromptQualityCardKey =
  | 'intro'
  | DraggableSectionKey;

/** 편집/미리보기 페이지에서 섹션 앵커 `id` (카드 클릭 시 scrollIntoView) */
export const PORTFOLIO_SECTION_ELEMENT_ID: Record<
  PortfolioPromptQualityCardKey,
  string
> = {
  intro: 'portfolio-section-intro',
  tech: 'portfolio-section-tech',
  repo: 'portfolio-section-repo',
  mileage: 'portfolio-section-mileage',
  activities: 'portfolio-section-activities',
};

/** 내 활동 관리 편집 화면에서 섹션 카드 표시 순서 (고정) */
export const DRAGGABLE_SECTION_ORDER: DraggableSectionKey[] = [
  'tech',
  'repo',
  'mileage',
  'activities',
];

export const SECTION_TITLES: Record<SectionOrderKey, string> = {
  user_info: '유저정보',
  tech: '기술 스택',
  repo: '깃허브 레포지토리',
  mileage: '마일리지 ( SW중심대학 인증 )',
  activities: '활동',
};
