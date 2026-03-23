import { QUERY_KEYS } from '@/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  patchPortfolioCv,
  type PortfolioCvPatchRequest,
} from '../apis/cv';

const usePatchPortfolioCvMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PortfolioCvPatchRequest }) =>
      patchPortfolioCv(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.portfolioCv] });
    },
  });
};

export default usePatchPortfolioCvMutation;
