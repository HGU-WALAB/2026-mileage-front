import { Flex, Footer } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import CvManagementPanel from './components/CvManagementPanel';
import { useMediaQuery } from '@mui/material';

/**
 * 사이드바 「포트폴리오 관리」 진입 시 — 내 활동 관리 페이지에 있던 관리 패널과 동일 UI.
 */
const CvManagePage = () => {
  useTrackPageView({ eventName: '[View] 포트폴리오 관리' });
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);

  return (
    <Flex.Column
      margin="1rem"
      gap="1.5rem"
      style={{ minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
    >
      <Flex.Column
        width="100%"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: isMobile ? 'min(72vh, 40rem)' : 'min(70vh, 42rem)',
        }}
      >
        <CvManagementPanel />
      </Flex.Column>
      <Footer />
    </Flex.Column>
  );
};

export default CvManagePage;
