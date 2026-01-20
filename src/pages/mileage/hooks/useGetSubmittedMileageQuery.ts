import { getSubmittedMileageList } from '@/pages/mileage/apis/mileage';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { SubmittedMileageResponse } from '@/pages/mileage/types/mileage';
import { useQuery } from '@tanstack/react-query';

const useGetSubmittedMileageQuery = () => {
  return useQuery<SubmittedMileageResponse[]>({
    queryKey: [QUERY_KEYS.submittedMileage],
    queryFn: () => getSubmittedMileageList(),
    throwOnError: true,
  });
};

export default useGetSubmittedMileageQuery;
