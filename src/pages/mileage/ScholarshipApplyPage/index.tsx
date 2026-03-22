import { Flex, Footer } from '@/components';
import {
  ApplySection,
  ConsentSection,
  FAQSection,
  MileageBannerSection,
  NotScholarshipDurationSection,
  ProcessSection,
} from './components';
import {
  useGetIsAppliedScholarshipQuery,
  useScholarshipDuration,
} from '@/pages/mileage/hooks';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import { useState } from 'react';

const ScholarshipApplyPage = () => {
  useTrackPageView({ eventName: '[View] 장학금 신청 페이지' });

  const [isAgree, setIsAgree] = useState(false);
  const { data: isApplied } = useGetIsAppliedScholarshipQuery();

  const { isScholarshipDuration } = useScholarshipDuration();

  return (
    <Flex.Column gap="1rem">
      <MileageBannerSection />

      <Flex.Column margin="0 1rem" gap="1rem">
        <ProcessSection />

        {isScholarshipDuration ? (
          <>
            <Flex.Column margin="2rem 0" gap="1rem">
              <ConsentSection
                isAgree={isAgree}
                handleAgree={setIsAgree}
                isApplied={isApplied?.isApply ?? 0}
              />

              <ApplySection isAgree={isAgree} />
            </Flex.Column>
          </>
        ) : (
          <Flex.Column margin="2rem 0">
            <NotScholarshipDurationSection />
          </Flex.Column>
        )}

        <FAQSection />
      </Flex.Column>

      <Footer />
    </Flex.Column>
  );
};

export default ScholarshipApplyPage;



