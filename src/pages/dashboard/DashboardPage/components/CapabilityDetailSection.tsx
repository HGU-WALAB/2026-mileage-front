import { LoadingIcon } from '@/assets';
import { ErrorBox, Flex, Heading } from '@/components';
import { useGetCapabilityQuery, useGetCapabilityDetailQuery } from '@/pages/dashboard/hooks';
import { boxShadow } from '@/styles/common';
import { styled } from '@mui/material';

import CapabilityDetailContent from './CapabilityDetailContent';

const CapabilityDetailSection = () => {
  const capabilityQuery = useGetCapabilityQuery();
  const detailQuery = useGetCapabilityDetailQuery();

  const isLoading = capabilityQuery.isLoading || detailQuery.isLoading;
  const isError = capabilityQuery.isError || detailQuery.isError;

  return (
    <S.Container height="300px" width="100%" padding="1rem" gap=".5rem">
      <Heading as="h3">나의 역량 상세 세부사항</Heading>

      <Flex.Row height="90%" width="100%" justify="center" align="center">
        {isLoading && <LoadingIcon width={100} height={100} />}
        {isError && (
          <ErrorBox error={(capabilityQuery.error ?? detailQuery.error) as any} />
        )}
        {!isLoading && !isError && <CapabilityDetailContent />}
      </Flex.Row>
    </S.Container>
  );
};

export default CapabilityDetailSection;

const S = {
  Container: styled(Flex.Column)`
    background-color: ${({ theme }) => theme.palette.variant.default};
    border-radius: 1rem;
    ${boxShadow}
  `,
};


