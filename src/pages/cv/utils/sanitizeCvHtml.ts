import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/**
 * 외부 AI에서 붙여넣은 HTML에서 스크립트·인라인 이벤트·XSS 위험 요소를 제거합니다.
 * (DOMPurify 기본 프로필 + 위험 태그 추가 차단)
 */
const CONFIG: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base', 'link', 'meta', 'form'],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeCvHtml(dirty: string): string {
  if (typeof dirty !== 'string') return '';
  const t = dirty.trim();
  if (!t) return '';
  const out = DOMPurify.sanitize(t, CONFIG);
  return typeof out === 'string' ? out : String(out);
}
