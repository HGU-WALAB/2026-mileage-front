import FullViewportLoading from '@/components/Error/FullViewportLoading';
import { ROUTE_PATH } from '@/constants/routePath';
import { useMaintenanceCheck } from '@/pages/auth/hooks';
import { MaintenancePage } from '@/pages/etc/MaintenancePage';
import { useAuthStore } from '@/stores';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * 모든 경로(로그인 페이지 포함)에서 점검 상태를 먼저 확인합니다.
 * 점검 중이고 허용된 사용자가 아니면 점검 페이지만 보여주고, 아니면 자식 라우트(Outlet)를 렌더합니다.
 */
const MaintenanceGate = () => {
  const { maintenanceStatus, isLoading } = useMaintenanceCheck();
  const location = useLocation();
  const { isLogin } = useAuthStore();

  if (isLoading) {
    return <FullViewportLoading />;
  }

  const isAuthRoute =
    location.pathname === ROUTE_PATH.login ||
    location.pathname === ROUTE_PATH.githubCallback;

  const isPublicCvShareRoute = location.pathname.startsWith(`${ROUTE_PATH.cv}/share/`);

  if (
    maintenanceStatus?.maintenanceMode &&
    !maintenanceStatus.isAllowedUser
  ) {
    // 로그인 전에는 로그인/콜백 경로는 허용해서,
    // 로그인 후 "허용 유저" 판정이 반영되면 통과할 수 있게 합니다.
    // 공개 이력서 미리보기는 비로그인 방문이 있으므로 점검 중에도 허용합니다.
    if (!isLogin && (isAuthRoute || isPublicCvShareRoute)) {
      return <Outlet />;
    }
    return <MaintenancePage status={maintenanceStatus} />;
  }

  return <Outlet />;
};

export default MaintenanceGate;
