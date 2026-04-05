import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import axios from 'axios';

/** 인증 인터셉터(401 시 로그아웃) 없이 공개 엔드포인트만 호출 */
const cvSharePublicClient = axios.create({
  baseURL: BASE_URL,
});

/** GET /api/portfolio/cv 목록 한 건 */
export interface PortfolioCvListItem {
  id: number;
  title: string;
  job_posting: string;
  target_position: string;
  additional_notes: string;
  public_token: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface PortfolioCvListResponse {
  cvs: PortfolioCvListItem[];
}

/** GET /api/portfolio/cv/{id} 상세 */
export interface PortfolioCvDetail extends PortfolioCvListItem {
  prompt: string;
  html_content: string;
}

export const getPortfolioCvList = async () => {
  return http.get<PortfolioCvListResponse>(ENDPOINT.PORTFOLIO_CV);
};

export const getPortfolioCvById = async (id: number) => {
  return http.get<PortfolioCvDetail>(`${ENDPOINT.PORTFOLIO_CV}/${id}`);
};

/** POST /api/portfolio/cv/build-prompt */
export interface PortfolioCvBuildPromptRequest {
  job_posting: string;
  target_position: string;
  additional_notes: string;
  title: string;
  selected_mileage_ids: number[];
  selected_activity_ids: number[];
  selected_repo_ids: number[];
}

export interface PortfolioCvBuildPromptResponse {
  prompt: string;
  cv_id: number;
  public_token: string;
}

export const postPortfolioCvBuildPrompt = async (body: PortfolioCvBuildPromptRequest) => {
  return http.post<PortfolioCvBuildPromptRequest, PortfolioCvBuildPromptResponse>(
    `${ENDPOINT.PORTFOLIO_CV}/build-prompt`,
    body,
  );
};

/** PATCH /api/portfolio/cv/{id} — title·html_content·is_public 각각 선택(부분 갱신 가능) */
export interface PortfolioCvPatchRequest {
  title?: string;
  html_content?: string;
  is_public?: boolean;
}

export const patchPortfolioCv = async (id: number, body: PortfolioCvPatchRequest) => {
  return http.patch<PortfolioCvPatchRequest, PortfolioCvDetail>(
    `${ENDPOINT.PORTFOLIO_CV}/${id}`,
    body,
  );
};

/** DELETE /api/portfolio/cv/{id} */
export const deletePortfolioCv = async (id: number) => {
  return http.delete<void>(`${ENDPOINT.PORTFOLIO_CV}/${id}`);
};

/**
 * GET /api/portfolio/share/cv/{publicToken}/html
 * JWT 없이 호출. 200·204·403·404 는 본 함수에서 예외 없이 구분 반환, 그 외·네트워크 오류는 throw.
 */
export type PortfolioCvShareHtmlResult =
  | { status: 200; html: string }
  | { status: 204 }
  | { status: 403; guidanceHtml: string }
  | { status: 404; guidanceHtml: string };

export const getPortfolioCvShareHtml = async (
  publicToken: string,
): Promise<PortfolioCvShareHtmlResult> => {
  const path = `${ENDPOINT.PORTFOLIO_CV_SHARE}/${encodeURIComponent(publicToken)}/html`;
  const res = await cvSharePublicClient.get<string>(path, {
    responseType: 'text',
    validateStatus: s => [200, 204, 403, 404].includes(s),
  });
  const body = typeof res.data === 'string' ? res.data : '';
  if (res.status === 200) {
    return { status: 200, html: body };
  }
  if (res.status === 204) {
    return { status: 204 };
  }
  if (res.status === 403) {
    return { status: 403, guidanceHtml: body };
  }
  if (res.status === 404) {
    return { status: 404, guidanceHtml: body };
  }
  throw new Error(`Unexpected CV share response: ${res.status}`);
};
