import { http, HttpResponse } from 'msw';

import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { mockAnnouncement } from '@/mocks/fixtures/announcement';
import { Error401, Error500, randomMswError } from '@/utils/mswError';

export const AnnouncementHandlers = [
  http.get(BASE_URL + ENDPOINT.ANNOUNCEMENT, () => {
    const { is401Error, is500Error } = randomMswError();

    if (is401Error) return Error401();
    if (is500Error) return Error500();

    return HttpResponse.json(mockAnnouncement, { status: 200 });
  }),
];

