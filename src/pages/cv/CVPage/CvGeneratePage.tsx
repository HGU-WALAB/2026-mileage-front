import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { Button, Flex, Heading, Text } from '@/components';
import { ROUTE_PATH } from '@/constants/routePath';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckIcon from '@mui/icons-material/Check';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  Button as MuiButton,
  Checkbox,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
  type SVGProps,
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

import CvGenerateStep3 from './components/CvGenerateStep3';
import {
  readCvWizardPendingPrompt,
  readCvWizardStep1Selection,
  readCvWizardStep2Draft,
  readCvWizardUiStep,
  writeCvWizardPendingPrompt,
  writeCvWizardStep1Selection,
  writeCvWizardStep2Draft,
  writeCvWizardUiStep,
} from '../constants/cvWizardStorage';
import usePostPortfolioCvBuildPromptMutation from '../hooks/usePostPortfolioCvBuildPromptMutation';

const STEPS = [
  { n: 1, label: '항목 선택' },
  { n: 2, label: 'JD 입력' },
  { n: 3, label: '프롬프트 생성' },
  { n: 4, label: '결과 저장' },
] as const;

const JOB_POSTING_PLACEHOLDER = `예) 회사: 카카오
포지션: 백엔드 개발자 (인턴)
자격요건: Java/Spring 경험, 알고리즘 실력
우대사항: AWS 경험, 오픈소스 기여
...`;

const TARGET_POSITION_PLACEHOLDER =
  '예) 백엔드 개발자, AI 엔지니어, 프론트엔드 인턴 등';

const ADDITIONAL_NOTES_PLACEHOLDER =
  '예) 프로젝트 경험 위주로 강조해줘, 간결하게 작성해줘 등';

type WizardStep = 1 | 2 | 3;

type StepVisualState = 'completed' | 'active' | 'upcoming';

function readInitialWizardStep(): WizardStep {
  const s = readCvWizardUiStep();
  if (s === 3) return readCvWizardPendingPrompt()?.trim() ? 3 : 2;
  if (s === 2) return 2;
  return 1;
}

function stepVisual(stepN: number, wizardStep: WizardStep): StepVisualState {
  if (wizardStep === 1) return stepN === 1 ? 'active' : 'upcoming';
  if (wizardStep === 2) {
    if (stepN === 1) return 'completed';
    if (stepN === 2) return 'active';
    return 'upcoming';
  }
  if (stepN <= 2) return 'completed';
  if (stepN === 3) return 'active';
  return 'upcoming';
}

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

const AutoAwesomeIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
);

const CvGeneratePage = () => {
  useTrackPageView({ eventName: '[View] CV 생성기' });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { userInfo, repos, mileageItems, activities } = useSummaryContext();
  const buildPromptMutation = usePostPortfolioCvBuildPromptMutation();

  const [wizardStep, setWizardStep] = useState<WizardStep>(readInitialWizardStep);
  const [generatedPrompt, setGeneratedPrompt] = useState(
    () => readCvWizardPendingPrompt() ?? '',
  );

  const [selectedMileageIds, setSelectedMileageIds] = useState<number[]>(
    () => readCvWizardStep1Selection()?.selected_mileage_ids ?? [],
  );
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>(
    () => readCvWizardStep1Selection()?.selected_activity_ids ?? [],
  );
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>(
    () => readCvWizardStep1Selection()?.selected_repo_ids ?? [],
  );

  const step2DraftInit = useMemo(() => readCvWizardStep2Draft(), []);
  const [jobPosting, setJobPosting] = useState(step2DraftInit?.job_posting ?? '');
  const [targetPosition, setTargetPosition] = useState(
    step2DraftInit?.target_position ?? '',
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    step2DraftInit?.additional_notes ?? '',
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

  useEffect(() => {
    writeCvWizardStep2Draft({
      job_posting: jobPosting,
      target_position: targetPosition,
      additional_notes: additionalNotes,
    });
  }, [jobPosting, targetPosition, additionalNotes]);

  useEffect(() => {
    writeCvWizardPendingPrompt(generatedPrompt);
  }, [generatedPrompt]);

  useEffect(() => {
    writeCvWizardUiStep(wizardStep);
  }, [wizardStep]);

  useEffect(() => {
    if (wizardStep !== 3) return;
    if (!generatedPrompt.trim()) setWizardStep(2);
  }, [wizardStep, generatedPrompt]);

  const getCommittedSelection = useCallback(() => {
    const mileageIds = mileageItems
      .filter(m => m.id != null && selectedMileageIds.includes(m.id!))
      .map(m => m.id!);
    const activityIds = activities
      .filter(a => selectedActivityIds.includes(a.id))
      .map(a => a.id);
    const repoIds = visibleRepos
      .filter(r => selectedRepoIds.includes(repoSelectionId(r)))
      .map(r => repoSelectionId(r));
    return {
      selected_mileage_ids: mileageIds,
      selected_activity_ids: activityIds,
      selected_repo_ids: repoIds,
    };
  }, [
    activities,
    mileageItems,
    selectedActivityIds,
    selectedMileageIds,
    selectedRepoIds,
    visibleRepos,
  ]);

  const handleBack = useCallback(() => {
    navigate(ROUTE_PATH.summary);
  }, [navigate]);

  const handleNextFromStep1 = useCallback(() => {
    writeCvWizardStep1Selection(getCommittedSelection());
    setWizardStep(2);
  }, [getCommittedSelection]);

  const handlePrevFromStep2 = useCallback(() => {
    setWizardStep(1);
  }, []);

  const handlePrevFromStep3 = useCallback(() => {
    setWizardStep(2);
  }, []);

  const handleStep4Placeholder = useCallback(() => {
    toast.info('4단계는 준비 중입니다.');
  }, []);

  const handleBuildPrompt = useCallback(() => {
    const jp = jobPosting.trim();
    const tp = targetPosition.trim();
    if (!jp || !tp) {
      toast.warn('공고 정보와 지원 직무를 입력해 주세요.');
      return;
    }
    const ids = getCommittedSelection();
    writeCvWizardStep1Selection(ids);
    buildPromptMutation.mutate(
      {
        job_posting: jp,
        target_position: tp,
        additional_notes: additionalNotes.trim(),
        selected_mileage_ids: ids.selected_mileage_ids,
        selected_activity_ids: ids.selected_activity_ids,
        selected_repo_ids: ids.selected_repo_ids,
      },
      {
        onSuccess: data => {
          setGeneratedPrompt(data.prompt);
          writeCvWizardPendingPrompt(data.prompt);
          setWizardStep(3);
          toast.success('프롬프트가 생성되었습니다.');
        },
        onError: () => {
          toast.error('프롬프트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      },
    );
  }, [
    additionalNotes,
    buildPromptMutation,
    getCommittedSelection,
    jobPosting,
    targetPosition,
  ]);

  const name = userInfo?.name ?? '-';
  const bio = userInfo?.bio ?? '';
  const department = userInfo?.department ?? '';
  const major1 = userInfo?.major1 ?? '';
  const major2 = userInfo?.major2 ?? '';
  const majorLine = [major1, major2].filter(Boolean).join(' / ') || '-';
  const departmentMajorLine =
    department.trim() !== '' ? `${department} ${majorLine}` : majorLine;

  const profileImageUrl = getProfileImageUrl(userInfo?.profile_image_url ?? null);

  return (
    <Flex.Column
      margin="1rem"
      gap="1.25rem"
      width="100%"
      style={{
        maxWidth: '56rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        minWidth: 0,
        boxSizing: 'border-box',
        ...(isMobile ? { paddingLeft: '0.75rem', paddingRight: '0.75rem' } : {}),
      }}
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
        <Heading as="h1" margin="0" color={theme.palette.text.primary}>
          이력서 생성하기
        </Heading>
        <Text
          margin="0"
          style={{
            ...theme.typography.body1,
            color: theme.palette.grey[600],
          }}
        >
          마일리지 항목으로 맞춤 이력서 프롬프트를 만들고 히스토리로 관리하세요
        </Text>
      </Flex.Column>

      <S.Card>
        <S.StepperRow role="list" aria-label="진행 단계">
          {STEPS.map((step, idx) => {
            const vs = stepVisual(step.n, wizardStep);
            return (
              <Fragment key={step.n}>
                <Flex.Column
                  align="center"
                  gap="0.35rem"
                  style={{ width: '4.75rem', flexShrink: 0 }}
                >
                  <S.StepCircle
                    $active={vs === 'active'}
                    $completed={vs === 'completed'}
                    $muted={vs === 'upcoming'}
                    aria-current={vs === 'active' ? 'step' : undefined}
                  >
                    {vs === 'completed' ? (
                      <CheckIcon sx={{ fontSize: 18 }} aria-hidden />
                    ) : (
                      step.n
                    )}
                  </S.StepCircle>
                  <S.StepLabel $active={vs === 'active'} $completed={vs === 'completed'}>
                    {step.label}
                  </S.StepLabel>
                </Flex.Column>
                {idx < STEPS.length - 1 ? <S.StepConnector aria-hidden /> : null}
              </Fragment>
            );
          })}
        </S.StepperRow>

        {wizardStep === 1 ? (
        <Flex.Column gap="1.25rem" width="100%" style={{ marginTop: '1.5rem' }} key="step1">
          <Flex.Column gap="0.35rem" width="100%">
            <Heading as="h3" margin="0" color={theme.palette.text.primary}>
              어떤 항목을 포함할까요?
            </Heading>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
              }}
            >
              CV에 넣을 마일리지·레포지토리·활동을 선택하세요. 프로필과 기술 스택은 자동으로 포함됩니다.
            </Text>
          </Flex.Column>

          <S.HighlightSection>
            <Flex.Row align="center" gap="0.5rem" wrap="wrap">
              <PersonOutlineIcon sx={{ fontSize: 22, color: palette.blue500 }} />
              <Heading as="h4" margin="0" color={theme.palette.text.primary}>
                프로필 (자동 포함)
              </Heading>
            </Flex.Row>
            <S.ProfileInner align="flex-start" gap="1rem" wrap="wrap">
              <S.AvatarBox>
                {profileImageUrl ? (
                  <S.AvatarImg src={profileImageUrl} alt="" />
                ) : null}
              </S.AvatarBox>
              <Flex.Column gap="0.35rem" style={{ flex: '1 1 12rem', minWidth: 0 }}>
                <Heading as="h2" margin="0" color={theme.palette.text.primary}>
                  {name}
                </Heading>
                <Text
                  margin="0"
                  style={{
                    ...theme.typography.body1,
                    color: theme.palette.grey[600],
                  }}
                >
                  {bio || '-'}
                </Text>
                <Text
                  margin="0"
                  style={{
                    ...theme.typography.body1,
                    color: theme.palette.grey[600],
                  }}
                >
                  {departmentMajorLine}
                </Text>
              </Flex.Column>
            </S.ProfileInner>
          </S.HighlightSection>

          <S.SectionBlock>
            <Flex.Row align="center" gap="0.5rem" wrap="wrap" style={{ marginBottom: '0.65rem' }}>
              <MenuBookIcon sx={{ fontSize: 20, color: palette.grey600 }} />
              <Heading as="h4" margin="0" color={theme.palette.text.primary}>
                기술 스택 (자동 포함)
              </Heading>
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
        ) : null}

        {wizardStep === 2 ? (
        <Flex.Column gap="1.25rem" width="100%" style={{ marginTop: '1.5rem' }} key="step2">
          <Flex.Column gap="0.35rem" width="100%">
            <Heading as="h3" margin="0" color={theme.palette.text.primary}>
              채용 공고를 입력하세요
            </Heading>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
              }}
            >
              공고 정보와 지원 직무를 입력하면 맞춤 프롬프트가 자동 생성됩니다.
            </Text>
          </Flex.Column>

          <S.JdFieldRow align="flex-start" gap="0.65rem" width="100%">
            <S.FieldLeadIcon aria-hidden>
              <ArticleOutlinedIcon sx={{ fontSize: 22, color: palette.grey600 }} />
            </S.FieldLeadIcon>
            <Flex.Column gap="0.35rem" style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
              <TextField
                required
                fullWidth
                label="공고 정보"
                helperText="회사명, 공고 제목, 우대사항, 자격요건 등"
                placeholder={JOB_POSTING_PLACEHOLDER}
                value={jobPosting}
                onChange={e => setJobPosting(e.target.value)}
                multiline
                minRows={isMobile ? 6 : 8}
                inputProps={{ maxLength: 12000, 'aria-label': '공고 정보' }}
              />
            </Flex.Column>
          </S.JdFieldRow>

          <S.JdFieldRow align="flex-start" gap="0.65rem" width="100%">
            <S.FieldLeadIcon aria-hidden>
              <FlagOutlinedIcon sx={{ fontSize: 22, color: palette.grey600 }} />
            </S.FieldLeadIcon>
            <Flex.Column gap="0.35rem" style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
              <TextField
                required
                fullWidth
                label="지원 직무"
                placeholder={TARGET_POSITION_PLACEHOLDER}
                value={targetPosition}
                onChange={e => setTargetPosition(e.target.value)}
                inputProps={{ maxLength: 200, 'aria-label': '지원 직무' }}
              />
            </Flex.Column>
          </S.JdFieldRow>

          <S.JdFieldRow align="flex-start" gap="0.65rem" width="100%">
            <S.FieldLeadIcon aria-hidden>
              <ChatBubbleOutlineIcon sx={{ fontSize: 22, color: palette.grey600 }} />
            </S.FieldLeadIcon>
            <Flex.Column gap="0.35rem" style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
              <TextField
                fullWidth
                label="추가 요청사항 (선택)"
                placeholder={ADDITIONAL_NOTES_PLACEHOLDER}
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                multiline
                minRows={3}
                inputProps={{ maxLength: 4000, 'aria-label': '추가 요청사항' }}
              />
            </Flex.Column>
          </S.JdFieldRow>
        </Flex.Column>
        ) : null}

        {wizardStep === 3 ? (
          <CvGenerateStep3 value={generatedPrompt} onChange={setGeneratedPrompt} />
        ) : null}

        {wizardStep === 1 ? (
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
            size="large"
            icon={() => <ArrowForwardIcon sx={{ fontSize: 20 }} />}
            iconPosition="end"
            onClick={handleNextFromStep1}
          />
        </Flex.Row>
        ) : null}

        {wizardStep === 2 ? (
        <Flex.Row
          align="center"
          justify="space-between"
          gap="0.75rem"
          wrap="wrap"
          width="100%"
          style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: `1px solid ${palette.grey200}` }}
        >
          <S.BackButton
            type="button"
            variant="outlined"
            onClick={handlePrevFromStep2}
            aria-label="항목 선택 단계로 돌아가기"
            startIcon={<ArrowBackIcon sx={{ fontSize: 20, color: 'inherit' }} />}
          >
            이전 단계
          </S.BackButton>
          <Button
            label="프롬프트 생성"
            variant="contained"
            color="blue"
            size="large"
            icon={AutoAwesomeIconWrap}
            iconPosition="start"
            disabled={buildPromptMutation.isPending}
            onClick={handleBuildPrompt}
          />
        </Flex.Row>
        ) : null}

        {wizardStep === 3 ? (
        <Flex.Row
          align="center"
          justify="space-between"
          gap="0.75rem"
          wrap="wrap"
          width="100%"
          style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: `1px solid ${palette.grey200}` }}
        >
          <S.BackButton
            type="button"
            variant="outlined"
            onClick={handlePrevFromStep3}
            aria-label="JD 입력 단계로 돌아가기"
            startIcon={<ArrowBackIcon sx={{ fontSize: 20, color: 'inherit' }} />}
          >
            이전 단계
          </S.BackButton>
          <Button
            label="AI 결과 붙여넣기"
            variant="contained"
            color="blue"
            size="large"
            icon={() => <ArrowForwardIcon sx={{ fontSize: 20 }} />}
            iconPosition="end"
            onClick={handleStep4Placeholder}
          />
        </Flex.Row>
        ) : null}
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
  const theme = useTheme();
  const isEmpty = itemCount === 0;

  return (
    <S.SectionBlock>
      <Flex.Row align="center" justify="space-between" gap="0.75rem" wrap="wrap" style={{ marginBottom: '0.65rem' }}>
        <Flex.Row align="center" gap="0.5rem" wrap="wrap">
          {icon}
          <Heading as="h4" margin="0" color={theme.palette.text.primary}>
            {title}
          </Heading>
          <S.CountPill>{countLabel}</S.CountPill>
        </Flex.Row>
      </Flex.Row>
      {isEmpty ? (
        <Text
          margin="0"
          style={{
            ...theme.typography.body2,
            color: theme.palette.grey[500],
          }}
        >
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
  const theme = useTheme();
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
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {item.item}
            </Text>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[500],
              }}
            >
              {item.semester}
            </Text>
          </Flex.Row>
          {item.additional_info?.trim() ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                lineHeight: 1.45,
              }}
            >
              {item.additional_info}
            </Text>
          ) : null}
          {disabled ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.caption,
                color: palette.pink500,
              }}
            >
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
  const theme = useTheme();
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
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {title}
            </Text>
          </Flex.Row>
          {repo.description?.trim() ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                lineHeight: 1.45,
              }}
            >
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
  const theme = useTheme();
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
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {activity.title}
            </Text>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[500],
              }}
            >
              {range}
            </Text>
          </Flex.Row>
          {activity.description?.trim() ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                lineHeight: 1.45,
              }}
            >
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
  StepCircle: styled('span', {
    shouldForwardProp: p => p !== '$active' && p !== '$muted' && p !== '$completed',
  })<{ $active?: boolean; $muted?: boolean; $completed?: boolean }>(
    ({ theme, $active, $muted, $completed }) => {
      const filled = $active || $completed;
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        ...theme.typography.body2,
        fontWeight: 700,
        flexShrink: 0,
        boxSizing: 'border-box',
        border: `2px solid ${filled ? palette.blue500 : palette.grey300}`,
        backgroundColor: filled ? palette.blue500 : palette.white,
        color: filled ? palette.white : theme.palette.grey[600],
        ...($muted && !filled ? { opacity: 0.85 } : {}),
      };
    },
  ),
  StepLabel: styled('span', {
    shouldForwardProp: p => p !== '$active' && p !== '$completed',
  })<{ $active?: boolean; $completed?: boolean }>(({ theme, $active, $completed }) => ({
    ...theme.typography.caption,
    fontWeight: $active ? 700 : $completed ? 600 : 500,
    color: $active || $completed ? palette.blue600 : theme.palette.text.secondary,
    textAlign: 'center',
    lineHeight: 1.25,
    wordBreak: 'keep-all',
  })),
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
  CategoryTag: styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.45rem',
    borderRadius: '0.375rem',
    ...theme.typography.caption,
    fontWeight: 600,
    color: palette.blue600,
    backgroundColor: palette.blue300,
    flexShrink: 0,
  })),
  CountPill: styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.5rem',
    borderRadius: '1rem',
    ...theme.typography.caption,
    fontWeight: 600,
    color: theme.palette.grey[600],
    backgroundColor: palette.grey200,
  })),
  JdFieldRow: styled(Flex.Row)`
    flex-wrap: wrap;
    @media (min-width: 901px) {
      flex-wrap: nowrap;
    }
  `,
  FieldLeadIcon: styled('span')`
    display: flex;
    flex-shrink: 0;
    width: 2rem;
    justify-content: center;
    padding-top: 0.35rem;
    box-sizing: border-box;
  `,
  /** 내 활동 요약 `미리보기` 버튼과 동일한 아웃라인 톤 (뒤로가기·이전 공통) */
  BackButton: styled(MuiButton)(({ theme }) => ({
    minWidth: '7.5rem',
    padding: '0.5rem 1rem 0.5rem 0.75rem',
    borderColor: palette.blue400,
    color: palette.blue400,
    borderRadius: '0.75rem',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.2,
    '&:hover': {
      borderColor: palette.blue600,
      color: palette.blue600,
      backgroundColor: 'rgba(91, 140, 241, 0.08)',
    },
  })),
};
