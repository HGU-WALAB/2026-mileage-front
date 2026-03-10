import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

export interface TechStackResponse {
  tech_stack: string[];
}

export interface TechStackPutRequest {
  tech_stack: string[];
}

/** 활동 요약 - 기술 스택 조회 */
export const getTechStack = async () => {
  const response = await http.get<TechStackResponse>(ENDPOINT.PORTFOLIO_TECH_STACK);
  return response;
};

/** 활동 요약 - 기술 스택 수정 */
export const putTechStack = async (body: TechStackPutRequest) => {
  const response = await http.put<unknown>(ENDPOINT.PORTFOLIO_TECH_STACK, body);
  return response;
};
