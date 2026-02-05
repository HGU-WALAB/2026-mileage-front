import { Flex } from '@/components';

import ChartSection from './ChartSection';
import RecommendSection from './RecommendSection';

const CapabilitySection = () => {
  return (
    <Flex.Column gap="1rem">
      <ChartSection />

      <RecommendSection />
    </Flex.Column>
  );
};

export default CapabilitySection;











