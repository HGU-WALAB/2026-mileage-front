import { BoxSkeleton, Flex, Heading, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { useGetUserInfoQuery, useLogin } from '@/pages/auth/hooks';
import { getDate } from '@/utils/getDate';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled, useTheme, useMediaQuery } from '@mui/material';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useState } from 'react';

import { UpdateConfirmModal, UpdateSucceedModal } from '.';
import infoLabels from './InfoLabels';

const UserInfoSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { data: userInfo, isLoading } = useGetUserInfoQuery();
  const { handleHisnetAuth, isLoginSucceed } = useLogin();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const customOrder = [
    'studentName',
    'studentId',
    'grade',
    'major1',
    'studentEmail',
  ];

  const handleRefreshAuth = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    handleHisnetAuth();
  };

  if (isLoading) return <BoxSkeleton height={400} />;

  const formatValue = (key: string, value: string, userInfo: any) => {
    if (key === 'grade') {
      const grade = value ? `${value}학년` : '';
      const term = userInfo?.term ? `(${userInfo.term}학기)` : '';
      return term ? `${grade}${term}` : grade;
    }
    if (key === 'major1') {
      const major1 = value || '';
      const major2 = userInfo?.major2 || '';
      if (major1 && major2) {
        return `${major1} / ${major2}`;
      }
      return major1 || major2;
    }
    return value;
  };

  return (
    <S.Container>
      {isMobile ? (
        <Flex.Column gap="0.75rem" margin="0 0 1rem">
          <Flex.Row justify="space-between" align="center" width="100%">
            <Heading
              as="h3"
              style={{
                fontWeight: 700,
                margin: 0,
                fontSize: '1.125rem',
                lineHeight: '1.5',
              }}
            >
              학생 정보
            </Heading>
            <S.UpdateButton onClick={handleRefreshAuth}>
              <RefreshIcon sx={{ fontSize: 20 }} />
              <Text
                style={{
                  ...theme.typography.body2,
                  fontWeight: 500,
                  fontSize: '1rem',
                }}
              >
                정보 업데이트
              </Text>
            </S.UpdateButton>
          </Flex.Row>
          <Text
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[500],
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          >
            * 아래 정보는 히즈넷에서 자동으로 가져온 데이터입니다.
          </Text>
          <UpdateConfirmModal
            isOpen={isConfirmModalOpen}
            onConfirm={handleConfirmUpdate}
            onClose={() => setIsConfirmModalOpen(false)}
          />
          <UpdateSucceedModal isSucceed={isLoginSucceed} />
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
              학생 정보
            </Heading>
            <Text
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[500],
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
            >
              * 아래 정보는 히즈넷에서 자동으로 가져온 데이터입니다.
            </Text>
          </Flex.Row>
          <S.UpdateButton onClick={handleRefreshAuth}>
            <RefreshIcon sx={{ fontSize: 20 }} />
            <Text
              style={{
                ...theme.typography.body2,
                fontWeight: 500,
                fontSize: '1rem',
              }}
            >
              정보 업데이트
            </Text>
          </S.UpdateButton>
          <UpdateConfirmModal
            isOpen={isConfirmModalOpen}
            onConfirm={handleConfirmUpdate}
            onClose={() => setIsConfirmModalOpen(false)}
          />
          <UpdateSucceedModal isSucceed={isLoginSucceed} />
        </Flex.Row>
      )}

      <S.InfoList>
      {Object.entries(userInfo ?? [])
        .filter(([key]) => customOrder.includes(key))
        .sort(
          ([keyA], [keyB]) =>
            customOrder.indexOf(keyA) - customOrder.indexOf(keyB),
        )
        .map(([key, value]) => (
            <S.InfoRow key={key}>
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
                  {infoLabels[key] || key}
                </Text>
              </S.LabelWrapper>
              <Text
                style={{
                  ...theme.typography.body2,
                  color: theme.palette.common.black,
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  wordBreak: isMobile ? 'break-all' : 'normal',
                  overflowWrap: isMobile ? 'break-word' : 'normal',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {formatValue(key, value as string, userInfo)}
              </Text>
            </S.InfoRow>
          ))}
      </S.InfoList>

      <S.LastUpdateRow>
        <S.LabelWrapper>
          <Text
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[500],
              fontSize: '1rem',
              lineHeight: '1.5',
            }}
          >
            마지막 업데이트
          </Text>
        </S.LabelWrapper>
        <Text
          style={{
            ...theme.typography.body2,
            color: theme.palette.grey[600],
            fontSize: '1rem',
            lineHeight: '1.5',
          }}
        >
          {getDate(userInfo?.modDate ?? '')}
        </Text>
      </S.LastUpdateRow>
    </S.Container>
  );
};

export default UserInfoSection;

const S = {
  Container: styled(Flex.Column)`
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 0.75rem;
    padding: 1.25rem;
    width: 100%;
    ${boxShadow};
  `,
  UpdateButton: styled(Flex.Row)`
    align-items: center;
    gap: 0.375rem;
    color: ${({ theme }) => theme.palette.primary.main};
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    &:hover {
      opacity: 0.8;
    }
  `,
  InfoList: styled(Flex.Column)`
    gap: 0;
  `,
  LabelWrapper: styled('div')`
    width: 7rem;
    flex-shrink: 0;
  `,
  InfoRow: styled(Flex.Row)`
    align-items: center;
    padding: 0.875rem 0;
    border-bottom: 4px solid #F3F4F6;
    gap: 1.5rem;
    min-width: 0;
    &:last-of-type {
      border-bottom: none;
    }
  `,
  LastUpdateRow: styled(Flex.Row)`
    align-items: center;
    padding: 0.875rem 0 0;
    margin-top: 0.5rem;
    border-top: 4px solid #F3F4F6;
    gap: 1.5rem;
  `,
};
