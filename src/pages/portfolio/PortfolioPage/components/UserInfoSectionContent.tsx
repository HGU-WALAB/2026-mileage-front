import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { Flex, Input, Text } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import { styled, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
  normalizePortfolioProfileUrl,
  patchUserInfo,
  putPortfolioUserProfileImage,
} from '../../apis/portfolio';
import { PORTFOLIO_SECTION_ELEMENT_ID } from '../../constants/constants';
import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import { usePortfolioContext } from '../context/PortfolioContext';
import {
  PROMPT_QUALITY_SECTION_HINTS,
  usePortfolioPromptProgress,
} from '../utils/portfolioPromptProgress';
import SectionPromptQualityFooter from './SectionPromptQualityFooter';

const getProfileImageUrl = (filename: string | null | undefined): string | null =>
  filename?.trim()
    ? `${BASE_URL}${ENDPOINT.PORTFOLIO_USER_INFO_IMAGE}/${encodeURIComponent(filename.trim())}`
    : null;

interface UserInfoSectionContentProps {
  readOnly?: boolean;
}

/** 유저정보. 상단 고정, 타이틀 없음. name/department/major1·2 표시, bio만 수정 가능 */
const UserInfoSectionContent = ({ readOnly = false }: UserInfoSectionContentProps) => {
  const { userInfo, setUserInfo } = usePortfolioContext();
  const promptProgress = usePortfolioPromptProgress();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [linkActionLoading, setLinkActionLoading] = useState(false);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editLinkLabel, setEditLinkLabel] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');

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

  // 쿼리 리패치 중 userInfo가 잠시 undefined가 되어도 이미지가 사라지지 않도록
  // 마지막 유효한 URL을 유지
  const stableImageUrlRef = useRef<string | null>(profileImageUrl);
  if (profileImageUrl !== null) {
    stableImageUrlRef.current = profileImageUrl;
  }
  const displayImageUrl = stableImageUrlRef.current;

  // profile_image_url 값이 실제로 바뀔 때만 imageError를 리셋
  const prevProfileImageUrlRef = useRef<string | null | undefined>(
    userInfo?.profile_image_url,
  );
  useEffect(() => {
    if (prevProfileImageUrlRef.current !== userInfo?.profile_image_url) {
      prevProfileImageUrlRef.current = userInfo?.profile_image_url;
      setImageError(false);
    }
  }, [userInfo?.profile_image_url]);

  const handleEditImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다.');
        e.target.value = '';
        return;
      }
      setImageUploading(true);
      try {
        const res = await putPortfolioUserProfileImage(file);
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
    [setUserInfo],
  );

  const canSubmitNewLink =
    newLinkLabel.trim().length > 0 && newLinkUrl.trim().length > 0;

  const handleConfirmAddLink = useCallback(async () => {
    if (!canSubmitNewLink || !userInfo || linkActionLoading) return;
    setLinkActionLoading(true);
    try {
      const next = [
        ...(userInfo.profile_links ?? []),
        {
          label: newLinkLabel.trim(),
          url: normalizePortfolioProfileUrl(newLinkUrl.trim()),
        },
      ];
      const res = await patchUserInfo({ profile_links: next });
      setUserInfo(res);
      setNewLinkLabel('');
      setNewLinkUrl('');
      setShowAddLinkForm(false);
      setEditingLinkIndex(null);
      toast.success('프로필 링크가 추가되었습니다.');
    } catch {
      toast.error('프로필 링크 저장에 실패했습니다.');
    } finally {
      setLinkActionLoading(false);
    }
  }, [
    canSubmitNewLink,
    userInfo,
    linkActionLoading,
    newLinkLabel,
    newLinkUrl,
    setUserInfo,
  ]);

  const handleRemoveLink = useCallback(
    async (index: number) => {
      if (!userInfo || linkActionLoading) return;
      setLinkActionLoading(true);
      try {
        const next = (userInfo.profile_links ?? []).filter((_, i) => i !== index);
        const res = await patchUserInfo({ profile_links: next });
        setUserInfo(res);
        setEditingLinkIndex(null);
        toast.success('프로필 링크를 삭제했습니다.');
      } catch {
        toast.error('프로필 링크 삭제에 실패했습니다.');
      } finally {
        setLinkActionLoading(false);
      }
    },
    [userInfo, linkActionLoading, setUserInfo],
  );

  const handleCancelAddLink = useCallback(() => {
    setShowAddLinkForm(false);
    setNewLinkLabel('');
    setNewLinkUrl('');
  }, []);

  const openProfileLinkAddForm = useCallback(() => {
    setEditingLinkIndex(null);
    setEditLinkLabel('');
    setEditLinkUrl('');
    setShowAddLinkForm(true);
  }, []);

  const startEditLink = useCallback(
    (idx: number) => {
      const link = userInfo?.profile_links?.[idx];
      if (!link) return;
      setShowAddLinkForm(false);
      setNewLinkLabel('');
      setNewLinkUrl('');
      setEditingLinkIndex(idx);
      setEditLinkLabel(link.label);
      setEditLinkUrl(link.url);
    },
    [userInfo?.profile_links],
  );

  const cancelEditLink = useCallback(() => {
    setEditingLinkIndex(null);
    setEditLinkLabel('');
    setEditLinkUrl('');
  }, []);

  const canSubmitEditLink =
    editLinkLabel.trim().length > 0 && editLinkUrl.trim().length > 0;

  const handleSaveEditLink = useCallback(async () => {
    if (
      editingLinkIndex === null ||
      !userInfo ||
      !canSubmitEditLink ||
      linkActionLoading
    ) {
      return;
    }
    setLinkActionLoading(true);
    try {
      const list = [...(userInfo.profile_links ?? [])];
      list[editingLinkIndex] = {
        label: editLinkLabel.trim(),
        url: normalizePortfolioProfileUrl(editLinkUrl.trim()),
      };
      const res = await patchUserInfo({ profile_links: list });
      setUserInfo(res);
      cancelEditLink();
      toast.success('프로필 링크가 수정되었습니다.');
    } catch {
      toast.error('프로필 링크 수정에 실패했습니다.');
    } finally {
      setLinkActionLoading(false);
    }
  }, [
    editingLinkIndex,
    userInfo,
    canSubmitEditLink,
    linkActionLoading,
    editLinkLabel,
    editLinkUrl,
    setUserInfo,
    cancelEditLink,
  ]);

  const profileLinks = userInfo?.profile_links ?? [];
  const showProfileLinkAddBar = !readOnly && !showAddLinkForm;

  const profileLinkFieldSx = {
    minWidth: 0,
    '& .MuiOutlinedInput-root': {
      borderRadius: '0.5rem',
      backgroundColor: palette.white,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.grey200,
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.grey300,
    },
    '& .MuiInputBase-input': {
      fontSize: '0.875rem',
    },
  } as const;

  const labelColStyle = {
    flex: isMobile ? undefined : '0 0 8.5rem',
    width: isMobile ? '100%' : undefined,
    flexShrink: 0,
  };

  return (
    <S.Card id={PORTFOLIO_SECTION_ELEMENT_ID.intro}>
      <S.Inner>
        <S.AvatarWrap>
          {/* img 요소를 언마운트하지 않고 CSS로 숨겨서 깜빡임 방지 */}
          {displayImageUrl && (
            <S.AvatarImg
              src={displayImageUrl}
              alt="프로필"
              onError={() => setImageError(true)}
              style={{ display: imageError ? 'none' : 'block' }}
            />
          )}
          {(!displayImageUrl || imageError) && <S.Avatar />}
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
          <Flex.Row
            align="center"
            gap="0.5rem"
            wrap="wrap"
            style={{ minWidth: 0 }}
          >
            <Text
              style={{
                fontWeight: 700,
                fontSize: '1.5rem',
                lineHeight: 1.4,
                color: palette.nearBlack,
                margin: 0,
                minWidth: 0,
                wordBreak: 'break-word',
              }}
            >
              {name}
            </Text>
            {!readOnly && !isEditingBio ? (
              <S.EditBioButton type="button" onClick={handleStartEditBio}>
                <EditIcon sx={{ fontSize: 18 }} />
                수정
              </S.EditBioButton>
            ) : null}
          </Flex.Row>
          {!isEditingBio ? (
            <Text
              style={{
                color: palette.grey600,
                fontSize: '1.125rem',
                margin: 0,
              }}
            >
              {bio || '-'}
            </Text>
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

          <Flex.Column gap="0" width="100%" style={{ minWidth: 0 }}>
            {readOnly ? (
              <Flex.Column gap="0.75rem" width="100%">
                {profileLinks.length === 0 ? (
                  <Text
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: palette.grey400,
                    }}
                  >
                    등록된 링크가 없습니다.
                  </Text>
                ) : (
                  profileLinks.map((link, idx) => (
                    <S.ProfileLinkRow
                      key={`${link.url}-${idx}`}
                      align="center"
                      gap="0.75rem"
                      wrap="wrap"
                      width="100%"
                    >
                      <Flex.Column style={labelColStyle}>
                        <Text
                          style={{
                            margin: 0,
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: palette.nearBlack,
                          }}
                        >
                          {link.label.trim() || '링크'}
                        </Text>
                      </Flex.Column>
                      <Flex.Column style={{ flex: 1, minWidth: isMobile ? '100%' : '8rem' }}>
                        <Input
                          value={link.url}
                          size="small"
                          fullWidth
                          sx={profileLinkFieldSx}
                          inputProps={{
                            readOnly: true,
                            'aria-label': `${link.label} URL`,
                          }}
                        />
                      </Flex.Column>
                      <S.ProfileLinkAnchor
                        href={normalizePortfolioProfileUrl(link.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8125rem' }}
                      >
                        열기
                      </S.ProfileLinkAnchor>
                    </S.ProfileLinkRow>
                  ))
                )}
              </Flex.Column>
            ) : (
              <>
                {profileLinks.map((link, idx) => (
                  <S.ProfileLinkRow
                    key={`${link.url}-${idx}`}
                    align="center"
                    gap="0.5rem"
                    wrap="wrap"
                    width="100%"
                  >
                    {editingLinkIndex === idx ? (
                      <>
                        <Flex.Column style={labelColStyle}>
                          <Input
                            value={editLinkLabel}
                            onChange={e => setEditLinkLabel(e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="라벨"
                            disabled={linkActionLoading}
                            sx={profileLinkFieldSx}
                            inputProps={{
                              maxLength: INPUT_MAX_LENGTH.PROFILE_LINK_LABEL,
                              'aria-label': '프로필 링크 라벨 편집',
                            }}
                          />
                        </Flex.Column>
                        <Flex.Column style={{ flex: 1, minWidth: isMobile ? '100%' : '6rem' }}>
                          <Input
                            value={editLinkUrl}
                            onChange={e => setEditLinkUrl(e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="http://github.com/username/repo"
                            disabled={linkActionLoading}
                            sx={profileLinkFieldSx}
                            inputProps={{
                              maxLength: INPUT_MAX_LENGTH.PROFILE_LINK_URL,
                              'aria-label': '프로필 링크 URL 편집',
                            }}
                          />
                        </Flex.Column>
                        <Flex.Row gap="0.375rem" wrap="wrap">
                          <S.RowActionButton
                            type="button"
                            $variant="primary"
                            onClick={handleSaveEditLink}
                            disabled={!canSubmitEditLink || linkActionLoading}
                          >
                            저장
                          </S.RowActionButton>
                          <S.RowActionButton
                            type="button"
                            onClick={cancelEditLink}
                            disabled={linkActionLoading}
                          >
                            취소
                          </S.RowActionButton>
                        </Flex.Row>
                      </>
                    ) : (
                      <>
                        <Flex.Column style={labelColStyle}>
                          <Text
                            style={{
                              margin: 0,
                              fontSize: '0.9375rem',
                              fontWeight: 700,
                              color: palette.nearBlack,
                              lineHeight: 1.4,
                            }}
                          >
                            {link.label.trim() || '링크'}
                          </Text>
                        </Flex.Column>
                        <Flex.Column style={{ flex: 1, minWidth: isMobile ? '100%' : '6rem' }}>
                          <Input
                            value={link.url}
                            size="small"
                            fullWidth
                            sx={profileLinkFieldSx}
                            inputProps={{
                              readOnly: true,
                              'aria-label': `${link.label} URL`,
                            }}
                          />
                        </Flex.Column>
                        <Flex.Row gap="0.375rem" wrap="wrap">
                          <S.RowActionButton
                            type="button"
                            $variant="edit"
                            onClick={() => startEditLink(idx)}
                            disabled={
                              linkActionLoading ||
                              editingLinkIndex !== null ||
                              showAddLinkForm
                            }
                          >
                            수정
                          </S.RowActionButton>
                          <S.RowActionButton
                            type="button"
                            $variant="danger"
                            onClick={() => handleRemoveLink(idx)}
                            disabled={
                              linkActionLoading ||
                              editingLinkIndex !== null ||
                              showAddLinkForm
                            }
                          >
                            삭제
                          </S.RowActionButton>
                        </Flex.Row>
                      </>
                    )}
                  </S.ProfileLinkRow>
                ))}

                {showAddLinkForm ? (
                  <S.ProfileLinkRow
                    align="center"
                    gap="0.5rem"
                    wrap="wrap"
                    width="100%"
                  >
                    <Flex.Column style={labelColStyle}>
                      <Input
                        value={newLinkLabel}
                        onChange={e => setNewLinkLabel(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="라벨"
                        disabled={linkActionLoading}
                        sx={profileLinkFieldSx}
                        inputProps={{
                          maxLength: INPUT_MAX_LENGTH.PROFILE_LINK_LABEL,
                          'aria-label': '새 프로필 링크 라벨',
                        }}
                      />
                    </Flex.Column>
                    <Flex.Column style={{ flex: 1, minWidth: isMobile ? '100%' : '6rem' }}>
                      <Input
                        value={newLinkUrl}
                        onChange={e => setNewLinkUrl(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="http://github.com/username/repo"
                        disabled={linkActionLoading}
                        sx={profileLinkFieldSx}
                        inputProps={{
                          maxLength: INPUT_MAX_LENGTH.PROFILE_LINK_URL,
                          'aria-label': '새 프로필 링크 URL',
                        }}
                      />
                    </Flex.Column>
                    <Flex.Row gap="0.375rem" wrap="wrap" align="center">
                      <S.RowActionButton
                        type="button"
                        $variant="primary"
                        onClick={handleConfirmAddLink}
                        disabled={!canSubmitNewLink || linkActionLoading}
                      >
                        확인
                      </S.RowActionButton>
                      <S.RowActionButton
                        type="button"
                        onClick={handleCancelAddLink}
                        disabled={linkActionLoading}
                      >
                        취소
                      </S.RowActionButton>
                    </Flex.Row>
                  </S.ProfileLinkRow>
                ) : null}

                {showProfileLinkAddBar ? (
                  <S.ProfileLinkAddBar align="center" justify="space-between">
                    <Text
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: palette.grey600,
                      }}
                    >
                      프로필 링크 추가하기
                    </Text>
                    <S.AddIconButton
                      type="button"
                      onClick={openProfileLinkAddForm}
                      disabled={linkActionLoading || editingLinkIndex !== null}
                      aria-label="프로필 링크 추가. 라벨과 URL 입력 후 확인하세요."
                    >
                      <AddIcon sx={{ fontSize: 20, color: palette.blue500 }} />
                    </S.AddIconButton>
                  </S.ProfileLinkAddBar>
                ) : null}
              </>
            )}
          </Flex.Column>
        </Flex.Column>
      </S.Inner>
      <SectionPromptQualityFooter
        hint={PROMPT_QUALITY_SECTION_HINTS.intro}
        percent={promptProgress.intro}
      />
    </S.Card>
  );
};

export default UserInfoSectionContent;

const S = {
  ProfileLinkRow: styled(Flex.Row)`
    padding: 0.75rem 0;
    border-bottom: 1px solid ${palette.grey200};
    box-sizing: border-box;
  `,
  ProfileLinkAddBar: styled(Flex.Row)`
    padding: 0.75rem 0;
    border-bottom: 1px solid ${palette.grey200};
    box-sizing: border-box;
    width: 100%;
  `,
  AddIconButton: styled('button')`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    &:hover:not(:disabled) {
      background-color: ${palette.blue300};
    }
    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
  RowActionButton: styled('button')<{
    $variant?: 'primary' | 'danger' | 'edit';
  }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem 0.65rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    border-style: solid;
    border-width: ${({ $variant }) => ($variant === 'edit' ? '1.5px' : '1px')};
    border-color: ${({ $variant }) =>
      $variant === 'danger'
        ? palette.red600
        : $variant === 'primary'
          ? palette.blue500
          : $variant === 'edit'
            ? palette.blue400
            : palette.grey200};
    background-color: ${({ $variant }) =>
      $variant === 'primary' ? palette.blue500 : 'transparent'};
    color: ${({ $variant }) =>
      $variant === 'primary'
        ? palette.white
        : $variant === 'danger'
          ? palette.red600
          : $variant === 'edit'
            ? palette.blue500
            : palette.grey600};
    flex-shrink: 0;
    &:hover:not(:disabled) {
      ${({ $variant }) =>
        $variant === 'edit'
          ? `
          background-color: ${palette.blue300};
          color: ${palette.blue600};
        `
          : `
          opacity: 0.92;
        `}
    }
    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
  Card: styled('section')`
    display: flex;
    flex-direction: column;
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
  ProfileLinkAnchor: styled('a')`
    color: ${palette.blue500};
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    word-break: break-word;
    &:hover {
      text-decoration: underline;
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
