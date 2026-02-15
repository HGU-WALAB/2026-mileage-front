import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { mockTechStackResponse } from '@/mocks/fixtures/portfolioTechStack';

const techStackStore = {
  tech_stack: [...mockTechStackResponse.tech_stack],
};

/** 401/500 랜덤 반환 없이 항상 성공. (개발 시 불필요한 로그아웃·passthrough 방지) */
export const PortfolioHandlers = [
  http.get(BASE_URL + ENDPOINT.PORTFOLIO_TECH_STACK, () => {
    return HttpResponse.json(
      { tech_stack: techStackStore.tech_stack },
      { status: 200 },
    );
  }),

  http.put(BASE_URL + ENDPOINT.PORTFOLIO_TECH_STACK, async ({ request }) => {
    const body = (await request.json()) as { tech_stack: string[] };
    techStackStore.tech_stack = body.tech_stack ?? [];

    return HttpResponse.json({}, { status: 200 });
  }),
];
