import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCompareCapability } from '@/pages/dashboard/apis/capability';
import {
  CompareCapabilityRequest,
  CompareCapabilityResponse,
} from '@/pages/dashboard/types/capability';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetCompareCapabilityQuery = ({
  term,
  entryYear,
  major,
}: CompareCapabilityRequest) => {
  return useQuery<CompareCapabilityResponse[], AxiosError>({
    queryKey: [QUERY_KEYS.compareCapability, term, entryYear, major],
    queryFn: () => getCompareCapability({ term, entryYear, major }),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default useGetCompareCapabilityQuery;











