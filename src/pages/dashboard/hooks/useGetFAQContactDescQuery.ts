import { getFAQContactDesc } from '@/apis/faq';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

const useGetFAQContactDescQuery = () => {
  return useQuery<string[]>({
    queryKey: [QUERY_KEYS.faq, 'contact'],
    queryFn: () => getFAQContactDesc(),
  });
};

export default useGetFAQContactDescQuery;




