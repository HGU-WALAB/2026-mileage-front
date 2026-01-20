import { getUserInfo } from '@/pages/auth/apis/auth';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { UserResponse } from '@/pages/auth/types/auth';
import { useQuery } from '@tanstack/react-query';

const useGetUserInfoQuery = () => {
  return useQuery<UserResponse>({
    queryKey: [QUERY_KEYS.userInfo],
    queryFn: () => getUserInfo(),
    throwOnError: true,
  });
};

export default useGetUserInfoQuery;
