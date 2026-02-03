import { BoxSkeleton, Flex, Heading, Text } from '@/components';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import { styled, useTheme, useMediaQuery } from '@mui/material';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { getGitHubConnect } from '@/pages/profile/apis/github';
import useGetGitHubStatusQuery from '@/pages/profile/hooks/useGetGitHubStatusQuery';
import useDeleteGitHubConnectMutation from '@/pages/profile/hooks/useDeleteGitHubConnectMutation';

const GitHubAccountSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { data: githubStatus, isLoading } = useGetGitHubStatusQuery();
  const { mutate: deleteGitHubConnect } = useDeleteGitHubConnectMutation();

  const handleConnect = () => {
    getGitHubConnect();
    // OAuth 리다이렉트가 자동으로 발생합니다
  };

  const handleDisconnect = () => {
    deleteGitHubConnect();
  };

  if (isLoading) return <BoxSkeleton height={150} />;

  const isConnected = githubStatus?.connected ?? false;
  const githubUsername = githubStatus?.githubUsername ?? '';

  return (
    <S.Container>
      {isMobile ? (
        <Flex.Column gap="0.75rem" margin="0 0 1rem">
          <Flex.Row justify="space-between" align="center">
            <Heading
              as="h3"
              style={{
                fontWeight: 700,
                margin: 0,
                fontSize: '1.125rem',
                lineHeight: '1.5',
              }}
            >
              Github 계정
            </Heading>
            {isConnected ? (
              <S.DisconnectButton onClick={handleDisconnect}>
                <CloseIcon sx={{ fontSize: 20 }} />
                <Text
                  style={{
                    ...theme.typography.body2,
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                >
                  연결 해제
                </Text>
              </S.DisconnectButton>
            ) : (
              <S.ConnectButton onClick={handleConnect}>
                <LinkIcon sx={{ fontSize: 20 }} />
                <Text
                  style={{
                    ...theme.typography.body2,
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                >
                  연결
                </Text>
              </S.ConnectButton>
            )}
          </Flex.Row>
          <Text
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[500],
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          >
            * 개인 계정을 연결하여 추가 기능을 사용할 수 있습니다.
          </Text>
        </Flex.Column>
      ) : (
        <Flex.Row justify="space-between" align="center" margin="0 0 1rem">
          <Flex.Row align="center" gap="0.75rem" style={{ flex: 1 }}>
            <Heading
              as="h3"
              style={{
                fontWeight: 700,
                margin: 0,
                fontSize: '1.125rem',
                lineHeight: '1.5',
              }}
            >
              Github 계정
            </Heading>
            <Text
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[500],
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
            >
              * 개인 계정을 연결하여 추가 기능을 사용할 수 있습니다.
            </Text>
          </Flex.Row>
          {isConnected ? (
            <S.DisconnectButton onClick={handleDisconnect}>
              <CloseIcon sx={{ fontSize: 20 }} />
              <Text
                style={{
                  ...theme.typography.body2,
                  fontWeight: 500,
                  fontSize: '1rem',
                }}
              >
                연결 해제
              </Text>
            </S.DisconnectButton>
          ) : (
            <S.ConnectButton onClick={handleConnect}>
              <LinkIcon sx={{ fontSize: 20 }} />
              <Text
                style={{
                  ...theme.typography.body2,
                  fontWeight: 500,
                  fontSize: '1rem',
                }}
              >
                연결
              </Text>
            </S.ConnectButton>
          )}
        </Flex.Row>
      )}

      <S.InfoRow>
        <S.LabelWrapper>
          <Text
            style={{
              ...theme.typography.body2,
              fontWeight: 700,
              color: '#575757',
              fontSize: '1rem',
              lineHeight: '1.5',
            }}
          >
            아이디
          </Text>
        </S.LabelWrapper>
        <Text
          style={{
            ...theme.typography.body2,
            color: isConnected ? theme.palette.common.black : '#999999',
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: '1.5',
          }}
        >
          {isConnected ? `@${githubUsername}` : '연결되지 않음'}
        </Text>
      </S.InfoRow>
    </S.Container>
  );
};

export default GitHubAccountSection;

const S = {
  Container: styled(Flex.Column)`
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 0.75rem;
    padding: 1.25rem;
    width: 100%;
  `,
  ConnectButton: styled(Flex.Row)`
    align-items: center;
    gap: 0.375rem;
    color: ${({ theme }) => theme.palette.primary.main};
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      opacity: 0.8;
    }
  `,
  DisconnectButton: styled(Flex.Row)`
    align-items: center;
    gap: 0.375rem;
    color: #EF4444;
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      opacity: 0.8;
    }
  `,
  LabelWrapper: styled('div')`
    width: 7rem;
    flex-shrink: 0;
  `,
  InfoRow: styled(Flex.Row)`
    align-items: center;
    padding: 0.875rem 0;
    gap: 1.5rem;
  `,
};

