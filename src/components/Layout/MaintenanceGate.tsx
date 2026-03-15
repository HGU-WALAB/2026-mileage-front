import { useMaintenanceCheck } from '@/hooks';
import { MaintenancePage } from '@/pages/etc/MaintenancePage';
import { palette } from '@/styles/palette';
import LinearProgress from '@mui/material/LinearProgress';
import { Outlet } from 'react-router-dom';

/**
 * 모든 경로(로그인 페이지 포함)에서 점검 상태를 먼저 확인합니다.
 * 점검 중이고 허용된 사용자가 아니면 점검 페이지만 보여주고, 아니면 자식 라우트(Outlet)를 렌더합니다.
 */
const MaintenanceGate = () => {
  const { maintenanceStatus, isLoading } = useMaintenanceCheck();

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

  if (
    maintenanceStatus?.maintenanceMode &&
    !maintenanceStatus.isAllowedUser
  ) {
    return <MaintenancePage status={maintenanceStatus} />;
  }

  return <Outlet />;
};

export default MaintenanceGate;
