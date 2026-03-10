import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import { GitHubStatusResponse } from '../types/github';

const GITHUB_STORAGE_KEY = 'github-storage';

export function syncGitHubStorage(status: GitHubStatusResponse) {
  try {
    const payload = {
      state: {
        connected: status.connected,
        githubName: status.connected && status.githubUsername
          ? status.githubUsername
          : null,
      },
      version: 0,
    };
    localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export const getGitHubStatus = async () => {
  const response = await http.get<GitHubStatusResponse>(ENDPOINT.GITHUB_STATUS);
  syncGitHubStorage(response);
  return response;
};

export const getGitHubConnect = () => {
  // OAuth 리다이렉트를 위해 직접 URL로 이동
  window.location.href = `${BASE_URL}${ENDPOINT.GITHUB_CONNECT}`;
};

export const getGitHubCallback = async (code?: string, error?: string) => {
  const params = new URLSearchParams();
  if (code) params.append('code', code);
  if (error) params.append('error', error);

  const queryString = params.toString();
  const url = queryString
    ? `${ENDPOINT.GITHUB_CALLBACK}?${queryString}`
    : ENDPOINT.GITHUB_CALLBACK;

  const response = await http.get<GitHubStatusResponse>(url);
  syncGitHubStorage(response);
  return response;
};

export const deleteGitHubConnect = async () => {
  const response = await http.delete<GitHubStatusResponse>(
    ENDPOINT.GITHUB_CONNECT,
  );
  syncGitHubStorage(response);
  return response;
};

