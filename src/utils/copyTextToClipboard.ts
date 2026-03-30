/**
 * `document.execCommand('copy')` 는 클릭과 같은 [사용자 제스처](https://developer.chrome.com/blog/user-activation)가
 * 살아 있는 **동기** 호출에서만 안정적으로 동작하는 경우가 많습니다.
 * Clipboard API를 먼저 `await` 하면 제스처가 끊겨 폴백까지 실패할 수 있어, 임시 textarea 복사를 먼저 시도합니다.
 *
 * `navigator.clipboard` 는 [보안 컨텍스트](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
 * (HTTPS, localhost)에서만 의미가 있으며, 위 방법이 실패한 뒤에 보조로 사용합니다.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const copyViaTemporaryTextarea = (): boolean => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.setAttribute('aria-hidden', 'true');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  if (copyViaTemporaryTextarea()) {
    return true;
  }

  if (window.isSecureContext && typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
