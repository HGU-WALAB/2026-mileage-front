import { getAnnouncement } from '@/pages/profile/apis/announcement';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { AnnouncementResponse } from '@/pages/profile/types/announcement';
import { useQuery } from '@tanstack/react-query';

const useGetAnnouncementQuery = () => {
  return useQuery<AnnouncementResponse>({
    queryKey: [QUERY_KEYS.announcement],
    queryFn: () => getAnnouncement(),
    throwOnError: true,
  });
};

export default useGetAnnouncementQuery;



