export const ROUTE_PATH = {
  login: '/',
  dashboard: '/dashboard',
  mileageList: '/mileage',
  newMileage: '/mileage/add',
  scholarship: '/scholarship/apply',
  awardArchive: '/mileage/award',
  portfolio: '/portfolio',
  /** 저장된 포트폴리오 목록·공개 설정 (`CvManagementPanel`) */
  cv: '/cv',
  /** HTML 생성 마법사 (`CvGeneratePage`) */
  cvGenerate: '/cv/generate',
  /** 공개 포폴 미리보기 (로그인 불필요) */
  cvShare: '/cv/share/:publicToken',
  myPage: '/my',
  githubCallback: '/auth/github/callback',
};

/** 예전 링크 호환: 이 쿼리가 있으면 `/cv`로 리다이렉트 */
export const PORTFOLIO_CV_PANEL_QUERY_KEY = 'cvPanel';
export const PORTFOLIO_CV_PANEL_QUERY_VALUE = '1';

/** 공개 포폴 페이지 경로 (`ROUTE_PATH.cvShare`와 동일한 세그먼트) */
export const cvSharePath = (publicToken: string) =>
  `/cv/share/${encodeURIComponent(publicToken)}`;

/** 브라우저 주소창 기준 공개 포폴 전체 URL (`import.meta.env.BASE_URL` 반영) */
export const getCvSharePageUrl = (publicToken: string): string => {
  const path = cvSharePath(publicToken);
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return `${window.location.origin}${base}${path}`;
};

/** 공개 미리보기를 새 탭에서 엽니다. `false`면 팝업 차단 등으로 실패. */
export const openCvShareInNewTab = (publicToken: string): boolean => {
  const url = getCvSharePageUrl(publicToken);
  const win = window.open(url, '_blank');
  if (win) {
    win.opener = null;
    return true;
  }
  return false;
};
