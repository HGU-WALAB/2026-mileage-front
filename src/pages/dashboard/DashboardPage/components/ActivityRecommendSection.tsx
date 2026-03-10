import { LoadingIcon } from '@/assets';
import { ErrorBox, Flex, Heading } from '@/components';
import { useGetActivityRecommendQuery } from '@/pages/dashboard/hooks';
import { boxShadow } from '@/styles/common';
import { styled } from '@mui/material';

import ActivityRecommendContent from './ActivityRecommendContent';

const ActivityRecommendSection = () => {
  const { isLoading, isError, error } = useGetActivityRecommendQuery();

  return (
    <S.Container height="300px" width="100%" padding="1rem" gap=".5rem">
      <Heading as="h3">역량 강화 활동 추천</Heading>

      <Flex.Row height="90%" width="100%" justify="center" align="center">
        {isLoading && <LoadingIcon width={100} height={100} />}
        {isError && <ErrorBox error={error} />}
        {!isLoading && !isError && <ActivityRecommendContent />}
      </Flex.Row>
    </S.Container>
  );
};

export default ActivityRecommendSection;

const S = {
  Container: styled(Flex.Column)`
    background-color: ${({ theme }) => theme.palette.variant.default};
    border-radius: 1rem;
    ${boxShadow}
  `,
};











