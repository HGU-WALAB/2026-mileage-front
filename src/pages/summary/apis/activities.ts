import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 활동 한 건 (display_order: 0이 맨 위) */
export interface ActivityApiItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: number;
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
  category: number;
}

export interface ActivityPutRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: number;
}

/** PATCH /api/portfolio/activities 요청 한 건 */
export interface ActivityPatchItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: number;
}

/** 활동 요약 - 활동 목록 조회 (category: [0] 이면 활동 섹션용만) */
export const getActivities = async (params?: { category?: number[] }) => {
  const searchParams = new URLSearchParams();
  if (params?.category?.length) {
    params.category.forEach(c => searchParams.append('category', String(c)));
  }
  const query = searchParams.toString();
  const url = query ? `${ENDPOINT.PORTFOLIO_ACTIVITIES}?${query}` : ENDPOINT.PORTFOLIO_ACTIVITIES;
  const response = await http.get<ActivitiesResponse>(url);
  return response;
};

/** 활동 요약 - 활동 추가 */
export const postActivity = async (body: ActivityPostRequest) => {
  const response = await http.post<ActivityPostRequest, ActivityApiItem>(
    ENDPOINT.PORTFOLIO_ACTIVITIES,
    body,
  );
  return response;
};

/** 활동 요약 - 활동 일괄 수정 (PATCH) */
export const patchActivities = async (body: ActivityPatchItem[]) => {
  const response = await http.patch<ActivityPatchItem[], ActivitiesResponse>(
    ENDPOINT.PORTFOLIO_ACTIVITIES,
    body,
  );
  return response;
};

/** 활동 요약 - 활동 수정 (단건, 기존 PUT 호환) */
export const putActivity = async (id: number, body: ActivityPutRequest) => {
  const response = await http.put<ActivityPutRequest, ActivityApiItem>(
    `${ENDPOINT.PORTFOLIO_ACTIVITIES}/${id}`,
    body,
  );
  return response;
};

/** 활동 요약 - 활동 삭제 */
export const deleteActivity = async (id: number) => {
  const response = await http.delete<unknown>(
    `${ENDPOINT.PORTFOLIO_ACTIVITIES}/${id}`,
  );
  return response;
};
