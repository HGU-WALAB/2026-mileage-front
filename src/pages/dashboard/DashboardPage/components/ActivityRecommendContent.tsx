import { Flex, Heading, Text } from '@/components';
import { useGetActivityRecommendQuery } from '@/pages/dashboard/hooks';
import { styled } from '@mui/material';

const ActivityRecommendContent = () => {
  const { data: activityRecommend } = useGetActivityRecommendQuery();

  if (!activityRecommend) return null;
  return (
    <Flex.Column justify="space-around" gap=".5rem" height="100%" width="100%">
      <Flex.Column>
        <Flex.Row align="center" gap="0.5rem">
          <Text as="p" style={{ fontWeight: 500 }}>
            ⚠️ 현재 상대적으로 부족한 역량은
            <strong style={{ color: '#1976d2' }}>
              {' '}
              "{activityRecommend.capabilityName}"
            </strong>
            이에요.
          </Text>
        </Flex.Row>

        <Text as="p" style={{ marginTop: '.5rem' }}>
          아래 활동들을 참여해 역량 성장을 할 수 있어요!
        </Text>
      </Flex.Column>

      <Flex.Column gap=".5rem">
        <Heading as="h4">💡 이런 활동을 추천드려요:</Heading>

        <S.RecommendBox justify="center" align="center">
          <Text bold>{activityRecommend.suggestion.join(', ')}</Text>
        </S.RecommendBox>
      </Flex.Column>
    </Flex.Column>
  );
};

export default ActivityRecommendContent;

const S = {
  RecommendBox: styled(Flex.Row)`
    background-color: ${({ theme }) => theme.palette.primary.light};
    border: 2px solid ${({ theme }) => theme.palette.primary.main};
    border-radius: 1rem;
    color: ${({ theme }) => theme.palette.primary.main};
    padding: 1.5rem 2rem;
    width: 100%;
  `,
};


