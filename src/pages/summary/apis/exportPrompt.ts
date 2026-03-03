import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 프롬프트 문자열 내보내기 */
export const getExportPrompt = async () => {
  const response = await http.get<string>(ENDPOINT.PORTFOLIO_EXPORT_PROMPT, {
    responseType: 'text',
  });
  return response;
};

