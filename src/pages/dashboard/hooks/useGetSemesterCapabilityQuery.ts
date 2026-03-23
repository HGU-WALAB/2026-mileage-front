import { getSemesterCapability } from '@/pages/dashboard/apis/capability';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { SemesterCapabilityResponse } from '@/pages/dashboard/types/capability';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetSemesterCapabilityQuery = () => {
  return useQuery<SemesterCapabilityResponse[], AxiosError>({
    queryKey: [QUERY_KEYS.semesterCapability],
    queryFn: () => getSemesterCapability(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default useGetSemesterCapabilityQuery;
