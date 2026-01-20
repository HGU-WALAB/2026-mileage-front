import { getScholarshipDuration } from '@/pages/mileage/apis/scholarship';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ScholarshipDurationResponse } from '@/pages/mileage/types/scholarship';
import { useQuery } from '@tanstack/react-query';

const useGetScholarshipDurationQuery = () => {
  return useQuery<ScholarshipDurationResponse>({
    queryKey: [QUERY_KEYS.scholarshipDuration],
    queryFn: () => getScholarshipDuration(),
  });
};

export default useGetScholarshipDurationQuery;
