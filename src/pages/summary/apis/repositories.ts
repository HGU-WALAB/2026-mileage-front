import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 언어별 비율 (GitHub linguist 등) */
export interface PortfolioRepositoryLanguage {
  name: string;
  percentage: number;
}

/** 활동 요약 - 이력서 레포지토리 한 건 (GET/PATCH 응답) */
export interface PortfolioRepositoryItem {
  id: number;
  repo_id: number;
  custom_title: string | null;
  description: string;
  is_visible: boolean;
  display_order: number;
  name: string;
  html_url: string;
  /** 단일 대표 언어(하위 호환). `languages`가 있으면 우선 사용 */
  language?: string;
  languages?: PortfolioRepositoryLanguage[];
  created_at: string;
  updated_at: string;
  visibility: string;
  owner: string;
  commit_count?: number;
  stargazers_count?: number;
  forks_count?: number;
}

/** PATCH /api/portfolio/repositories/:id 요청 body */
export interface PatchRepositoryBody {
  custom_title: string;
  description: string;
  is_visible: boolean;
  display_order: number;
}

export interface RepositoriesResponse {
  repositories: PortfolioRepositoryItem[];
}

/** 활동 요약 - 이력서 레포지토리 PUT 요청 한 건 */
export interface PutRepositoryItem {
  repo_id: number;
  custom_title: string | null;
  description: string;
  is_visible: boolean;
}

export interface GetRepositoriesParams {
  page?: number;
  per_page?: number;
  selected_only?: boolean;
  visible_only?: boolean;
  sort?: string;
  visibility?: string;
  affiliation?: string;
}

/** 활동 요약 - 이력서 레포지토리 조회 (페이지네이션) */
export const getRepositories = async (params?: GetRepositoriesParams) => {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.per_page != null) searchParams.set('per_page', String(params.per_page));
  if (params?.selected_only != null) {
    searchParams.set('selected_only', String(params.selected_only));
  }
  if (params?.visible_only != null) {
    searchParams.set('visible_only', String(params.visible_only));
  }
  if (params?.sort != null) searchParams.set('sort', params.sort);
  if (params?.visibility != null) searchParams.set('visibility', params.visibility);
  if (params?.affiliation != null) searchParams.set('affiliation', params.affiliation);
  const query = searchParams.toString();
  const url = query ? `${ENDPOINT.PORTFOLIO_REPOSITORIES}?${query}` : ENDPOINT.PORTFOLIO_REPOSITORIES;
  const response = await http.get<RepositoriesResponse>(url);
  return response;
};

/** 빈 배열 나올 때까지 모든 페이지 조회 (병렬 배치로 속도 개선) */
export const getAllRepositories = async (
  options: GetRepositoriesParams & { perPage?: number } = {},
): Promise<PortfolioRepositoryItem[]> => {
  const { perPage = 20, ...baseParams } = options;
  const BATCH = 5;

  // 1페이지를 먼저 가져와 데이터가 더 있는지 확인
  const firstRes = await getRepositories({ ...baseParams, page: 1, per_page: perPage });
  const firstList = firstRes.repositories ?? [];
  if (firstList.length < perPage) return firstList;

  const all = [...firstList];
  let startPage = 2;

  for (;;) {
    // BATCH 개 페이지를 병렬로 요청
    const pages = Array.from({ length: BATCH }, (_, i) => startPage + i);
    const results = await Promise.all(
      pages.map(p => getRepositories({ ...baseParams, page: p, per_page: perPage })),
    );

    let done = false;
    for (const res of results) {
      const list = res.repositories ?? [];
      if (list.length === 0) { done = true; break; }
      all.push(...list);
      if (list.length < perPage) { done = true; break; }
    }
    if (done) break;
    startPage += BATCH;
  }

  return all;
};

/** 활동 요약 - 이력서 레포지토리 전체 교체 (PUT) */
export const putRepositories = async (body: PutRepositoryItem[]) => {
  const response = await http.put<PutRepositoryItem[], RepositoriesResponse>(
    ENDPOINT.PORTFOLIO_REPOSITORIES,
    body,
  );
  return response;
};

/** 활동 요약 - 이력서 레포지토리 한 건 수정 (PATCH) */
export const patchRepository = async (
  id: number,
  body: PatchRepositoryBody,
) => {
  const response = await http.patch<
    PatchRepositoryBody,
    PortfolioRepositoryItem
  >(`${ENDPOINT.PORTFOLIO_REPOSITORIES}/${id}`, body);
  return response;
};
