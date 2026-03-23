/**
 * 정제된 HTML을 iframe `srcDoc`용 완전 문서로 감쌉니다.
 * - 조각만 붙여넣은 경우: 기본 타이포·이미지 스타일을 head에 넣어 레이아웃이 무너지지 않게 함
 * - 이미 `<html>`이 있는 경우: DOMPurify를 통과한 문서를 그대로 사용(외부 `<link rel="stylesheet">` 등 유지)
 */
const FRAGMENT_BASE_CSS = `
  body { margin: 0; padding: 0.75rem 1rem; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; line-height: 1.55; color: #1a1a1a; }
  h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.5rem; }
  h2 { font-size: 1.125rem; font-weight: 700; margin: 1rem 0 0.4rem; }
  h3 { font-size: 1rem; font-weight: 700; margin: 0.85rem 0 0.35rem; }
  p { margin: 0 0 0.5rem; }
  ul, ol { margin: 0 0 0.5rem; padding-left: 1.25rem; }
  img { max-width: 100%; height: auto; }
  a { color: #1565c0; }
  table { border-collapse: collapse; max-width: 100%; }
  th, td { border: 1px solid #e0e0e0; padding: 0.25rem 0.4rem; }
`;

export function buildCvPreviewSrcDoc(sanitizedHtml: string): string {
  const t = sanitizedHtml.trim();
  if (!t) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title></title></head><body></body></html>';
  }
  if (/<\s*html[\s>]/i.test(t)) {
    return /<!DOCTYPE/i.test(t) ? t : `<!DOCTYPE html>${t}`;
  }
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${FRAGMENT_BASE_CSS}</style></head><body>${t}</body></html>`;
}
