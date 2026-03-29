import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

export interface TechStackItem {
  name: string;
  domain: string;
  level: number;
}

export interface TechStackResponse {
  tech_stack: TechStackItem[];
}

export interface TechStackPutRequest {
  tech_stack: TechStackItem[];
}

export const getTechStack = async () => {
  const response = await http.get<TechStackResponse>(ENDPOINT.PORTFOLIO_TECH_STACK);
  return response;
};

export const putTechStack = async (body: TechStackPutRequest) => {
  const response = await http.put<TechStackResponse>(
    ENDPOINT.PORTFOLIO_TECH_STACK,
    body,
  );
  return response;
};
