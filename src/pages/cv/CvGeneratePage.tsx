import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { Button, Flex, Text } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Button as MuiButton, Checkbox, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { TechStackSectionContent } from '@/pages/summary/SummaryPage/components';
import { formatDateRange } from '@/pages/summary/utils/date';
import {
  type ActivityItem,
  type MileageItem,
  type RepoItem,
  useSummaryContext,
} from '@/pages/summary/SummaryPage/context/SummaryContext';

import {
  readCvWizardStep1Selection,
  writeCvWizardStep1Selection,
} from './constants/cvWizardStorage';

const STEPS = [
  { n: 1, label: '항목 선택' },
  { n: 2, label: 'JD 입력' },
  { n: 3, label: '프롬프트 생성' },
  { n: 4, label: '결과 저장' },
] as const;

const getProfileImageUrl = (filename: string | null | undefined): string | null =>
  filename?.trim()
    ? `${BASE_URL}${ENDPOINT.PORTFOLIO_USER_INFO_IMAGE}/${encodeURIComponent(filename.trim())}`
    : null;

function repoSelectionId(r: RepoItem): number {
  return r.id ?? r.repo_id;
}

function toggleInList(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
}

const CvGeneratePage = () => {
  useTrackPageView({ eventName: '[View] CV 생성기' });
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { userInfo, repos, mileageItems, activities } = useSummaryContext();

  const [selectedMileageIds, setSelectedMileageIds] = useState<number[]>(
    () => readCvWizardStep1Selection()?.selected_mileage_ids ?? [],
  );
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>(
    () => readCvWizardStep1Selection()?.selected_activity_ids ?? [],
  );
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>(
    () => readCvWizardStep1Selection()?.selected_repo_ids ?? [],
  );

  const visibleRepos = useMemo(
    () => (Array.isArray(repos) ? repos.filter(r => r.is_visible) : []),
    [repos],
  );

  useEffect(() => {
    if (mileageItems.length === 0) return;
    setSelectedMileageIds(prev =>
      prev.filter(id => mileageItems.some(m => m.id === id)),
    );
  }, [mileageItems]);

  useEffect(() => {
    if (activities.length === 0) return;
    setSelectedActivityIds(prev =>
      prev.filter(id => activities.some(a => a.id === id)),
    );
  }, [activities]);

  useEffect(() => {
    if (visibleRepos.length === 0) return;
    setSelectedRepoIds(prev =>
      prev.filter(id => visibleRepos.some(r => repoSelectionId(r) === id)),
    );
  }, [visibleRepos]);

  const handleBack = useCallback(() => {
    navigate(ROUTE_PATH.summary);
  }, [navigate]);

  const handleNext = useCallback(() => {
    const mileageIds = mileageItems
      .filter(m => m.id != null && selectedMileageIds.includes(m.id!))
      .map(m => m.id!);
    const activityIds = activities
      .filter(a => selectedActivityIds.includes(a.id))
      .map(a => a.id);
    const repoIds = visibleRepos
      .filter(r => selectedRepoIds.includes(repoSelectionId(r)))
      .map(r => repoSelectionId(r));

    writeCvWizardStep1Selection({
      selected_mileage_ids: mileageIds,
      selected_activity_ids: activityIds,
      selected_repo_ids: repoIds,
    });
    toast.info('선택 항목이 저장되었습니다. JD 입력 단계는 준비 중입니다.');
  }, [
    activities,
    mileageItems,
    selectedActivityIds,
    selectedMileageIds,
    selectedRepoIds,
    visibleRepos,
  ]);

  const name = userInfo?.name ?? '-';
  const bio = userInfo?.bio ?? '';
  const department = userInfo?.department ?? '';
  const major1 = userInfo?.major1 ?? '';
  const major2 = userInfo?.major2 ?? '';
  const majorLine = [major1, major2].filter(Boolean).join(' / ') || '-';
  const departmentMajorLine =
    department.trim() !== '' ? `${department} ${majorLine}` : majorLine;
  const gradeLine =
    userInfo != null
      ? `${userInfo.grade}학년 ${userInfo.semester}학기`
      : '';

  const profileImageUrl = getProfileImageUrl(userInfo?.profile_image_url ?? null);

  return (
    <Flex.Column
      margin="1rem"
      gap="1.25rem"
      width="100%"
      style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', minWidth: 0 }}
    >
      <Flex.Row align="center" gap="0.75rem" wrap="wrap">
        <S.BackButton
          type="button"
          variant="outlined"
          onClick={handleBack}
          aria-label="내 활동 관리로 뒤로가기"
          startIcon={<ArrowBackIcon sx={{ fontSize: 20, color: 'inherit' }} />}
        >
          뒤로가기
        </S.BackButton>
      </Flex.Row>

      <Flex.Column gap="0.35rem" width="100%">
        <Text
          as="h1"
          margin="0"
          bold
          color={palette.nearBlack}
          style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', lineHeight: 1.35 }}
        >
          CV 생성기
        </Text>
        <Text margin="0" color={palette.grey600} style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>
          마일리지 항목으로 맞춤 CV 프롬프트를 만들고 히스토리로 관리하세요
        </Text>
      </Flex.Column>

      <S.Card>
        <S.StepperRow role="list" aria-label="진행 단계">
          {STEPS.map((step, idx) => (
            <Fragment key={step.n}>
              <Flex.Column
                align="center"
                gap="0.35rem"
                style={{ width: '4.75rem', flexShrink: 0 }}
              >
                <S.StepCircle
                  $active={step.n === 1}
                  $muted={step.n !== 1}
                  aria-current={step.n === 1 ? 'step' : undefined}
                >
                  {step.n}
                </S.StepCircle>
                <S.StepLabel $active={step.n === 1}>{step.label}</S.StepLabel>
              </Flex.Column>
              {idx < STEPS.length - 1 ? <S.StepConnector aria-hidden /> : null}
            </Fragment>
          ))}
        </S.StepperRow>

        <Flex.Column gap="1.25rem" width="100%" style={{ marginTop: '1.5rem' }}>
          <Flex.Column gap="0.35rem" width="100%">
            <Text as="h2" margin="0" bold style={{ fontSize: '1.125rem' }}>
              어떤 항목을 포함할까요?
            </Text>
            <Text margin="0" color={palette.grey600} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              CV에 넣을 마일리지·레포지토리·활동을 선택하세요. 프로필과 기술 스택은 자동으로 포함됩니다.
            </Text>
          </Flex.Column>

          <S.HighlightSection>
            <Flex.Row align="center" gap="0.5rem" wrap="wrap">
              <PersonOutlineIcon sx={{ fontSize: 22, color: palette.blue500 }} />
              <Text margin="0" bold style={{ fontSize: '1rem' }}>
                프로필 (자동 포함)
              </Text>
            </Flex.Row>
            <Text margin="0" color={palette.grey600} style={{ fontSize: '0.8125rem' }}>
              My Info에서 프로필을 먼저 작성해 두면 CV 프롬프트에 반영됩니다.
            </Text>
            <S.ProfileInner align="flex-start" gap="1rem" wrap="wrap">
              <S.AvatarBox>
                {profileImageUrl ? (
                  <S.AvatarImg src={profileImageUrl} alt="" />
                ) : null}
              </S.AvatarBox>
              <Flex.Column gap="0.35rem" style={{ flex: '1 1 12rem', minWidth: 0 }}>
                <Text margin="0" bold style={{ fontSize: '1.25rem' }}>
                  {name}
                </Text>
                <Text margin="0" color={palette.grey600} style={{ fontSize: '0.9375rem' }}>
                  {bio || '-'}
                </Text>
                <Text margin="0" color={palette.grey600} style={{ fontSize: '0.9375rem' }}>
                  {departmentMajorLine}
                </Text>
                {gradeLine ? (
                  <Text margin="0" color={palette.grey500} style={{ fontSize: '0.875rem' }}>
                    {gradeLine}
                  </Text>
                ) : null}
              </Flex.Column>
            </S.ProfileInner>
          </S.HighlightSection>

          <S.SectionBlock>
            <Flex.Row align="center" gap="0.5rem" wrap="wrap" style={{ marginBottom: '0.65rem' }}>
              <MenuBookIcon sx={{ fontSize: 20, color: palette.grey600 }} />
              <Text margin="0" bold style={{ fontSize: '1rem' }}>
                기술 스택 (자동 포함)
              </Text>
            </Flex.Row>
            <TechStackSectionContent readOnly />
          </S.SectionBlock>

          <SelectableSection
            title="마일리지 항목"
            countLabel={`${selectedMileageIds.length}개 선택`}
            itemCount={mileageItems.length}
            icon={<MenuBookIcon sx={{ fontSize: 20, color: palette.grey600 }} />}
            emptyText="포트폴리오에 등록된 마일리지가 없습니다. 내 활동 관리에서 마일리지를 추가하세요."
          >
            {mileageItems.map(m => (
              <MileageSelectableRow
                key={m.mileage_id}
                item={m}
                selected={m.id != null && selectedMileageIds.includes(m.id)}
                disabled={m.id == null}
                onToggle={() => {
                  if (m.id == null) return;
                  setSelectedMileageIds(prev => toggleInList(prev, m.id!));
                }}
              />
            ))}
          </SelectableSection>

          <SelectableSection
            title="레포지토리"
            countLabel={`${selectedRepoIds.filter(id => visibleRepos.some(r => repoSelectionId(r) === id)).length}개 선택`}
            itemCount={visibleRepos.length}
            icon={<FolderIcon sx={{ fontSize: 20, color: palette.grey600 }} />}
            emptyText="표시 중인 레포지토리가 없습니다. 내 활동 관리에서 레포를 선택·노출하세요."
          >
            {visibleRepos.map(r => {
              const sid = repoSelectionId(r);
              return (
                <RepoSelectableRow
                  key={`${r.repo_id}-${sid}`}
                  repo={r}
                  selected={selectedRepoIds.includes(sid)}
                  onToggle={() => setSelectedRepoIds(prev => toggleInList(prev, sid))}
                />
              );
            })}
          </SelectableSection>

          <SelectableSection
            title="활동"
            countLabel={`${selectedActivityIds.length}개 선택`}
            itemCount={activities.length}
            icon={<EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey600 }} />}
            emptyText="등록된 활동이 없습니다. 내 활동 관리에서 활동을 추가하세요."
          >
            {activities.map(a => (
              <ActivitySelectableRow
                key={a.id}
                activity={a}
                selected={selectedActivityIds.includes(a.id)}
                onToggle={() =>
                  setSelectedActivityIds(prev => toggleInList(prev, a.id))
                }
              />
            ))}
          </SelectableSection>
        </Flex.Column>

        <Flex.Row
          align="center"
          justify="flex-end"
          gap="0.75rem"
          wrap="wrap"
          width="100%"
          style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: `1px solid ${palette.grey200}` }}
        >
          <Button
            label="다음: JD 입력"
            variant="contained"
            color="blue"
            size="medium"
            icon={() => <ArrowForwardIcon sx={{ fontSize: 20 }} />}
            iconPosition="end"
            onClick={handleNext}
          />
        </Flex.Row>
      </S.Card>
    </Flex.Column>
  );
};

export default CvGeneratePage;

function SelectableSection({
  title,
  countLabel,
  itemCount,
  icon,
  emptyText,
  children,
}: {
  title: string;
  countLabel: string;
  itemCount: number;
  icon: ReactNode;
  emptyText: string;
  children: ReactNode;
}) {
  const isEmpty = itemCount === 0;

  return (
    <S.SectionBlock>
      <Flex.Row align="center" justify="space-between" gap="0.75rem" wrap="wrap" style={{ marginBottom: '0.65rem' }}>
        <Flex.Row align="center" gap="0.5rem" wrap="wrap">
          {icon}
          <Text margin="0" bold style={{ fontSize: '1rem' }}>
            {title}
          </Text>
          <S.CountPill>{countLabel}</S.CountPill>
        </Flex.Row>
      </Flex.Row>
      {isEmpty ? (
        <Text margin="0" color={palette.grey500} style={{ fontSize: '0.875rem' }}>
          {emptyText}
        </Text>
      ) : (
        <S.ScrollList role="list">{children}</S.ScrollList>
      )}
    </S.SectionBlock>
  );
}

function MileageSelectableRow({
  item,
  selected,
  disabled,
  onToggle,
}: {
  item: MileageItem;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <S.SelectRow $disabled={disabled} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <Flex.Row align="flex-start" gap="0.75rem" width="100%" style={{ minWidth: 0 }}>
        <Checkbox
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
          size="small"
          sx={{ padding: '4px', marginTop: '2px' }}
          inputProps={{ 'aria-label': `${item.item} 선택` }}
        />
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <S.CategoryTag>{item.category}</S.CategoryTag>
            <Text margin="0" style={{ fontWeight: 600, fontSize: '0.9375rem', wordBreak: 'break-word' }}>
              {item.item}
            </Text>
            <Text margin="0" color={palette.grey500} style={{ fontSize: '0.8125rem' }}>
              {item.semester}
            </Text>
          </Flex.Row>
          {item.additional_info?.trim() ? (
            <Text margin="0" color={palette.grey600} style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
              {item.additional_info}
            </Text>
          ) : null}
          {disabled ? (
            <Text margin="0" color={palette.pink500} style={{ fontSize: '0.75rem' }}>
              포트폴리오에 연결된 항목만 선택할 수 있습니다.
            </Text>
          ) : null}
        </Flex.Column>
      </Flex.Row>
    </S.SelectRow>
  );
}

function RepoSelectableRow({
  repo,
  selected,
  onToggle,
}: {
  repo: RepoItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const title =
    repo.custom_title != null && repo.custom_title.trim() !== ''
      ? repo.custom_title.trim()
      : repo.name;
  return (
    <S.SelectRow style={{ cursor: 'pointer' }}>
      <Flex.Row align="flex-start" gap="0.75rem" width="100%" style={{ minWidth: 0 }}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          size="small"
          sx={{ padding: '4px', marginTop: '2px' }}
          inputProps={{ 'aria-label': `${title} 선택` }}
        />
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <Text margin="0" style={{ fontWeight: 600, fontSize: '0.9375rem', wordBreak: 'break-word' }}>
              {title}
            </Text>
          </Flex.Row>
          {repo.description?.trim() ? (
            <Text margin="0" color={palette.grey600} style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
              {repo.description}
            </Text>
          ) : null}
        </Flex.Column>
      </Flex.Row>
    </S.SelectRow>
  );
}

function ActivitySelectableRow({
  activity,
  selected,
  onToggle,
}: {
  activity: ActivityItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const range = formatDateRange(activity.start_date, activity.end_date);
  return (
    <S.SelectRow style={{ cursor: 'pointer' }}>
      <Flex.Row align="flex-start" gap="0.75rem" width="100%" style={{ minWidth: 0 }}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          size="small"
          sx={{ padding: '4px', marginTop: '2px' }}
          inputProps={{ 'aria-label': `${activity.title} 선택` }}
        />
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <S.CategoryTag>{activity.category}</S.CategoryTag>
            <Text margin="0" style={{ fontWeight: 600, fontSize: '0.9375rem', wordBreak: 'break-word' }}>
              {activity.title}
            </Text>
            <Text margin="0" color={palette.grey500} style={{ fontSize: '0.8125rem' }}>
              {range}
            </Text>
          </Flex.Row>
          {activity.description?.trim() ? (
            <Text margin="0" color={palette.grey600} style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
              {activity.description}
            </Text>
          ) : null}
        </Flex.Column>
      </Flex.Row>
    </S.SelectRow>
  );
}

const S = {
  Card: styled('section')`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    padding: 1.25rem 1.25rem 1.5rem;
    border-radius: 0.75rem;
    background-color: ${palette.white};
    ${boxShadow};
    box-sizing: border-box;
  `,
  StepperRow: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.25rem;
    width: 100%;
    flex-wrap: nowrap;
  `,
  StepCircle: styled('span')<{ $active?: boolean; $muted?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
    box-sizing: border-box;
    border: 2px solid
      ${({ $active }) => ($active ? palette.blue500 : palette.grey300)};
    background-color: ${({ $active }) => ($active ? palette.blue500 : palette.white)};
    color: ${({ $active }) => ($active ? palette.white : palette.grey600)};
    ${({ $muted, $active }) =>
      $muted && !$active ? `opacity: 0.85;` : ''}
  `,
  StepLabel: styled('span')<{ $active?: boolean }>`
    font-size: 0.6875rem;
    font-weight: ${({ $active }) => ($active ? 700 : 500)};
    color: ${({ $active }) => ($active ? palette.blue600 : palette.grey600)};
    text-align: center;
    line-height: 1.25;
    word-break: keep-all;
  `,
  StepConnector: styled('div')`
    flex: 1 1 0;
    min-width: 0.5rem;
    height: 2px;
    margin-top: 1rem;
    align-self: flex-start;
    background-color: ${palette.grey200};
  `,
  HighlightSection: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding: 1rem 1.1rem;
    border-radius: 0.75rem;
    border: 1px solid ${palette.blue300};
    background-color: ${palette.blue300};
    box-sizing: border-box;
  `,
  ProfileInner: styled(Flex.Row)`
    width: 100%;
  `,
  AvatarBox: styled('div')`
    width: 5rem;
    height: 5rem;
    border-radius: 0.5rem;
    background-color: ${palette.grey200};
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
  `,
  AvatarImg: styled('img')`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  SectionBlock: styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    padding: 1rem 1.1rem;
    border-radius: 0.75rem;
    border: 1px solid ${palette.grey200};
    background-color: ${palette.white};
    box-sizing: border-box;
  `,
  ScrollList: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 17.5rem;
    overflow-y: auto;
    width: 100%;
    min-width: 0;
    padding-right: 0.25rem;
  `,
  SelectRow: styled('div')<{ $disabled?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: 0.65rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
    opacity: ${({ $disabled }) => ($disabled ? 0.75 : 1)};
    box-sizing: border-box;
  `,
  CategoryTag: styled('span')`
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.45rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${palette.blue600};
    background-color: ${palette.blue300};
    flex-shrink: 0;
  `,
  CountPill: styled('span')`
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${palette.grey600};
    background-color: ${palette.grey200};
  `,
  /** 내 활동 요약 `미리보기` 버튼과 동일한 아웃라인 톤 */
  BackButton: styled(MuiButton)`
    min-width: 7.5rem;
    padding: 0.5rem 1rem 0.5rem 0.75rem;
    border-color: ${palette.blue400};
    color: ${palette.blue400};
    border-radius: 0.75rem;
    text-transform: none;
    font-weight: 600;
    font-size: 0.9375rem;
    line-height: 1.2;
    &:hover {
      border-color: ${palette.blue600};
      color: ${palette.blue600};
      background-color: rgba(91, 140, 241, 0.08);
    }
  `,
};
