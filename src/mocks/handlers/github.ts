import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import {
  mockGitHubStatusConnected,
  mockGitHubStatusDisconnected,
} from '@/mocks/fixtures/github';
import { Error401, Error500, randomMswError } from '@/utils/mswError';

const githubStatusStore = {
  status: { ...mockGitHubStatusConnected },
};

export const GitHubHandlers = [
  http.get(BASE_URL + ENDPOINT.GITHUB_STATUS, () => {
    const { is401Error, is500Error } = randomMswError();

    if (is401Error) return Error401();
    if (is500Error) return Error500();

    // 현재 상태로 반환 (연결/해제 후에도 상태 유지)
    return HttpResponse.json({ ...githubStatusStore.status }, { status: 200 });
  }),

  http.get(BASE_URL + ENDPOINT.GITHUB_CONNECT, () => {
    // OAuth 리다이렉트를 시뮬레이션하기 위해 실제로는 리다이렉트 URL을 반환해야 하지만
    // Mock에서는 성공 응답만 반환
    return HttpResponse.json({}, { status: 200 });
  }),

  http.get(BASE_URL + ENDPOINT.GITHUB_CALLBACK, ({ request }) => {
    const { is401Error, is500Error } = randomMswError();

    if (is401Error) return Error401();
    if (is500Error) return Error500();

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      githubStatusStore.status = { ...mockGitHubStatusDisconnected };
      return HttpResponse.json({ ...githubStatusStore.status }, { status: 200 });
    }

    if (code) {
      // code가 있으면 연결 성공 → 클라이언트에서 github-storage 동기화
      githubStatusStore.status = { ...mockGitHubStatusConnected };
      return HttpResponse.json({ ...githubStatusStore.status }, { status: 200 });
    }

    githubStatusStore.status = { ...mockGitHubStatusDisconnected };
    return HttpResponse.json({ ...githubStatusStore.status }, { status: 200 });
  }),

  http.delete(BASE_URL + ENDPOINT.GITHUB_CONNECT, () => {
    const { is401Error, is500Error } = randomMswError();

    if (is401Error) return Error401();
    if (is500Error) return Error500();

    // 연결 해제 성공 시 연결 해제된 상태 반환
    githubStatusStore.status = { ...mockGitHubStatusDisconnected };
    return HttpResponse.json({ ...githubStatusStore.status }, { status: 200 });
  }),
];

