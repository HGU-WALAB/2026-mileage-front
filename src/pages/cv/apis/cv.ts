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
