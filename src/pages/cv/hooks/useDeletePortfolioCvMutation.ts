import { QUERY_KEYS } from '@/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePortfolioCv } from '../apis/cv';

const useDeletePortfolioCvMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePortfolioCv(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.portfolioCv] });
    },
  });
};

export default useDeletePortfolioCvMutation;
