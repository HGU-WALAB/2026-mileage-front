export const ENDPOINT = {
  // mileage
  MILEAGE: `/api/mileage`,
  ETC_MILEAGE: `/api/mileage/etc`,
  // scholarship
  SCHOLARSHIP_APPLY: `/api/mileage/apply`,
  // auth
  AUTH: `/api/mileage/auth`,
  // user
  USER: `/api/mileage/users`,
  // capability
  CAPABILITY: `/api/mileage/capability`,
  // contact
  CONTACT: `/api/mileage/contact`,
  // award
  AWARD: `/api/mileage/award`,
  // maintenance
  MAINTENANCE: `/api/mileage/maintenance`,
  // github
  GITHUB_STATUS: `/api/mileage/github/status`,
  GITHUB_CONNECT: `/api/mileage/github/connect`,
  GITHUB_CALLBACK: `/api/mileage/auth/github/callback`,
  // announcement
  ANNOUNCEMENT: `/api/mileage/announcement`,
  // portfolio (활동 요약)
  PORTFOLIO_TECH_STACK: `/api/portfolio/tech-stack`,
  PORTFOLIO_ACTIVITIES: `/api/portfolio/activities`,
  PORTFOLIO_USER_INFO: `/api/portfolio/user-info`,
  /** GET /api/portfolio/user-info/image/{filename} - filename에 profile_image_url 사용 */
  PORTFOLIO_USER_INFO_IMAGE: `/api/portfolio/user-info/image`,
  PORTFOLIO_REPOSITORIES: `/api/portfolio/repositories`,
  PORTFOLIO_GITHUB_REPOS: `/api/portfolio/github/repos`,
  PORTFOLIO_SETTINGS: `/api/portfolio/settings`,
  PORTFOLIO_MILEAGE: `/api/portfolio/mileage`,
  PORTFOLIO_CV: `/api/portfolio/cv`,
  /** GET /api/portfolio/share/cv/{publicToken}/html — 인증 없이 공개 HTML */
  PORTFOLIO_CV_SHARE: `/api/portfolio/share/cv`,
};
