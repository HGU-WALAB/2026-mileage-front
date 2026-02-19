import { Flex, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import ComputerIcon from '@mui/icons-material/ComputerOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useState } from 'react';
import { styled } from '@mui/material';
import { toast } from 'react-toastify';

import { patchUserInfo } from '../../apis/portfolio';
import { useSummaryContext } from '../context/SummaryContext';

/** 유저정보. 상단 고정, 타이틀 없음. name/department/major1·2 표시, bio만 수정 가능 */
const UserInfoSectionContent = () => {
  const { userInfo, setUserInfo } = useSummaryContext();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  const handleStartEditBio = useCallback(() => {
    setBioDraft(userInfo?.bio ?? '');
    setIsEditingBio(true);
  }, [userInfo?.bio]);

  const handleSaveBio = useCallback(async () => {
    try {
      const res = await patchUserInfo({ bio: bioDraft });
      setUserInfo(res);
      setIsEditingBio(false);
      toast.success('한 줄 소개가 저장되었습니다.');
    } catch {
      toast.error('한 줄 소개 저장에 실패했습니다.');
    }
  }, [bioDraft, setUserInfo]);

  const handleCancelEditBio = useCallback(() => {
    setBioDraft('');
    setIsEditingBio(false);
  }, []);

  const name = userInfo?.name ?? '-';
  const bio = userInfo?.bio ?? '';
  const department = userInfo?.department ?? '';
  const major1 = userInfo?.major1 ?? '';
  const major2 = userInfo?.major2 ?? '';
  const majorLine = [major1, major2].filter(Boolean).join(' / ') || '-';
  const departmentMajorLine =
    department.trim() !== '' ? `${department} ${majorLine}` : majorLine;

  return (
    <S.Card>
      <S.Inner>
        <S.Avatar />
        <Flex.Column gap="0.375rem" style={{ minWidth: 0, flex: 1 }}>
          <Text
            style={{
              fontWeight: 700,
              fontSize: '1.5rem',
              lineHeight: 1.4,
              color: palette.nearBlack,
              margin: 0,
            }}
          >
            {name}
          </Text>
          {!isEditingBio ? (
            <Flex.Row align="center" gap="0.5rem" wrap="wrap">
              <Text
                style={{
                  color: palette.grey600,
                  fontSize: '1.125rem',
                  margin: 0,
                }}
              >
                {bio || '-'}
              </Text>
              <S.EditBioButton type="button" onClick={handleStartEditBio}>
                <EditIcon sx={{ fontSize: 18 }} />
                수정
              </S.EditBioButton>
            </Flex.Row>
          ) : (
            <Flex.Column gap="0.5rem" style={{ width: '100%' }}>
              <S.BioTextarea
                value={bioDraft}
                onChange={e => setBioDraft(e.target.value)}
                placeholder="한 줄 소개를 입력하세요"
                rows={2}
              />
              <Flex.Row gap="0.5rem">
                <S.SmallButton type="button" onClick={handleSaveBio}>
                  저장
                </S.SmallButton>
                <S.SmallButton
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditBio}
                >
                  취소
                </S.SmallButton>
              </Flex.Row>
            </Flex.Column>
          )}
          <Text
            style={{
              color: palette.grey600,
              fontSize: '1.0625rem',
              margin: 0,
            }}
          >
            {departmentMajorLine}
          </Text>
        </Flex.Column>
      </S.Inner>
    </S.Card>
  );
};

export default UserInfoSectionContent;

const S = {
  Card: styled('section')`
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 0.75rem;
    padding: 1.25rem;
    width: 100%;
    ${boxShadow};
  `,
  Inner: styled(Flex.Row)`
    gap: 1.25rem;
    align-items: flex-start;
    flex-wrap: wrap;
  `,
  Avatar: styled('div')`
    width: 6rem;
    height: 6rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.grey[300]};
    flex-shrink: 0;
  `,
  EditBioButton: styled('button')`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border: 1.5px solid ${palette.blue400};
    border-radius: 0.375rem;
    background: transparent;
    color: ${palette.blue500};
    font-size: 0.8125rem;
    cursor: pointer;
    &:hover {
      background-color: ${palette.blue300};
      color: ${palette.blue600};
    }
  `,
  BioTextarea: styled('textarea')`
    width: 100%;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    border: 1.5px solid ${palette.blue400};
    border-radius: 0.5rem;
    font-size: 1rem;
    line-height: 1.5;
    color: ${palette.nearBlack};
    resize: vertical;
    outline: none;
    &:focus {
      border-color: ${palette.blue500};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
  `,
  SmallButton: styled('button')<{ variant?: 'outline' }>`
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid
      ${({ variant }) =>
        variant === 'outline' ? palette.grey300 : 'transparent'};
    background-color: ${({ variant }) =>
      variant === 'outline' ? 'transparent' : palette.blue500};
    color: ${({ variant }) =>
      variant === 'outline' ? palette.grey600 : palette.white};
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
};
