import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import { MaintenanceStatus } from '@/types/maintenance';

// 백엔드 응답 스키마 (allowedUser 필드를 isAllowedUser로 매핑)
interface MaintenanceStatusApiResponse {
  maintenanceMode: boolean;
  message: string;
  estimatedTime: string;
  allowedUser: boolean;
}

const getMaintenanceStatus = async (): Promise<MaintenanceStatus> => {
  const response = await http.get<MaintenanceStatusApiResponse>(
    ENDPOINT.MAINTENANCE,
  );

  return {
    maintenanceMode: response.maintenanceMode,
    message: response.message,
    estimatedTime: response.estimatedTime,
    isAllowedUser: response.allowedUser,
  };
};

export default getMaintenanceStatus;


