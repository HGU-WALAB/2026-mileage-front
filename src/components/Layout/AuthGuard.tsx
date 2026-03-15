import { ROUTE_PATH } from '@/constants/routePath';
import useAuthStore from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 로그인된 사용자만 자식(대시보드 등)을 보여줍니다.
 * 점검 여부·로딩 UI는 상위 MaintenanceGate에서 처리합니다.
 */
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isLogin } = useAuthStore();

  useEffect(() => {
    if (!isLogin) {
      navigate(ROUTE_PATH.login, { replace: true });
    }
  }, [navigate, isLogin]);

  if (!isLogin) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
