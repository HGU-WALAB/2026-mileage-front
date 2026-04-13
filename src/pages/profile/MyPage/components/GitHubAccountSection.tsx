import { BoxSkeleton, Button, Flex, Heading, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Dialog,
  DialogContent,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { getGitHubConnect } from '@/pages/profile/apis/github';
import useGetGitHubStatusQuery from '@/pages/profile/hooks/useGetGitHubStatusQuery';
import useDeleteGitHubConnectMutation from '@/pages/profile/hooks/useDeleteGitHubConnectMutation';
import { useEffect, useState } from 'react';

const DeleteOutlineIconWrap: React.FunctionComponent<
  React.SVGProps<SVGSVGElement>
> = () => <DeleteOutlineIcon sx={{ fontSize: 18 }} />;

const GitHubAccountSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { data: githubStatus, isLoading } = useGetGitHubStatusQuery();
  const { mutate: deleteGitHubConnect, isPending: isDisconnecting } =
    useDeleteGitHubConnectMutation();

  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);

  const handleConnect = () => {
    getGitHubConnect();
    // OAuth 리다이렉트가 자동으로 발생합니다
  };

  const handleDisconnect = () => {
    setDisconnectConfirmOpen(true);
  };

  useEffect(() => {
    if (disconnectConfirmOpen && !githubStatus?.connected) {
      setDisconnectConfirmOpen(false);
    }
  }, [disconnectConfirmOpen, githubStatus?.connected]);

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
        {isConnected && githubUsername ? (
          <S.GitHubLink
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{githubUsername}
          </S.GitHubLink>
        ) : (
          <Text
            style={{
              ...theme.typography.body2,
              color: '#999999',
              fontWeight: 700,
              fontSize: '1rem',
              lineHeight: '1.5',
            }}
          >
            연결되지 않음
          </Text>
        )}
      </S.InfoRow>

      <Dialog
        open={disconnectConfirmOpen}
        aria-labelledby="github-disconnect-confirm-title"
        onClose={() => {
          if (isDisconnecting) return;
          setDisconnectConfirmOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0.75rem',
            border: `1px solid ${palette.grey200}`,
            boxShadow: '0 4px 24px rgba(83, 127, 241, 0.15)',
            width: '100%',
            maxWidth: '26rem',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent
          sx={{
            p: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Flex.Row align="flex-start" gap="0.5rem" width="100%" style={{ minWidth: 0 }}>
            <DeleteOutlineIcon
              sx={{ fontSize: 22, color: palette.red500, flexShrink: 0, marginTop: '0.125rem' }}
              aria-hidden
            />
            <Flex.Column gap="0.5rem" style={{ flex: '1 1 auto', minWidth: 0 }}>
              <Heading
                as="h2"
                margin="0"
                color={palette.nearBlack}
                id="github-disconnect-confirm-title"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                깃허브 계정 연결을 해제할까요?
              </Heading>
              <Text
                margin="0"
                color={palette.grey600}
                style={{ fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all' }}
              >
                연결을 해제하면 선택했던 레포지토리 정보 및 변경사항이 전부 사라지며, 되돌릴 수
                없습니다.
              </Text>
            </Flex.Column>
          </Flex.Row>
          <S.ConfirmDialogActions>
            <Flex.Row align="center" justify="flex-end" gap="0.5rem" wrap="wrap" width="100%">
              <Button
                label="취소"
                variant="outlined"
                color="grey"
                size="medium"
                onClick={() => setDisconnectConfirmOpen(false)}
                disabled={isDisconnecting}
              />
              <Button
                label="연결 해제"
                variant="outlined"
                color="red"
                size="medium"
                icon={DeleteOutlineIconWrap}
                iconPosition="start"
                onClick={() => {
                  deleteGitHubConnect(undefined, {
                    onSuccess: () => setDisconnectConfirmOpen(false),
                  });
                }}
                disabled={isDisconnecting}
              />
            </Flex.Row>
          </S.ConfirmDialogActions>
        </DialogContent>
      </Dialog>
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
    ${boxShadow};
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
  GitHubLink: styled('a')`
    ${({ theme }) => theme.typography.body2};
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.palette.primary.main};
    text-decoration: underline;
    cursor: pointer;
    &:hover {
      opacity: 0.9;
    }
  `,
  ConfirmDialogActions: styled('div')`
    box-sizing: border-box;
    margin: 0 -1.5rem -1.25rem;
    padding: 0.85rem 1.5rem 1rem;
    border-top: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
  `,
};

