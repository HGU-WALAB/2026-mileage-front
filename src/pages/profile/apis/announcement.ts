import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import { AnnouncementResponse } from '../types/announcement';

export const getAnnouncement = async () => {
  const response = await http.get<AnnouncementResponse>(ENDPOINT.ANNOUNCEMENT);
  return response;
};

