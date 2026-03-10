import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { Flex, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';
import { toast } from 'react-toastify';

import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import { patchUserInfo, patchUserInfoWithImage } from '../../apis/portfolio';
import { useSummaryContext } from '../context/SummaryContext';

const getProfileImageUrl = (filename: string | null | undefined): string | null =>
  filename?.trim()
    ? `${BASE_URL}${ENDPOINT.PORTFOLIO_USER_INFO_IMAGE}/${encodeURIComponent(filename.trim())}`
    : null;

interface UserInfoSectionContentProps {
  readOnly?: boolean;
}

/** 유저정보. 상단 고정, 타이틀 없음. name/department/major1·2 표시, bio만 수정 가능 */
const UserInfoSectionContent = ({ readOnly = false }: UserInfoSectionContentProps) => {
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

  const profileImageUrl = getProfileImageUrl(userInfo?.profile_image_url ?? null);
  const [imageError, setImageError] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageError(false);
  }, [userInfo?.profile_image_url]);

  const showProfileImage = Boolean(profileImageUrl && !imageError);

  const handleEditImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !userInfo) return;
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다.');
        e.target.value = '';
        return;
      }
      setImageUploading(true);
      try {
        const res = await patchUserInfoWithImage(userInfo.bio ?? '', file);
        setUserInfo(res);
        setImageError(false);
        toast.success('프로필 이미지가 변경되었습니다.');
      } catch {
        toast.error('프로필 이미지 변경에 실패했습니다.');
      } finally {
        setImageUploading(false);
        e.target.value = '';
      }
    },
    [userInfo, setUserInfo],
  );

  return (
    <S.Card>
      <S.Inner>
        <S.AvatarWrap>
          {showProfileImage ? (
            <S.AvatarImg
              src={profileImageUrl!}
              alt="프로필"
              onError={() => setImageError(true)}
            />
          ) : (
            <S.Avatar />
          )}
          {!readOnly && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
                aria-hidden
              />
              <S.EditImageButton
                type="button"
                onClick={handleEditImageClick}
                disabled={imageUploading}
                title="이미지 수정"
              >
                <CameraAltIcon sx={{ fontSize: 20 }} />
              </S.EditImageButton>
            </>
          )}
        </S.AvatarWrap>
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
              {!readOnly && (
                <S.EditBioButton type="button" onClick={handleStartEditBio}>
                  <EditIcon sx={{ fontSize: 18 }} />
                  수정
                </S.EditBioButton>
              )}
            </Flex.Row>
          ) : !readOnly ? (
            <Flex.Column gap="0.5rem" style={{ width: '100%' }}>
              <S.BioTextarea
                value={bioDraft}
                onChange={e => setBioDraft(e.target.value)}
                placeholder="한 줄 소개를 입력하세요"
                rows={3}
                maxLength={INPUT_MAX_LENGTH.BIO}
              />
              <Flex.Row align="center" justify="space-between">
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
                <S.CharCount warn={bioDraft.length >= INPUT_MAX_LENGTH.BIO - 20}>
                  {bioDraft.length} / {INPUT_MAX_LENGTH.BIO}
                </S.CharCount>
              </Flex.Row>
            </Flex.Column>
          ) : null}
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
  AvatarWrap: styled('div')`
    position: relative;
    flex-shrink: 0;
    width: 6rem;
    height: 6rem;
  `,
  Avatar: styled('div')`
    width: 6rem;
    height: 6rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.grey[300]};
  `,
  AvatarImg: styled('img')`
    width: 6rem;
    height: 6rem;
    border-radius: 0.5rem;
    object-fit: cover;
    display: block;
  `,
  EditImageButton: styled('button')`
    position: absolute;
    top: -0.25rem;
    right: -0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    border: 1.5px solid ${palette.blue400};
    background-color: ${palette.white};
    color: ${palette.blue500};
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
    &:hover:not(:disabled) {
      background-color: ${palette.blue300};
      color: ${palette.blue600};
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
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
    min-height: 5rem;
    padding: 0.625rem 0.875rem;
    border: 1.5px solid ${palette.blue400};
    border-radius: 0.5rem;
    font-size: 1rem;
    line-height: 1.6;
    color: ${palette.nearBlack};
    resize: vertical;
    outline: none;
    &:focus {
      border-color: ${palette.blue500};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
  `,
  CharCount: styled('span')<{ warn?: boolean }>`
    font-size: 0.75rem;
    color: ${({ warn }) => (warn ? palette.pink500 : palette.grey400)};
    flex-shrink: 0;
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
