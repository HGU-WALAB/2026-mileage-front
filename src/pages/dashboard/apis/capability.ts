import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import {
  ActivityRecommendResponse,
  CapabilityDetailResponse,
  CapabilityResponse,
  CompareCapabilityRequest,
  CompareCapabilityResponse,
  SemesterCapabilityResponse,
} from '@/pages/dashboard/types/capability';

export const getCapability = async () => {
  const response = await http.get<CapabilityResponse[]>(
    `${ENDPOINT.CAPABILITY}/milestone`,
  );

  return response;
};

export const getSemesterCapability = async () => {
  const response = await http.get<SemesterCapabilityResponse[]>(
    `${ENDPOINT.CAPABILITY}/semester`,
  );

  return response;
};

export const getCompareCapability = async ({
  term,
  entryYear,
  major,
}: CompareCapabilityRequest) => {
  // 빈 값(major= 같은)은 일부 서버에서 500을 유발할 수 있어서 아예 파라미터에서 제외
  const paramsObj: Record<string, string> = {};
  if (term) paramsObj.term = term;
  if (entryYear) paramsObj.entryYear = entryYear;
  if (major) paramsObj.major = major;

  const queryParams = new URLSearchParams(paramsObj);

  const response = await http.get<CompareCapabilityResponse[]>(
    `${ENDPOINT.CAPABILITY}/milestone/compare`,
    { params: queryParams },
  );

  return response;
};

export const getCapabilityDetail = async () => {
  const response = await http.get<CapabilityDetailResponse[]>(
    `${ENDPOINT.MILEAGE}/detail`,
  );
  return response;
};

export const getActivityRecommend = async () => {
  const response = await http.get<ActivityRecommendResponse>(
    `${ENDPOINT.CAPABILITY}/suggest`,
  );
  return response;
};
