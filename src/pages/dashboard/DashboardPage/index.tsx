import { Flex, Footer } from '@/components';
import {
  CapabilitySection,
  NoAccessLogoutModal,
  ScholarshipDurationSection,
  ScholarshipStudentTypeSection,
} from './components';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import { useAuthStore } from '@/stores';

const DashboardPage = () => {
  useTrackPageView({ eventName: '[View] 대시보드 페이지' });

  const { student, term } = useAuthStore();

  return (
    <Flex.Column margin="1rem 1rem 2rem" gap="1rem">
      <Flex.Row justify="space-between" align="stretch" wrap="wrap" gap="1rem">
        <ScholarshipDurationSection />
        <ScholarshipStudentTypeSection />
      </Flex.Row>

      <CapabilitySection />

      {student.studentType === '기타' && term <= 9 && <NoAccessLogoutModal />}

      <Footer />
    </Flex.Column>
  );
};

export default DashboardPage;



