import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 포트폴리오 레포지토리 한 건 (GET 응답) */
export interface PortfolioRepositoryItem {
  id: number;
  repo_id: number;
  custom_title: string | null;
  description: string;
  is_visible: boolean;
  display_order: number;
}

export interface RepositoriesResponse {
  repositories: PortfolioRepositoryItem[];
}

/** 활동 요약 - 포트폴리오 레포지토리 PUT 요청 한 건 */
export interface PutRepositoryItem {
  repo_id: number;
  custom_title: string | null;
  description: string;
  is_visible: boolean;
}

/** GitHub 레포 목록 한 건 (선택 모달용) */
export interface GitHubRepoItem {
  repo_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  languages: string[];
  /** GitHub 레포 페이지 URL */
  html_url?: string;
}

export interface GitHubReposResponse {
  repos: GitHubRepoItem[];
}

/** GitHub 공개 API 응답 한 건 */
interface GitHubApiRepoItem {
  id: number;
  name: string;
  description: string | null;
  html_url?: string;
  language: string | null;
  created_at: string;
  updated_at: string;
}

const GITHUB_STORAGE_KEY = 'github-storage';

/** 로컬스토리지 github-storage에서 GitHub 사용자명 반환 */
export function getGithubUsernameFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GITHUB_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      state?: { githubName?: string | null };
      githubUsername?: string;
    } | null;
    const name = data?.state?.githubName ?? data?.githubUsername;
    return typeof name === 'string' && name.trim() ? name.trim() : null;
  } catch {
    return null;
  }
}

/** 활동 요약 - 포트폴리오 레포지토리 조회 */
export const getRepositories = async () => {
  const response = await http.get<RepositoriesResponse>(ENDPOINT.PORTFOLIO_REPOSITORIES);
  return response;
};

/** 활동 요약 - 포트폴리오 레포지토리 전체 교체 (PUT) */
export const putRepositories = async (body: PutRepositoryItem[]) => {
  const response = await http.put<PutRepositoryItem[], RepositoriesResponse>(
    ENDPOINT.PORTFOLIO_REPOSITORIES,
    body,
  );
  return response;
};

/** 활동 요약 - 연결된 GitHub 레포 목록 조회 (선택 모달용) */
export const getGitHubRepos = async () => {
  const response = await http.get<GitHubReposResponse>(ENDPOINT.PORTFOLIO_GITHUB_REPOS);
  return response;
};

/**
 * GitHub 공개 API로 사용자 레포 목록 조회 (배포 등 백엔드 404 시 fallback용).
 * GET https://api.github.com/users/{username}/repos
 */
export const fetchGitHubReposByUsername = async (
  username: string,
): Promise<GitHubRepoItem[]> => {
  const params = new URLSearchParams({
    type: 'owner',
    sort: 'updated',
    direction: 'desc',
    per_page: '100',
    page: '1',
  });
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?${params}`,
    { headers: { Accept: 'application/vnd.github.v3+json' } },
  );
  if (!res.ok) return [];
  const raw: GitHubApiRepoItem[] = await res.json();
  return raw.map(r => ({
    repo_id: r.id,
    name: r.name ?? '',
    description: r.description ?? null,
    created_at: r.created_at ?? '',
    updated_at: r.updated_at ?? '',
    languages: r.language ? [r.language] : [],
    html_url: r.html_url ?? `https://github.com/${username}/${r.name ?? ''}`,
  }));
};

/**
 * GitHub 레포 목록 조회. 백엔드는 GET /api/portfolio/repositories 만 제공하므로
 * 상세 정보는 GitHub 공개 API로 조회.
 */
export async function getGitHubReposWithFallback(): Promise<GitHubRepoItem[]> {
  const username = getGithubUsernameFromStorage();
  if (!username) return [];
  return fetchGitHubReposByUsername(username);
}
