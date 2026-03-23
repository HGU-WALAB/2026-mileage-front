import { getCapability } from '@/pages/dashboard/apis/capability';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { CapabilityResponse } from '@/pages/dashboard/types/capability';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetCapabilityQuery = () => {
  return useQuery<CapabilityResponse[], AxiosError>({
    queryKey: [QUERY_KEYS.capability],
    queryFn: () => getCapability(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default useGetCapabilityQuery;
