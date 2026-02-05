import { getGitHubStatus } from '@/pages/profile/apis/github';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { GitHubStatusResponse } from '@/pages/profile/types/github';
import { useQuery } from '@tanstack/react-query';

const useGetGitHubStatusQuery = () => {
  return useQuery<GitHubStatusResponse>({
    queryKey: [QUERY_KEYS.githubStatus],
    queryFn: () => getGitHubStatus(),
    throwOnError: true,
  });
};

export default useGetGitHubStatusQuery;



