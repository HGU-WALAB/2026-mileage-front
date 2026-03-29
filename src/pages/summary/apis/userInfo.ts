import axiosInstance from '@/apis/axios';
import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

export interface ProfileLinkItem {
  label: string;
  url: string;
}

export interface UserInfoResponse {
  name: string;
  department: string;
  major1: string;
  major2: string;
  grade: number;
  semester: number;
  bio: string;
  profile_image_url: string | null;
  profile_links: ProfileLinkItem[];
}

/** PATCH /api/portfolio/user-info — 전달한 필드만 갱신 */
export interface UserInfoPatchRequest {
  bio?: string;
  profile_image_url?: string | null;
  profile_links?: ProfileLinkItem[];
}

/** 표시·저장용 URL 정규화 (스킴 없으면 https 추가) */
export function normalizePortfolioProfileUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function normalizeUserInfoResponse(data: UserInfoResponse): UserInfoResponse {
  const links = Array.isArray(data.profile_links) ? data.profile_links : [];
  return {
    ...data,
    profile_links: links.map(l => ({
      label: typeof l.label === 'string' ? l.label : '',
      url: typeof l.url === 'string' ? l.url : '',
    })),
  };
}

/** 활동 요약 - 유저 정보 조회 */
export const getUserInfo = async () => {
  const response = await http.get<UserInfoResponse>(ENDPOINT.PORTFOLIO_USER_INFO);
  return normalizeUserInfoResponse(response);
};

/** 활동 요약 - 프로필 메타데이터 수정 (JSON) */
export const patchUserInfo = async (body: UserInfoPatchRequest) => {
  const response = await http.patch<UserInfoPatchRequest, UserInfoResponse>(
    ENDPOINT.PORTFOLIO_USER_INFO,
    body,
  );
  return normalizeUserInfoResponse(response);
};

/**
 * PUT /api/portfolio/user-info/image
 * multipart/form-data, 필드명 profile_image
 */
export const putPortfolioUserProfileImage = async (
  file: File,
): Promise<UserInfoResponse> => {
  const formData = new FormData();
  formData.append('profile_image', file);
  const res = await axiosInstance.put<UserInfoResponse>(
    ENDPOINT.PORTFOLIO_USER_INFO_IMAGE,
    formData,
  );
  return normalizeUserInfoResponse(res.data);
};
