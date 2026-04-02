import type { UserInfoResponse } from '../apis/userInfo';
import type { PortfolioRepositoryLanguage } from '../apis/repositories';

export interface RepoItem {
  /** PATCH /api/portfolio/repositories/:id 시 사용. API가 null 반환 시 없을 수 있음 */
  id?: number;
  repo_id: number;
  custom_title: string | null;
  is_visible: boolean;
  display_order?: number;
  name: string;
  owner?: string;
  description: string;
  created_at: string;
  updated_at: string;
  /** 마크다운 등에 쓰는 언어 이름 목록 */
  languages: string[];
  /** 카드 UI: 언어별 비율 표시용 */
  languageBreakdown?: PortfolioRepositoryLanguage[];
  commit_count?: number;
  stargazers_count?: number;
  forks_count?: number;
  /** GitHub 레포 페이지 URL (제목 클릭 시 이동) */
  html_url?: string;
}

export interface MileageItem {
  /** 포트폴리오 마일리지 항목 id (PUT /api/portfolio/mileage/{id}용) */
  id?: number;
  mileage_id: number;
  semester: string;
  category: string;
  item: string;
  additional_info: string;
  is_visible: boolean;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  /** 사용자 정의 카테고리 문자열 */
  category: string;
  /** API 응답용. 0이 맨 위. 로컬 추가분은 없을 수 있음 */
  display_order?: number;
  /** 관련 링크 */
  url: string;
  /** 태그 목록 */
  tags: string[];
}

export type UserInfo = UserInfoResponse;

