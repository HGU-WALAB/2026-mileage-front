import { HISNET_AUTH_URL } from '@/pages/auth/constants/auth';
import { useEffect } from 'react';

import usePostLoginMutation from './usePostLoginMutation';

const useLogin = () => {
  const { mutate: postLogin, isSuccess } = usePostLoginMutation();

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    const token = params.get('token');

    if (token) {
      postLogin({ token });

      params.delete('token');
      currentUrl.search = params.toString();
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [postLogin]);

  const handleHisnetAuth = () => {
    const returnUrl = window.location.href;
    window.location.href = HISNET_AUTH_URL(returnUrl);
  };

  return { handleHisnetAuth, isLoginSucceed: isSuccess };
};

export default useLogin;
