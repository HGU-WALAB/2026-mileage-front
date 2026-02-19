import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import type {
  ActivityApiItem,
  UserInfoResponse,
} from '@/pages/summary/apis/portfolio';
import { mockActivitiesResponse } from '@/mocks/fixtures/portfolioActivities';
import { mockTechStackResponse } from '@/mocks/fixtures/portfolioTechStack';
import { mockUserInfoResponse } from '@/mocks/fixtures/portfolioUserInfo';

const techStackStore = {
  tech_stack: [...mockTechStackResponse.tech_stack],
};

const userInfoStore: UserInfoResponse = { ...mockUserInfoResponse };

const activitiesStore: ActivityApiItem[] = mockActivitiesResponse.map(a => ({
  ...a,
}));
let nextActivityId = Math.max(0, ...activitiesStore.map(a => a.id)) + 1;

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

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_ACTIVITIES, () => {
    const sorted = [...activitiesStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ activities: sorted }, { status: 200 });
  }),

  http.post(BASE_URL + ENDPOINT.PORTFOLIO_ACTIVITIES, async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      description: string;
      start_date: string;
      end_date: string;
    };
    const newItem: ActivityApiItem = {
      id: nextActivityId++,
      title: body.title ?? '',
      description: body.description ?? '',
      start_date: body.start_date ?? '',
      end_date: body.end_date ?? '',
      display_order: activitiesStore.length,
    };
    activitiesStore.push(newItem);
    return HttpResponse.json(newItem, { status: 200 });
  }),

  http.put(
    BASE_URL + `${ENDPOINT.PORTFOLIO_ACTIVITIES}/:id`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as {
        title: string;
        description: string;
        start_date: string;
        end_date: string;
      };
      const idx = activitiesStore.findIndex(a => a.id === id);
      if (idx === -1) {
        return HttpResponse.json({}, { status: 404 });
      }
      activitiesStore[idx] = {
        ...activitiesStore[idx],
        title: body.title ?? activitiesStore[idx].title,
        description: body.description ?? activitiesStore[idx].description,
        start_date: body.start_date ?? activitiesStore[idx].start_date,
        end_date: body.end_date ?? activitiesStore[idx].end_date,
      };
      return HttpResponse.json(activitiesStore[idx], { status: 200 });
    },
  ),

  http.delete(
    BASE_URL + `${ENDPOINT.PORTFOLIO_ACTIVITIES}/:id`,
    ({ params }) => {
      const id = Number(params.id);
      const idx = activitiesStore.findIndex(a => a.id === id);
      if (idx === -1) {
        return HttpResponse.json({}, { status: 404 });
      }
      activitiesStore.splice(idx, 1);
      return HttpResponse.json({}, { status: 200 });
    },
  ),

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_USER_INFO, () => {
    return HttpResponse.json({ ...userInfoStore }, { status: 200 });
  }),

  http.patch(BASE_URL + ENDPOINT.PORTFOLIO_USER_INFO, async ({ request }) => {
    const body = (await request.json()) as { bio: string };
    userInfoStore.bio = body.bio ?? userInfoStore.bio;
    return HttpResponse.json({ ...userInfoStore }, { status: 200 });
  }),
];
