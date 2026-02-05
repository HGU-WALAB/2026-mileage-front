export interface MaintenanceStatus {
  maintenanceMode: boolean;
  message: string;
  estimatedTime: string;
  /**
   * 점검 중에도 접속이 허용된 사용자 여부
   * 백엔드 응답 필드명 `allowedUser` 를 API 레이어에서 매핑해서 사용합니다.
   */
  isAllowedUser: boolean;
}


