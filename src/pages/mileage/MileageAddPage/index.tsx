import { Flex, Footer } from '@/components';
import { EtcMileageSection, SubmittedMileageSection } from './components';
import { pageHeight } from '@/constants/layoutSize';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';

const MileageAddPage = () => {
  useTrackPageView({ eventName: '[View] 마일리지 등록 페이지' });

  return (
    <Flex.Column margin="1rem" height={pageHeight}>
      <EtcMileageSection />

      <SubmittedMileageSection />

      <Footer />
    </Flex.Column>
  );
};

export default MileageAddPage;



