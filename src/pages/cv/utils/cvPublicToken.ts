/** 공개 토큰: 숫자 8~12자리 (API 스펙) */
const CV_PUBLIC_TOKEN_PATTERN = /^\d{8,12}$/;

export function isCvPublicTokenFormat(token: string): boolean {
  return CV_PUBLIC_TOKEN_PATTERN.test(token.trim());
}
