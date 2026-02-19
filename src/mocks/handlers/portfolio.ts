import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import type {
  ActivityApiItem,
  PortfolioRepositoryItem,
  PutRepositoryItem,
  UserInfoResponse,
} from '@/pages/summary/apis/portfolio';
import { DRAGGABLE_SECTION_ORDER } from '@/pages/summary/constants/constants';
import { mockActivitiesResponse } from '@/mocks/fixtures/portfolioActivities';
import { mockGitHubRepos } from '@/mocks/fixtures/portfolioGithubRepos';
import { mockPortfolioRepositories } from '@/mocks/fixtures/portfolioRepositories';
import { mockTechStackResponse } from '@/mocks/fixtures/portfolioTechStack';
import { mockUserInfoResponse } from '@/mocks/fixtures/portfolioUserInfo';

const techStackStore = {
  tech_stack: [...mockTechStackResponse.tech_stack],
};

const settingsStore: { section_order: string[] } = {
  section_order: [...DRAGGABLE_SECTION_ORDER],
};

const userInfoStore: UserInfoResponse = { ...mockUserInfoResponse };

const activitiesStore: ActivityApiItem[] = mockActivitiesResponse.map(a => ({
  ...a,
}));
let nextActivityId = Math.max(0, ...activitiesStore.map(a => a.id)) + 1;

const repositoriesStore: PortfolioRepositoryItem[] = mockPortfolioRepositories.map(
  r => ({ ...r }),
);
let nextRepoId = Math.max(0, ...repositoriesStore.map(r => r.id)) + 1;

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

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_SETTINGS, () => {
    return HttpResponse.json(
      { section_order: [...settingsStore.section_order] },
      { status: 200 },
    );
  }),

  http.put(BASE_URL + ENDPOINT.PORTFOLIO_SETTINGS, async ({ request }) => {
    const body = (await request.json()) as { section_order: string[] };
    settingsStore.section_order = Array.isArray(body.section_order)
      ? [...body.section_order]
      : [...DRAGGABLE_SECTION_ORDER];
    return HttpResponse.json(
      { section_order: [...settingsStore.section_order] },
      { status: 200 },
    );
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

  http.get(
    BASE_URL + `${ENDPOINT.PORTFOLIO_USER_INFO_IMAGE}/:filename`,
    () => {
      const minimalPng = Uint8Array.from(
        atob(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        ),
        c => c.charCodeAt(0),
      );
      return new HttpResponse(new Blob([minimalPng], { type: 'image/png' }), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });
    },
  ),

  http.patch(BASE_URL + ENDPOINT.PORTFOLIO_USER_INFO, async ({ request }) => {
    const url = new URL(request.url);
    const bioParam = url.searchParams.get('bio');
    if (bioParam !== null) {
      userInfoStore.bio = bioParam;
    }
    const contentType = request.headers.get('Content-Type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        const profileImage = formData.get('profile_image');
        if (profileImage instanceof File && profileImage.name) {
          userInfoStore.profile_image_url = profileImage.name;
        }
      } catch {
        // ignore formData parse
      }
    } else {
      try {
        const body = (await request.json()) as { bio?: string };
        if (body.bio !== undefined) {
          userInfoStore.bio = body.bio;
        }
      } catch {
        // ignore json parse
      }
    }
    return HttpResponse.json({ ...userInfoStore }, { status: 200 });
  }),

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_REPOSITORIES, () => {
    const sorted = [...repositoriesStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ repositories: sorted }, { status: 200 });
  }),

  http.put(BASE_URL + ENDPOINT.PORTFOLIO_REPOSITORIES, async ({ request }) => {
    const body = (await request.json()) as PutRepositoryItem[];
    repositoriesStore.length = 0;
    body.forEach((item, index) => {
      repositoriesStore.push({
        id: nextRepoId++,
        repo_id: item.repo_id,
        custom_title: item.custom_title ?? null,
        description: item.description ?? '',
        is_visible: item.is_visible ?? true,
        display_order: index,
      });
    });
    const sorted = [...repositoriesStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ repositories: sorted }, { status: 200 });
  }),

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_GITHUB_REPOS, () => {
    return HttpResponse.json({ repos: [...mockGitHubRepos] }, { status: 200 });
  }),
];
