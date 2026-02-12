import { Flex, Footer, Heading } from '@/components';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';

const SummaryPage = () => {
  useTrackPageView({ eventName: '[View] 활동 요약' });

  return (
    <Flex.Column margin="1rem" gap="1.5rem">
      <Heading as="h2">활동 요약</Heading>
      <Footer />
    </Flex.Column>
  );
};

export default SummaryPage;
