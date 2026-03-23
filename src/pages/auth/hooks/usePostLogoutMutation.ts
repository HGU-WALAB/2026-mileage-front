import { postLogout } from '@/pages/auth/apis/auth';
import { useAuthStore } from '@/stores';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const usePostLogoutMutation = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    // 성공/실패 모두 캐시를 비우고 클라이언트 로그아웃 처리
    onSettled: () => {
      queryClient.clear();
      logout();
    },
  });
};

export default usePostLogoutMutation;
