import { useEffect, useState } from 'react';

import getMaintenanceStatus from '@/apis/maintenance';
import { MaintenanceStatus } from '@/types/maintenance';
import { useGetUserInfoQuery } from '@/hooks/queries';
import useAuthStore from '@/stores/useAuthStore';

export const useMaintenanceCheck = () => {
  const [maintenanceStatus, setMaintenanceStatus] =
    useState<MaintenanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isLogin } = useAuthStore();
  const { data: userInfo, isLoading: userInfoLoading } = useGetUserInfoQuery();

  useEffect(() => {
    // 로그인하지 않았거나 사용자 정보가 로딩 중이면 점검 상태 체크 안 함
    if (!isLogin || userInfoLoading) {
      setMaintenanceStatus(null);
      setIsLoading(false);
      return;
    }

    // 사용자 정보가 없으면 점검 상태 체크 안 함
    if (!userInfo) {
      setMaintenanceStatus(null);
      setIsLoading(false);
      return;
    }

    const checkMaintenance = async () => {
      setIsLoading(true);
      try {
        const status = await getMaintenanceStatus();
        setMaintenanceStatus(status);
      } catch (error) {
        // 에러 발생 시 점검 모드 비활성화
        // console.error('점검 상태 확인 실패:', error);
        setMaintenanceStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenance();

    // 10분마다 주기적으로 점검 상태 재확인
    const interval = setInterval(checkMaintenance, 60000 * 10);

    return () => clearInterval(interval);
  }, [isLogin, userInfo, userInfoLoading]);

  return { maintenanceStatus, isLoading };
};


