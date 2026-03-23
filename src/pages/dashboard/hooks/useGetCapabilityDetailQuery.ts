import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCapabilityDetail } from '@/pages/dashboard/apis/capability';
import { CapabilityDetailResponse } from '@/pages/dashboard/types/capability';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetCapabilityDetailQuery = () => {
  return useQuery<CapabilityDetailResponse[], AxiosError>({
    queryKey: [QUERY_KEYS.capabilityDetail],
    queryFn: () => getCapabilityDetail(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default useGetCapabilityDetailQuery;











