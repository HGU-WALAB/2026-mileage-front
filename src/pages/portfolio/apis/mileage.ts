import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 포트폴리오 마일리지 한 건 (GET/PUT 응답) */
export interface PortfolioMileageItem {
  id: number;
  mileage_id: number;
  additional_info: string;
  display_order: number;
  subitemId: number;
  subitemName: string;
  categoryId: number;
  categoryName: string;
  semester: string;
  description1: string;
}

export interface PortfolioMileageResponse {
  mileage: PortfolioMileageItem[];
}

export interface PutPortfolioMileageItem {
  mileage_id: number;
  additional_info: string;
}

/** 활동 요약 - 포트폴리오 마일리지 조회 */
export const getPortfolioMileage = async () => {
  const response = await http.get<PortfolioMileageResponse>(ENDPOINT.PORTFOLIO_MILEAGE);
  return response;
};

/** 활동 요약 - 포트폴리오 마일리지 전체 교체 (PUT) */
export const putPortfolioMileage = async (body: PutPortfolioMileageItem[]) => {
  const response = await http.put<PutPortfolioMileageItem[], PortfolioMileageResponse>(
    ENDPOINT.PORTFOLIO_MILEAGE,
    body,
  );
  return response;
};

/** 활동 요약 - 포트폴리오 마일리지 한 건 추가 설명 수정 (id는 portfolio 항목 id) */
export const putPortfolioMileageItem = async (
  id: number,
  body: { additional_info: string },
) => {
  const response = await http.put<{ additional_info: string }, PortfolioMileageItem>(
    `${ENDPOINT.PORTFOLIO_MILEAGE}/${id}`,
    body,
  );
  return response;
};
