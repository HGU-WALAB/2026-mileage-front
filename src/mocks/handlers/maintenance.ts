import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';

export const MaintenanceHandlers = [
  http.get(BASE_URL + ENDPOINT.MAINTENANCE, () =>
    HttpResponse.json(
      {
        maintenanceMode: false,
        message: '',
        estimatedTime: '',
        // 점검 중에도 접속 허용 여부
        allowedUser: false,
      },
      { status: 200 },
    ),
  ),
];


