import axiosInstance from '@/apis/axios';
import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';

export interface UserInfoResponse {
  name: string;
  department: string;
  major1: string;
  major2: string;
  grade: number;
  semester: number;
  bio: string;
  profile_image_url: string | null;
}

export interface UserInfoPatchRequest {
  bio: string;
}

/** 활동 요약 - 유저 정보 조회 */
export const getUserInfo = async () => {
  const response = await http.get<UserInfoResponse>(ENDPOINT.PORTFOLIO_USER_INFO);
  return response;
};

/** 활동 요약 - 유저 정보 수정 (bio만) */
export const patchUserInfo = async (body: UserInfoPatchRequest) => {
  const response = await http.patch<UserInfoPatchRequest, UserInfoResponse>(
    ENDPOINT.PORTFOLIO_USER_INFO,
    body,
  );
  return response;
};

/** 활동 요약 - 유저 정보 수정 (bio + 프로필 이미지, multipart/form-data) */
export const patchUserInfoWithImage = async (
  bio: string,
  profileImage?: File,
): Promise<UserInfoResponse> => {
  const url = `${ENDPOINT.PORTFOLIO_USER_INFO}?bio=${encodeURIComponent(bio)}`;
  const formData = new FormData();
  if (profileImage) {
    formData.append('profile_image', profileImage);
  }
  const res = await axiosInstance.patch<UserInfoResponse>(url, formData);
  return res.data;
};
