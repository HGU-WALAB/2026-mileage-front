import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import type {
  ActivityApiItem,
  PortfolioMileageItem,
  PortfolioRepositoryItem,
  PutPortfolioMileageItem,
  PutRepositoryItem,
  UserInfoResponse,
} from '@/pages/summary/apis/portfolio';
import type { TechStackItem } from '@/pages/summary/apis/portfolio';
import type { PatchRepositoryBody } from '@/pages/summary/apis/repositories';
import { DRAGGABLE_SECTION_ORDER } from '@/pages/summary/constants/constants';
import { mockActivitiesResponse } from '@/mocks/fixtures/portfolioActivities';
import { mockMileageList } from '@/mocks/fixtures/mileageList';
import { mockPortfolioMileage } from '@/mocks/fixtures/portfolioMileage';
import { mockPortfolioRepositories } from '@/mocks/fixtures/portfolioRepositories';
import { mockTechStackResponse } from '@/mocks/fixtures/portfolioTechStack';
import { mockPortfolioCvDetails } from '@/mocks/fixtures/portfolioCv';
import { mockUserInfoResponse } from '@/mocks/fixtures/portfolioUserInfo';
import type { PortfolioCvDetail } from '@/pages/cv/apis/cv';

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

const mileageStore: PortfolioMileageItem[] = mockPortfolioMileage.map(m => ({
  ...m,
}));
let nextMileageId = Math.max(0, ...mileageStore.map(m => m.id)) + 1;

const cvStore: PortfolioCvDetail[] = mockPortfolioCvDetails.map(c => ({ ...c }));

function buildPortfolioMileageItem(
  id: number,
  displayOrder: number,
  putItem: PutPortfolioMileageItem,
): PortfolioMileageItem | null {
  const ref = mockMileageList.find(
    m => (m.mileage_id ?? m.subitemId) === putItem.mileage_id,
  );
  if (!ref) return null;
  return {
    id,
    mileage_id: putItem.mileage_id,
    additional_info: putItem.additional_info ?? '',
    display_order: displayOrder,
    subitemId: ref.subitemId,
    subitemName: ref.subitemName,
    categoryId: ref.categoryId,
    categoryName: ref.categoryName,
    semester: ref.semester,
    description1: ref.description1 ?? '',
  };
}

/** 401/500 랜덤 반환 없이 항상 성공. (개발 시 불필요한 로그아웃·passthrough 방지) */
export const PortfolioHandlers = [
  http.get(BASE_URL + ENDPOINT.PORTFOLIO_TECH_STACK, () => {
    return HttpResponse.json(
      { tech_stack: techStackStore.tech_stack },
      { status: 200 },
    );
  }),

  http.put(BASE_URL + ENDPOINT.PORTFOLIO_TECH_STACK, async ({ request }) => {
    const body = (await request.json()) as { tech_stack: TechStackItem[] };
    techStackStore.tech_stack = [...(body.tech_stack ?? [])];

    return HttpResponse.json(
      { tech_stack: [...techStackStore.tech_stack] },
      { status: 200 },
    );
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

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_ACTIVITIES, ({ request }) => {
    const url = new URL(request.url);
    const categoryParams = url.searchParams.getAll('category');
    let list = [...activitiesStore];
    if (categoryParams.length > 0) {
      list = list.filter(a => categoryParams.includes(String(a.category)));
    }
    const sorted = list.sort((a, b) => a.display_order - b.display_order);
    return HttpResponse.json({ activities: sorted }, { status: 200 });
  }),

  http.post(BASE_URL + ENDPOINT.PORTFOLIO_ACTIVITIES, async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      description: string;
      start_date: string;
      end_date: string;
      category?: string;
    };
    const newItem: ActivityApiItem = {
      id: nextActivityId++,
      title: body.title ?? '',
      description: body.description ?? '',
      start_date: body.start_date ?? '',
      end_date: body.end_date ?? '',
      category: (body.category ?? '').trim() || '기타',
      display_order: activitiesStore.length,
    };
    activitiesStore.push(newItem);
    return HttpResponse.json(newItem, { status: 200 });
  }),

  http.patch(BASE_URL + ENDPOINT.PORTFOLIO_ACTIVITIES, async ({ request }) => {
    const body = (await request.json()) as Array<{
      id: number;
      title: string;
      description: string;
      start_date: string;
      end_date: string;
      category?: string;
    }>;
    if (!Array.isArray(body)) {
      return HttpResponse.json({ activities: activitiesStore }, { status: 200 });
    }
    for (const item of body) {
      const idx = activitiesStore.findIndex(a => a.id === item.id);
      if (idx !== -1) {
        activitiesStore[idx] = {
          ...activitiesStore[idx],
          title: item.title ?? activitiesStore[idx].title,
          description: item.description ?? activitiesStore[idx].description,
          start_date: item.start_date ?? activitiesStore[idx].start_date,
          end_date: item.end_date ?? activitiesStore[idx].end_date,
          category:
            item.category != null && item.category !== ''
              ? item.category
              : activitiesStore[idx].category,
        };
      }
    }
    const sorted = [...activitiesStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ activities: sorted }, { status: 200 });
  }),

  http.patch(
    BASE_URL + `${ENDPOINT.PORTFOLIO_ACTIVITIES}/:id`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as {
        title: string;
        description: string;
        start_date: string;
        end_date: string;
        category?: string;
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
        category:
          body.category != null && body.category !== ''
            ? body.category
            : activitiesStore[idx].category,
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

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_CV, () => {
    return HttpResponse.json(
      {
        cvs: cvStore.map(c => ({
          id: c.id,
          title: c.title,
          job_posting: c.job_posting,
          target_position: c.target_position,
          additional_notes: c.additional_notes,
          created_at: c.created_at,
          updated_at: c.updated_at,
        })),
      },
      { status: 200 },
    );
  }),

  http.get(BASE_URL + `${ENDPOINT.PORTFOLIO_CV}/:id`, ({ params }) => {
    const id = Number(params.id);
    const item = cvStore.find(c => c.id === id);
    if (!item || Number.isNaN(id)) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ ...item }, { status: 200 });
  }),

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_REPOSITORIES, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('per_page') ?? '20', 10)),
    );
    const visibleOnly =
      url.searchParams.get('visible_only') === 'true' ? true : undefined;
    const sortParam = url.searchParams.get('sort') ?? 'updated';
    const visibilityParam = url.searchParams.get('visibility') ?? 'all';
    const affiliationParam = url.searchParams.get('affiliation') ?? 'owner';

    let list = [...repositoriesStore];

    if (visibleOnly) {
      list = list.filter(r => r.is_visible);
    }

    if (visibilityParam !== 'all') {
      list = list.filter(r => r.visibility === visibilityParam);
    }

    // affiliationParam 은 실제로는 GitHub API에서만 의미가 있지만,
    // 목 환경에서는 모든 레포지토리를 동일하게 취급합니다.
    if (affiliationParam === 'owner') {
      // 기본 mock 데이터가 모두 owner 라고 가정하고 추가 필터는 적용하지 않습니다.
    }

    const sorted = [...list].sort((a, b) => {
      switch (sortParam) {
        case 'created':
          return b.created_at.localeCompare(a.created_at);
        case 'pushed':
          // mock 데이터에는 pushed_at 이 없으므로 updated_at 기준으로 정렬
          return b.updated_at.localeCompare(a.updated_at);
        case 'full_name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return b.updated_at.localeCompare(a.updated_at);
      }
    });

    const start = (page - 1) * perPage;
    const slice = sorted.slice(start, start + perPage);
    return HttpResponse.json({ repositories: slice }, { status: 200 });
  }),

  http.put(BASE_URL + ENDPOINT.PORTFOLIO_REPOSITORIES, async ({ request }) => {
    const body = (await request.json()) as PutRepositoryItem[];
    const byRepoId = new Map(repositoriesStore.map(r => [r.repo_id, r]));
    repositoriesStore.length = 0;
    body.forEach((item, index) => {
      const existing = byRepoId.get(item.repo_id);
      repositoriesStore.push({
        id: existing?.id ?? nextRepoId++,
        repo_id: item.repo_id,
        custom_title: item.custom_title ?? null,
        description: item.description ?? '',
        is_visible: item.is_visible ?? true,
        display_order: index,
        name: existing?.name ?? '',
        html_url: existing?.html_url ?? '',
        language: existing?.language ?? '',
        languages: existing?.languages ?? [],
        created_at: existing?.created_at ?? '',
        updated_at: existing?.updated_at ?? '',
        visibility: existing?.visibility ?? 'public',
        owner: existing?.owner ?? 'user',
        commit_count: existing?.commit_count ?? 0,
        stargazers_count: existing?.stargazers_count ?? 0,
        forks_count: existing?.forks_count ?? 0,
      });
    });
    if (repositoriesStore.length > 0) {
      nextRepoId =
        Math.max(...repositoriesStore.map(r => r.id), nextRepoId) + 1;
    }
    const sorted = [...repositoriesStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ repositories: sorted }, { status: 200 });
  }),

  http.patch(
    BASE_URL + `${ENDPOINT.PORTFOLIO_REPOSITORIES}/:id`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as PatchRepositoryBody;
      const idx = repositoriesStore.findIndex(r => r.id === id);
      if (idx === -1) {
        return HttpResponse.json({}, { status: 404 });
      }
      const prev = repositoriesStore[idx];
      repositoriesStore[idx] = {
        ...prev,
        custom_title: body.custom_title ?? prev.custom_title,
        description: body.description ?? prev.description,
        is_visible: body.is_visible ?? prev.is_visible,
        display_order: body.display_order ?? prev.display_order,
      };
      return HttpResponse.json(repositoriesStore[idx], { status: 200 });
    },
  ),

  http.get(BASE_URL + ENDPOINT.PORTFOLIO_MILEAGE, () => {
    const sorted = [...mileageStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ mileage: sorted }, { status: 200 });
  }),

  http.put(BASE_URL + ENDPOINT.PORTFOLIO_MILEAGE, async ({ request }) => {
    const body = (await request.json()) as PutPortfolioMileageItem[];
    mileageStore.length = 0;
    body.forEach((item, index) => {
      const built = buildPortfolioMileageItem(nextMileageId++, index, item);
      if (built) mileageStore.push(built);
    });
    const sorted = [...mileageStore].sort(
      (a, b) => a.display_order - b.display_order,
    );
    return HttpResponse.json({ mileage: sorted }, { status: 200 });
  }),

  http.put(
    BASE_URL + `${ENDPOINT.PORTFOLIO_MILEAGE}/:id`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as { additional_info?: string };
      const idx = mileageStore.findIndex(m => m.id === id);
      if (idx === -1) {
        return HttpResponse.json({}, { status: 404 });
      }
      if (body.additional_info !== undefined) {
        mileageStore[idx] = {
          ...mileageStore[idx],
          additional_info: body.additional_info,
        };
      }
      return HttpResponse.json(mileageStore[idx], { status: 200 });
    },
  ),
];
