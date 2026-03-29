import { palette } from '@/styles/palette';

/**
 * 프롬프트 진행도 UI — 트랙(미채움)은 공통, 채움·강조는 섹션별 톤
 */
export type PromptProgressTone =
  | 'overall'
  | 'intro'
  | 'tech'
  | 'repo'
  | 'activities'
  | 'mileage';

export const PROMPT_PROGRESS_TONE_STYLES: Record<
  PromptProgressTone,
  { track: string; fill: string; accent: string; cardTint: string }
> = {
  /** 전체 평균 바 — 단색 */
  overall: {
    track: palette.blue300,
    fill: palette.blue500,
    accent: palette.blue500,
    cardTint: palette.grey100,
  },
  intro: {
    track: palette.blue300,
    fill: palette.purple500,
    accent: palette.purple600,
    cardTint: '#F3F2FF',
  },
  tech: {
    track: palette.blue300,
    fill: palette.green500,
    accent: palette.green600,
    cardTint: '#E8F9F8',
  },
  repo: {
    track: palette.blue300,
    fill: palette.blue600,
    accent: palette.blue700,
    cardTint: '#EEF3FC',
  },
  activities: {
    track: palette.blue300,
    fill: '#C9A227',
    accent: '#B8860B',
    cardTint: '#FFFBEB',
  },
  mileage: {
    track: palette.blue300,
    fill: palette.pink500,
    accent: '#C75B7A',
    cardTint: '#FDF2F5',
  },
};

export const PROGRESS_TONE_BY_SECTION: Record<
  'intro' | 'tech' | 'repo' | 'activities' | 'mileage',
  PromptProgressTone
> = {
  intro: 'intro',
  tech: 'tech',
  repo: 'repo',
  activities: 'activities',
  mileage: 'mileage',
};
