import { Flex, Footer, PageErrorFallback } from '@/components';
import {
  MileageCountSection,
  MileageFilterSection,
  MileageTableListSection,
  MobileMileageCountSection,
} from './components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import { useMediaQuery } from '@mui/material';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryParams } from '@/pages/mileage/hooks';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const MileageListPage = () => {
  useTrackPageView({ eventName: '[View] 마일리지 조회 페이지' });
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { updateQueryParams } = useQueryParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 초기 로드 시 done 파라미터가 URL에 없으면 'Y'로 설정
    const doneParam = searchParams.get('done');
    if (!doneParam) {
      updateQueryParams({ done: 'Y' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex.Column margin="1rem">
      {isMobile && (
        <ErrorBoundary fallback={<div />}>
          <MobileMileageCountSection />
        </ErrorBoundary>
      )}

      <Flex.Row justify="space-between" align="center">
        <MileageFilterSection />

        <ErrorBoundary fallback={<div />}>
          <MileageCountSection />
        </ErrorBoundary>
      </Flex.Row>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary FallbackComponent={PageErrorFallback} onReset={reset}>
            <MileageTableListSection />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>

      <Footer />
    </Flex.Column>
  );
};

export default MileageListPage;



