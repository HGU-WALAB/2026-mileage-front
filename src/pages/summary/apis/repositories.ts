import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 포트폴리오 레포지토리 한 건 (GET/PATCH 응답) */
export interface PortfolioRepositoryItem {
  id: number;
  repo_id: number;
  custom_title: string | null;
  description: string;
  is_visible: boolean;
  display_order: number;
  name: string;
  html_url: string;
  language: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  owner: string;
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

/** 활동 요약 - 포트폴리오 레포지토리 PUT 요청 한 건 */
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

/** 활동 요약 - 포트폴리오 레포지토리 조회 (페이지네이션) */
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

/** 빈 배열 나올 때까지 모든 페이지 조회 */
export const getAllRepositories = async (
  perPage = 20,
): Promise<PortfolioRepositoryItem[]> => {
  const all: PortfolioRepositoryItem[] = [];
  let page = 1;
  for (;;) {
    const res = await getRepositories({ page, per_page: perPage });
    const list = res.repositories ?? [];
    if (list.length === 0) break;
    all.push(...list);
    if (list.length < perPage) break;
    page += 1;
  }
  return all;
};

/** 활동 요약 - 포트폴리오 레포지토리 전체 교체 (PUT) */
export const putRepositories = async (body: PutRepositoryItem[]) => {
  const response = await http.put<PutRepositoryItem[], RepositoriesResponse>(
    ENDPOINT.PORTFOLIO_REPOSITORIES,
    body,
  );
  return response;
};

/** 활동 요약 - 포트폴리오 레포지토리 한 건 수정 (PATCH) */
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
