import { ROUTE_PATH } from '@/constants/routePath';
import { useMaintenanceCheck } from '@/hooks';
import useAuthStore from '@/stores/useAuthStore';
import { MaintenancePage } from '@/pages/etc/MaintenancePage';
import { palette } from '@/styles/palette';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isLogin } = useAuthStore();
  const { maintenanceStatus, isLoading } = useMaintenanceCheck();

  useEffect(() => {
    // 점검 상태를 확인 중이거나 점검 모드가 아니거나 허용된 사용자일 때만 로그인 체크
    const shouldCheckLogin =
      !isLoading &&
      (!maintenanceStatus?.maintenanceMode ||
        maintenanceStatus.isAllowedUser) &&
      !isLogin;
    if (shouldCheckLogin) {
      navigate(ROUTE_PATH.login, { replace: true });
    }
  }, [navigate, isLogin, isLoading, maintenanceStatus]);

  // 점검 상태 로딩 중
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <LinearProgress
          sx={{
            width: '12rem',
            height: 6,
            borderRadius: 3,
            backgroundColor: palette.blue300,
            '& .MuiLinearProgress-bar': {
              backgroundColor: palette.blue500,
            },
          }}
        />
      </div>
    );
  }

  // 점검 모드가 활성화되어 있고 허용된 사용자가 아닐 때만 점검 페이지 표시
  if (
    maintenanceStatus?.maintenanceMode &&
    !maintenanceStatus.isAllowedUser
  ) {
    return <MaintenancePage status={maintenanceStatus} />;
  }

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음
  if (!isLogin) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
