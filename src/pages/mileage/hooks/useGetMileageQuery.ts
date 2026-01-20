import { getMileageList } from '@/pages/mileage/apis/mileage';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { MileageRequest, MileageResponse } from '@/pages/mileage/types/mileage';
import { useQuery } from '@tanstack/react-query';

const useGetMileageQuery = ({
  keyword,
  category,
  semester,
  done,
}: MileageRequest) => {
  return useQuery<MileageResponse[]>({
    queryKey: [QUERY_KEYS.mileageList, keyword, category, semester, done],
    queryFn: () =>
      getMileageList({
        keyword,
        category,
        semester,
        done,
      }),
    throwOnError: true,
  });
};

export default useGetMileageQuery;
