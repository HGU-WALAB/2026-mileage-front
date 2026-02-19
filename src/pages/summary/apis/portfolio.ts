import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

export interface TechStackResponse {
  tech_stack: string[];
}

export interface TechStackPutRequest {
  tech_stack: string[];
}

/** API 활동 한 건 (display_order: 0이 맨 위) */
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

/** 활동 요약 - 유저 정보 (학기·grade는 화면에 미표시) */
export interface UserInfoResponse {
  name: string;
  department: string;
  major1: string;
  major2: string;
  grade: number;
  semester: number;
  bio: string;
}

export interface UserInfoPatchRequest {
  bio: string;
}

/** 활동 요약 - 기술 스택 조회 (페이지 진입 시 1회) */
export const getTechStack = async () => {
  const response = await http.get<TechStackResponse>(
    ENDPOINT.PORTFOLIO_TECH_STACK,
  );
  return response;
};

/** 활동 요약 - 기술 스택 수정 (디바운스 후 1회) */
export const putTechStack = async (body: TechStackPutRequest) => {
  const response = await http.put<unknown>(
    ENDPOINT.PORTFOLIO_TECH_STACK,
    body,
  );
  return response;
};

/** 활동 요약 - 활동 목록 조회 (페이지 진입 시 1회, display_order 0이 맨 위) */
export const getActivities = async () => {
  const response = await http.get<ActivitiesResponse>(
    ENDPOINT.PORTFOLIO_ACTIVITIES,
  );
  return response;
};

/** 활동 요약 - 활동 추가 */
export const postActivity = async (body: ActivityPostRequest) => {
  const response = await http.post<
    ActivityPostRequest,
    ActivityApiItem
  >(ENDPOINT.PORTFOLIO_ACTIVITIES, body);
  return response;
};

/** 활동 요약 - 활동 수정 */
export const putActivity = async (
  id: number,
  body: ActivityPutRequest,
) => {
  const response = await http.put<
    ActivityPutRequest,
    ActivityApiItem
  >(`${ENDPOINT.PORTFOLIO_ACTIVITIES}/${id}`, body);
  return response;
};

/** 활동 요약 - 활동 삭제 */
export const deleteActivity = async (id: number) => {
  const response = await http.delete<unknown>(
    `${ENDPOINT.PORTFOLIO_ACTIVITIES}/${id}`,
  );
  return response;
};

/** 활동 요약 - 유저 정보 조회 (페이지 진입 시 1회) */
export const getUserInfo = async () => {
  const response = await http.get<UserInfoResponse>(
    ENDPOINT.PORTFOLIO_USER_INFO,
  );
  return response;
};

/** 활동 요약 - 유저 정보 수정 (bio만) */
export const patchUserInfo = async (body: UserInfoPatchRequest) => {
  const response = await http.patch<
    UserInfoPatchRequest,
    UserInfoResponse
  >(ENDPOINT.PORTFOLIO_USER_INFO, body);
  return response;
};
