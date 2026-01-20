import { postLogout } from '@/pages/auth/apis/auth';
import { useAuthStore } from '@/stores';
import { useMutation } from '@tanstack/react-query';

const usePostLogoutMutation = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      logout();
    },
  });
};

export default usePostLogoutMutation;
