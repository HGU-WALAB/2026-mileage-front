import { AlertBoxIcon } from '@/assets';
import { BoxSkeleton, Flex, Heading, Text } from '@/components';
import { styled, useTheme } from '@mui/material';
import useGetAnnouncementQuery from '@/pages/profile/hooks/useGetAnnouncementQuery';

const ImportantNoticeSection = () => {
  const theme = useTheme();
  const { data: announcementData, isLoading } = useGetAnnouncementQuery();

  if (isLoading) return <BoxSkeleton height={100} />;

  return (
    <S.Container>
      <Flex.Row align="flex-start" gap="0.875rem">
        <S.IconWrapper>
          <AlertBoxIcon width={24} height={24} />
        </S.IconWrapper>
        <Flex.Column gap="0.375rem">
          <Heading
            as="h3"
            style={{
              fontWeight: 700,
              margin: 0,
              fontSize: '1.125rem',
              lineHeight: '1.5',
            }}
          >
            중요 안내사항
          </Heading>
          <Text
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[600],
              fontSize: '1rem',
              lineHeight: '1.5',
            }}
          >
            {announcementData?.announcement ?? ''}
          </Text>
        </Flex.Column>
      </Flex.Row>
    </S.Container>
  );
};

export default ImportantNoticeSection;

const S = {
  Container: styled(Flex.Row)`
    background-color: ${({ theme }) => theme.palette.primary.light};
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    width: 100%;
  `,
  IconWrapper: styled('div')`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    color: ${({ theme }) => theme.palette.primary.main};
    padding-top: 0.125rem;
  `,
};

