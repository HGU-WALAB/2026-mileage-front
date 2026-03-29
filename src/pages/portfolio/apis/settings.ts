import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

export interface PortfolioSettingsResponse {
  section_order: string[];
}

export interface PortfolioSettingsPutRequest {
  section_order: string[];
}

/** 활동 요약 - 설정 조회 (섹션 순서) */
export const getPortfolioSettings = async () => {
  const response = await http.get<PortfolioSettingsResponse>(ENDPOINT.PORTFOLIO_SETTINGS);
  return response;
};

/** 활동 요약 - 설정 수정 (섹션 순서 변경) */
export const putPortfolioSettings = async (body: PortfolioSettingsPutRequest) => {
  const response = await http.put<PortfolioSettingsPutRequest, PortfolioSettingsResponse>(
    ENDPOINT.PORTFOLIO_SETTINGS,
    body,
  );
  return response;
};
