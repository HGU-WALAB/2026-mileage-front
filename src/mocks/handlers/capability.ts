import { http, HttpResponse } from 'msw';

import { ENDPOINT } from '@/apis/endPoint';
import { mockActivityRecommend } from '@/mocks/fixtures/activityRecommend';
import { mockCapability } from '@/mocks/fixtures/capability';
import { mockCapabilityDetail } from '@/mocks/fixtures/capabilityDetail';
import {
  mockCompareCapability1,
  mockCompareCapability2,
  mockCompareCapability3,
} from '@/mocks/fixtures/compareCapability';
import { mockSemesterCapability } from '@/mocks/fixtures/semesterCapability';
import { Error401, Error500, randomMswError } from '@/utils/mswError';

export const CapabilityHandlers = [
  http.get(`*${ENDPOINT.CAPABILITY}/milestone`, () => {
    const { is500Error } = randomMswError();
    if (is500Error) return Error500();

    return HttpResponse.json(mockCapability, { status: 200 });
  }),

  http.get(`*${ENDPOINT.CAPABILITY}/milestone/compare`, req => {
    const { is500Error } = randomMswError();
    if (is500Error) return Error500();

    const url = new URL(req.request.url);
    const term = url.searchParams.get('term');
    const major = url.searchParams.get('major');

    // ver2 동작과 동일하게, 파라미터 조합에 따라 다른 mock 반환
    if (term && !major)
      return HttpResponse.json(mockCompareCapability1, { status: 200 });
    if (major)
      return HttpResponse.json(mockCompareCapability3, { status: 200 });
    return HttpResponse.json(mockCompareCapability2, { status: 200 });
  }),

  http.get(`*${ENDPOINT.CAPABILITY}/semester`, () => {
    const { is401Error, is500Error } = randomMswError();

    if (is401Error) return Error401();
    if (is500Error) return Error500();

    return HttpResponse.json(mockSemesterCapability, { status: 200 });
  }),

  http.get(`*${ENDPOINT.MILEAGE}/detail`, () => {
    const { is500Error } = randomMswError();
    if (is500Error) return Error500();

    return HttpResponse.json(mockCapabilityDetail, { status: 200 });
  }),

  http.get(`*${ENDPOINT.CAPABILITY}/suggest`, () => {
    const { is500Error } = randomMswError();
    if (is500Error) return Error500();

    return HttpResponse.json(mockActivityRecommend, { status: 200 });
  }),
];
