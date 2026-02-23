import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

/** 활동 요약 - 활동 한 건 (display_order: 0이 맨 위) */
export interface ActivityApiItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
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
}

export interface ActivityPutRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

/** 활동 요약 - 활동 목록 조회 */
export const getActivities = async () => {
  const response = await http.get<ActivitiesResponse>(ENDPOINT.PORTFOLIO_ACTIVITIES);
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

/** 활동 요약 - 활동 수정 */
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
