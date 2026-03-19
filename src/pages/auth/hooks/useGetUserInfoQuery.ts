import { getUserInfo } from '@/pages/auth/apis/auth';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { UserResponse } from '@/pages/auth/types/auth';
import { useAuthStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const useGetUserInfoQuery = () => {
  const query = useQuery<UserResponse>({
    queryKey: [QUERY_KEYS.userInfo],
    queryFn: () => getUserInfo(),
    throwOnError: true,
  });

  useEffect(() => {
    const res = query.data;
    if (!res) return;

    const { login, currentSemester: storedCurrentSemester, student } =
      useAuthStore.getState();

    const nextCurrentSemester =
      (res as unknown as { currentSemester?: string }).currentSemester ??
      storedCurrentSemester;

    login(
      {
        studentId: res.studentId ?? student.studentId,
        studentName: res.studentName ?? student.studentName,
        studentType: res.studentType ?? student.studentType,
      },
      nextCurrentSemester,
      res.term,
    );
  }, [query.data]);

  return query;
};

export default useGetUserInfoQuery;
