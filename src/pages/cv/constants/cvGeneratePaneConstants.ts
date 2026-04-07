/** 편집·미리보기 패널 공통 높이 (뷰포트에 맞추되 최소·최대 제한) */
export const PROMPT_PANE_HEIGHT = 'clamp(12rem, 50vh, 28rem)';

export const HTML_PANE_HEIGHT = 'clamp(12rem, 45vh, 26rem)';

export const AI_SERVICES = [
  { label: 'ChatGPT', href: 'https://chatgpt.com' },
  { label: 'Claude', href: 'https://claude.ai' },
  { label: 'Gemini', href: 'https://gemini.google.com' },
] as const;

