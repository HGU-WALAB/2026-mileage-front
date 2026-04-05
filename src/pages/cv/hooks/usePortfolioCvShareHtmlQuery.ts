import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

import { getPortfolioCvShareHtml } from '../apis/cv';
import { isCvPublicTokenFormat } from '../utils/cvPublicToken';

const SHARE_HTML_QUERY_CONFIG = { retry: 1, refetchOnWindowFocus: false } as const;

const usePortfolioCvShareHtmlQuery = (publicToken: string | undefined) => {
  const token = publicToken?.trim() ?? '';
  const formatOk = isCvPublicTokenFormat(token);
  return useQuery({
    queryKey: [QUERY_KEYS.portfolioCvShareHtml, token] as const,
    queryFn: () => getPortfolioCvShareHtml(token),
    enabled: token.length > 0 && formatOk,
    ...SHARE_HTML_QUERY_CONFIG,
  });
};

export default usePortfolioCvShareHtmlQuery;
