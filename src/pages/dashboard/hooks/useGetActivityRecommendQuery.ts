import { QUERY_KEYS } from '@/constants/queryKeys';
import { getActivityRecommend } from '@/pages/dashboard/apis/capability';
import { ActivityRecommendResponse } from '@/pages/dashboard/types/capability';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetActivityRecommendQuery = () => {
  return useQuery<ActivityRecommendResponse, AxiosError>({
    queryKey: [QUERY_KEYS.activityRecommend],
    queryFn: () => getActivityRecommend(),
  });
};

export default useGetActivityRecommendQuery;


