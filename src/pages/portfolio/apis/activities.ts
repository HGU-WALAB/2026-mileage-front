import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 활동 한 건 (display_order: 0이 맨 위) */
export interface ActivityApiItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  /** 사용자 정의 카테고리 문자열 */
  category: string;
  display_order: number;
}

export interface ActivitiesResponse {
  activities: ActivityApiItem[];
}

export interface ActivityPostRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
}

/** PATCH /api/portfolio/activities/{id} 요청 본문 */
export interface ActivityPatchByIdRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
}

/** PATCH /api/portfolio/activities 일괄 수정 요청 한 건 */
export interface ActivityPatchItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
}

/** 활동 목록 조회. `category` 쿼리 생략 시 전체 */
export const getActivities = async (params?: { category?: string[] }) => {
  const searchParams = new URLSearchParams();
  if (params?.category?.length) {
    params.category.forEach(c => searchParams.append('category', c));
  }
  const query = searchParams.toString();
  const url = query ? `${ENDPOINT.PORTFOLIO_ACTIVITIES}?${query}` : ENDPOINT.PORTFOLIO_ACTIVITIES;
  const response = await http.get<ActivitiesResponse>(url);
  return response;
};

/** 활동 추가 POST */
export const postActivity = async (body: ActivityPostRequest) => {
  const response = await http.post<ActivityPostRequest, ActivityApiItem>(
    ENDPOINT.PORTFOLIO_ACTIVITIES,
    body,
  );
  return response;
};

/** 활동 일괄 수정 PATCH */
export const patchActivities = async (body: ActivityPatchItem[]) => {
  const response = await http.patch<ActivityPatchItem[], ActivitiesResponse>(
    ENDPOINT.PORTFOLIO_ACTIVITIES,
    body,
  );
  return response;
};

/** 활동 단건 수정 PATCH /api/portfolio/activities/{id} */
export const patchActivityById = async (
  id: number,
  body: ActivityPatchByIdRequest,
) => {
  const response = await http.patch<ActivityPatchByIdRequest, ActivityApiItem>(
    `${ENDPOINT.PORTFOLIO_ACTIVITIES}/${id}`,
    body,
  );
  return response;
};

/** 활동 삭제 */
export const deleteActivity = async (id: number) => {
  const response = await http.delete<unknown>(
    `${ENDPOINT.PORTFOLIO_ACTIVITIES}/${id}`,
  );
  return response;
};
