import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { buildCvPreviewSrcDoc } from './buildCvPreviewSrcDoc';
import { sanitizeCvHtml } from './sanitizeCvHtml';

/** 약 210mm @ 96dpi — iframe 폭으로 콘텐츠 줄바꿈을 A4 폭에 맞춤 */
const A4_VIEWPORT_WIDTH_PX = 794;

function buildSafePdfFileName(title: string): string {
  const base =
    title
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 80) || 'portfolio';
  return `${base}.pdf`;
}

function waitForIframeLoad(iframe: HTMLIFrameElement, html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => {
      iframe.removeEventListener('load', done);
      resolve();
    };
    iframe.addEventListener('load', done);
    iframe.addEventListener('error', () => {
      iframe.removeEventListener('load', done);
      reject(new Error('iframe_load_failed'));
    });
    iframe.srcdoc = html;
  });
}

/**
 * 정제·미리보기와 동일한 문서로 임시 iframe을 렌더한 뒤 캡처하여 A4 PDF로 저장합니다.
 * (오프스크린 렌더링을 위해 iframe을 화면 밖에 둡니다.)
 */
export async function downloadCvHtmlAsA4Pdf(options: {
  htmlContent: string;
  fileNameBase: string;
}): Promise<void> {
  const { htmlContent, fileNameBase } = options;
  const sanitized = sanitizeCvHtml(htmlContent);
  const srcDoc = buildCvPreviewSrcDoc(sanitized);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'PDF 생성');
  // allow-same-origin 없이 sandbox=""이면 contentDocument 접근 불가(cross-origin 취급)
  // html2canvas가 body 요소를 읽어야 하므로 allow-same-origin 필수.
  // 콘텐츠는 sanitizeCvHtml로 script·이벤트 핸들러가 이미 제거된 상태.
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.setAttribute('referrerPolicy', 'no-referrer');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${A4_VIEWPORT_WIDTH_PX}px`,
    'border:none',
    'visibility:hidden',
    'pointer-events:none',
  ].join(';');

  document.body.appendChild(iframe);

  try {
    await waitForIframeLoad(iframe, srcDoc);
    await new Promise<void>(r => {
      requestAnimationFrame(() => requestAnimationFrame(() => r()));
    });
    await new Promise(r => setTimeout(r, 150));

    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!body) {
      throw new Error('missing_iframe_body');
    }

    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: A4_VIEWPORT_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const marginMm = 10;
    const usableWidthMm = pageWidthMm - marginMm * 2;
    const usableHeightMm = pageHeightMm - marginMm * 2;

    const imgWidthMm = usableWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    let pageIndex = 0;
    for (;;) {
      if (pageIndex > 0) {
        pdf.addPage();
      }
      const yPosMm = marginMm - pageIndex * usableHeightMm;
      pdf.addImage(imgData, 'PNG', marginMm, yPosMm, imgWidthMm, imgHeightMm);
      if ((pageIndex + 1) * usableHeightMm >= imgHeightMm) {
        break;
      }
      pageIndex += 1;
    }

    pdf.save(buildSafePdfFileName(fileNameBase));
  } finally {
    iframe.remove();
  }
}
