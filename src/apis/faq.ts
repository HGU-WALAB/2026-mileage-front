import { ENDPOINT } from '@/apis/endPoint';
import { http } from '@/apis/http';
import { ContactInfoResponse } from '@/pages/mileage/types/faq';

export const getFAQContactDesc = async () => {
  const response = await http.get<ContactInfoResponse>(ENDPOINT.CONTACT);

  return response;
};

