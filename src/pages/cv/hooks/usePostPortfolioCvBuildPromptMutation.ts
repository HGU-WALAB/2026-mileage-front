import { QUERY_KEYS } from '@/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postPortfolioCvBuildPrompt } from '../apis/cv';

const usePostPortfolioCvBuildPromptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postPortfolioCvBuildPrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.portfolioCv] });
    },
  });
};

export default usePostPortfolioCvBuildPromptMutation;
