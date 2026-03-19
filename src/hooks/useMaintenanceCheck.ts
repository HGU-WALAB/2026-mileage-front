import { useEffect, useState } from 'react';

import getMaintenanceStatus from '@/apis/maintenance';
import { MaintenanceStatus } from '@/types/maintenance';
import { useGetUserInfoQuery } from '@/hooks/queries';
import useAuthStore from '@/stores/useAuthStore';

export const useMaintenanceCheck = () => {
  const [maintenanceStatus, setMaintenanceStatus] =
    useState<MaintenanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLogin } = useAuthStore();
  const { data: userInfo, isLoading: userInfoLoading } = useGetUserInfoQuery();

  useEffect(() => {
    // 로그인/유저정보 준비 전에는 점검 체크를 시작하지 않음
    // - 로그인 전에는 로그인 화면이 점검에 의해 막히지 않게 함
    // - 로그인 후에는 유저정보 로딩이 끝난 뒤 점검 상태를 확인
    if (!isLogin) {
      setMaintenanceStatus(null);
      setIsLoading(false);
      return;
    }

    if (userInfoLoading) {
      setMaintenanceStatus(null);
      setIsLoading(true);
      return;
    }

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
        // 로그인 후 점검 확인이 실패하면 안전하게 "점검중"으로 처리 (요구사항 유지)
        setMaintenanceStatus({
          maintenanceMode: true,
          message: '점검 상태를 확인할 수 없습니다.\n잠시 후 다시 시도해주세요.',
          estimatedTime: '',
          isAllowedUser: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenance();

    const interval = setInterval(checkMaintenance, 60000 * 10);
    return () => clearInterval(interval);
  }, [isLogin, userInfo, userInfoLoading]); // 유저정보 준비 후 점검 체크 시작

  return { maintenanceStatus, isLoading };
};


