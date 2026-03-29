import {
  PORTFOLIO_CV_PANEL_QUERY_KEY,
  PORTFOLIO_CV_PANEL_QUERY_VALUE,
} from '@/constants/routePath';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * `?cvPanel=1` 쿼리가 있으면 패널을 연 뒤 쿼리를 제거합니다.
 */
export function useCvPanelOpenFromQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cvPanelOpen, setCvPanelOpen] = useState(false);

  useEffect(() => {
    if (
      searchParams.get(PORTFOLIO_CV_PANEL_QUERY_KEY) !==
      PORTFOLIO_CV_PANEL_QUERY_VALUE
    ) {
      return;
    }
    setCvPanelOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete(PORTFOLIO_CV_PANEL_QUERY_KEY);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return { cvPanelOpen, setCvPanelOpen } as const;
}
