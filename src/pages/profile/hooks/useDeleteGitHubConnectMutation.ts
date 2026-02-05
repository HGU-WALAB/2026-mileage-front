import { deleteGitHubConnect } from '@/pages/profile/apis/github';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useDeleteGitHubConnectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGitHubConnect,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.githubStatus],
      });
    },
  });
};

export default useDeleteGitHubConnectMutation;



