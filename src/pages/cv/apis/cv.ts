import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** GET /api/portfolio/cv 목록 한 건 */
export interface PortfolioCvListItem {
  id: number;
  title: string;
  job_posting: string;
  target_position: string;
  additional_notes: string;
  created_at: string;
  updated_at: string;
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
}

export const postPortfolioCvBuildPrompt = async (body: PortfolioCvBuildPromptRequest) => {
  return http.post<PortfolioCvBuildPromptRequest, PortfolioCvBuildPromptResponse>(
    `${ENDPOINT.PORTFOLIO_CV}/build-prompt`,
    body,
  );
};

/** PATCH /api/portfolio/cv/{id} — 서버 스키마상 title은 선택, 4단계에서는 html_content만 전송 */
export interface PortfolioCvPatchRequest {
  title?: string;
  html_content: string;
}

export const patchPortfolioCv = async (id: number, body: PortfolioCvPatchRequest) => {
  return http.patch<PortfolioCvPatchRequest, PortfolioCvDetail>(
    `${ENDPOINT.PORTFOLIO_CV}/${id}`,
    body,
  );
};
