import { GitHubStatusResponse } from '@/pages/profile/types/github';

export const mockGitHubStatusConnected: GitHubStatusResponse = {
  connected: true,
  githubUsername: 'testuser',
};

export const mockGitHubStatusDisconnected: GitHubStatusResponse = {
  connected: false,
  githubUsername: '',
};



