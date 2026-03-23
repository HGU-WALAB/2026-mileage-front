import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/**
 * 외부 AI에서 붙여넣은 HTML에서 스크립트·인라인 이벤트·XSS 위험 요소를 제거합니다.
 * `<link rel="stylesheet" href="https://...">` 는 미리보기·인쇄용으로만 허용(훅에서 검증).
 */
const CONFIG: Config = {
  USE_PROFILES: { html: true },
  /**
   * false면 `<head>`·`<style>`·`<link>` 가 직렬화에서 통째로 빠지고 body HTML만 반환됨.
   * 전체 문서(인라인 CSS 포함)를 유지하려면 true 필수.
   */
  WHOLE_DOCUMENT: true,
  /** `link` 제외: 스타일시트·폰트 preconnect는 유지. 그 외 link는 훅에서 제거 */
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base', 'meta', 'form'],
  ALLOW_DATA_ATTR: false,
};

let cvPurifyHooksInstalled = false;

function ensureCvPurifyHooks(): void {
  if (cvPurifyHooksInstalled) return;
  cvPurifyHooksInstalled = true;
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'link') return;
    const el = node as Element;
    const relRaw = el.getAttribute('rel') ?? '';
    const relTokens = relRaw
      .toLowerCase()
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    const href = (el.getAttribute('href') ?? '').trim();
    const asAttr = (el.getAttribute('as') ?? '').toLowerCase();
    const https = /^https:\/\//i.test(href);
    const isStylesheet =
      relTokens.includes('stylesheet') ||
      (relTokens.includes('preload') && asAttr === 'style');
    const isFontHint =
      https &&
      (relTokens.includes('preconnect') ||
        relTokens.includes('dns-prefetch'));
    if (isFontHint) return;
    if (!isStylesheet || !https) {
      el.remove();
    }
  });
}

export function sanitizeCvHtml(dirty: string): string {
  if (typeof dirty !== 'string') return '';
  const t = dirty.trim();
  if (!t) return '';
  ensureCvPurifyHooks();
  const out = DOMPurify.sanitize(t, CONFIG);
  return typeof out === 'string' ? out : String(out);
}
