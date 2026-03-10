import { getFAQContactDesc } from '@/apis/faq';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { ContactInfoResponse } from '@/pages/mileage/types/faq';

const useGetFAQContactDescQuery = () => {
  return useQuery<ContactInfoResponse>({
    queryKey: [QUERY_KEYS.faq, 'contact'],
    queryFn: () => getFAQContactDesc(),
  });
};

export default useGetFAQContactDescQuery;




