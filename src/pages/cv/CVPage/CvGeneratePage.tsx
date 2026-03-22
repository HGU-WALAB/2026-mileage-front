import { BASE_URL } from '@/apis/config';
import { ENDPOINT } from '@/apis/endPoint';
import { LoadingIcon } from '@/assets';
import { Flex, Heading, Text } from '@/components';
import {
  ROUTE_PATH,
  SUMMARY_CV_PANEL_QUERY_KEY,
  SUMMARY_CV_PANEL_QUERY_VALUE,
} from '@/constants/routePath';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useTrackPageView } from '@/service/amplitude/useTrackPageView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { useMediaQuery, useTheme } from '@mui/material';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useSummaryContext } from '@/pages/summary/SummaryPage/context/SummaryContext';

import {
  readCvWizardPendingCvId,
  readCvWizardPendingPrompt,
  readCvWizardStep1Selection,
  readCvWizardStep2Draft,
  readCvWizardStep4Html,
  readCvWizardUiStep,
  writeCvWizardPendingCvId,
  writeCvWizardPendingPrompt,
  writeCvWizardStep1Selection,
  writeCvWizardStep2Draft,
  writeCvWizardStep4Html,
  writeCvWizardUiStep,
} from '../constants/cvWizardStorage';
import usePatchPortfolioCvMutation from '../hooks/usePatchPortfolioCvMutation';
import usePostPortfolioCvBuildPromptMutation from '../hooks/usePostPortfolioCvBuildPromptMutation';
import { repoSelectionId } from '../utils/cvWizardSelection';
import { sanitizeCvHtml } from '../utils/sanitizeCvHtml';

import { CvGeneratePageS as S } from './cvGeneratePageStyles';
import CvGenerateStep1 from './components/CvGenerateStep1';
import CvGenerateStep2 from './components/CvGenerateStep2';
import CvGenerateStep3 from './components/CvGenerateStep3';
import CvGenerateStep4 from './components/CvGenerateStep4';

const STEPS = [
  { n: 1, label: '항목 선택' },
  { n: 2, label: 'JD 입력' },
  { n: 3, label: '프롬프트 생성' },
  { n: 4, label: '결과 저장' },
] as const;

type WizardStep = 1 | 2 | 3 | 4;

type StepVisualState = 'completed' | 'active' | 'upcoming';

function readInitialWizardStep(): WizardStep {
  const s = readCvWizardUiStep();
  if (s === 4) {
    const cvId = readCvWizardPendingCvId();
    const hasPrompt = Boolean(readCvWizardPendingPrompt()?.trim());
    if (cvId !== null && hasPrompt) return 4;
    if (hasPrompt) return 3;
    return 2;
  }
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
  if (wizardStep === 3) {
    if (stepN <= 2) return 'completed';
    if (stepN === 3) return 'active';
    return 'upcoming';
  }
  if (stepN <= 3) return 'completed';
  return stepN === 4 ? 'active' : 'upcoming';
}

const getProfileImageUrl = (filename: string | null | undefined): string | null =>
  filename?.trim()
    ? `${BASE_URL}${ENDPOINT.PORTFOLIO_USER_INFO_IMAGE}/${encodeURIComponent(filename.trim())}`
    : null;

const CvGeneratePage = () => {
  useTrackPageView({ eventName: '[View] CV 생성기' });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { userInfo, repos, mileageItems, activities } = useSummaryContext();
  const buildPromptMutation = usePostPortfolioCvBuildPromptMutation();
  const patchCvMutation = usePatchPortfolioCvMutation();

  const [wizardStep, setWizardStep] = useState<WizardStep>(readInitialWizardStep);
  const [generatedPrompt, setGeneratedPrompt] = useState(
    () => readCvWizardPendingPrompt() ?? '',
  );
  const [htmlResultDraft, setHtmlResultDraft] = useState(() => readCvWizardStep4Html());

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
  const [draftTitle, setDraftTitle] = useState(step2DraftInit?.title ?? '');
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
      title: draftTitle,
      job_posting: jobPosting,
      target_position: targetPosition,
      additional_notes: additionalNotes,
    });
  }, [draftTitle, jobPosting, targetPosition, additionalNotes]);

  useEffect(() => {
    writeCvWizardPendingPrompt(generatedPrompt);
  }, [generatedPrompt]);

  useEffect(() => {
    writeCvWizardUiStep(wizardStep);
  }, [wizardStep]);

  useEffect(() => {
    writeCvWizardStep4Html(htmlResultDraft);
  }, [htmlResultDraft]);

  useEffect(() => {
    if (wizardStep !== 3) return;
    if (!generatedPrompt.trim()) setWizardStep(2);
  }, [wizardStep, generatedPrompt]);

  useEffect(() => {
    if (wizardStep !== 4) return;
    if (readCvWizardPendingCvId() === null) {
      toast.warn('CV 정보가 없습니다. 프롬프트 생성 단계부터 다시 진행해 주세요.');
      setWizardStep(3);
    }
  }, [wizardStep]);

  const getCommittedSelection = useCallback(() => {
    const mileageIds = mileageItems
      .filter(m => typeof m.id === 'number' && selectedMileageIds.includes(m.id))
      .map(m => m.id as number);
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

  const handleGoToStep4 = useCallback(() => {
    if (readCvWizardPendingCvId() === null) {
      toast.warn('먼저 프롬프트를 생성해 주세요.');
      return;
    }
    setWizardStep(4);
  }, []);

  const handlePrevFromStep4 = useCallback(() => {
    setWizardStep(3);
  }, []);

  const handleSaveHistory = useCallback(() => {
    const id = readCvWizardPendingCvId();
    if (id === null) {
      toast.error('저장할 CV를 찾을 수 없습니다.');
      return;
    }
    const raw = htmlResultDraft.trim();
    if (!raw) {
      toast.warn('저장할 HTML을 입력해 주세요.');
      return;
    }
    const html_content = sanitizeCvHtml(raw);
    patchCvMutation.mutate(
      { id, body: { html_content } },
      {
        onSuccess: () => {
          toast.success('히스토리에 저장되었습니다.');
          navigate({
            pathname: ROUTE_PATH.summary,
            search: new URLSearchParams({
              [SUMMARY_CV_PANEL_QUERY_KEY]: SUMMARY_CV_PANEL_QUERY_VALUE,
            }).toString(),
          });
        },
        onError: () => {
          toast.error('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      },
    );
  }, [htmlResultDraft, navigate, patchCvMutation]);

  const handleBuildPrompt = useCallback(() => {
    const tt = draftTitle.trim();
    const jp = jobPosting.trim();
    const tp = targetPosition.trim();
    if (!tt || !jp || !tp) {
      toast.warn('제목, 공고 정보, 지원 직무를 모두 입력해 주세요.');
      return;
    }
    const ids = getCommittedSelection();
    writeCvWizardStep1Selection(ids);
    buildPromptMutation.mutate(
      {
        title: tt,
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
          writeCvWizardPendingCvId(data.cv_id);
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
    draftTitle,
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

      <S.Card
        aria-busy={buildPromptMutation.isPending}
        style={
          buildPromptMutation.isPending
            ? { minHeight: 'min(60vh, 28rem)' }
            : undefined
        }
      >
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

        {buildPromptMutation.isPending ? (
          <Flex.Column
            role="status"
            aria-live="polite"
            align="center"
            justify="center"
            gap="0.75rem"
            width="100%"
            style={{
              marginTop: '1.5rem',
              minHeight: 'min(50vh, 20rem)',
              flex: '1 1 auto',
            }}
          >
            <LoadingIcon width={100} height={100} aria-hidden />
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
              }}
            >
              프롬프트를 생성하는 중입니다…
            </Text>
          </Flex.Column>
        ) : (
          <>
            {wizardStep === 1 ? (
              <CvGenerateStep1
                name={name}
                bio={bio}
                departmentMajorLine={departmentMajorLine}
                profileImageUrl={profileImageUrl}
                mileageItems={mileageItems}
                activities={activities}
                visibleRepos={visibleRepos}
                selectedMileageIds={selectedMileageIds}
                selectedActivityIds={selectedActivityIds}
                selectedRepoIds={selectedRepoIds}
                onSelectedMileageIdsChange={setSelectedMileageIds}
                onSelectedActivityIdsChange={setSelectedActivityIds}
                onSelectedRepoIdsChange={setSelectedRepoIds}
                onNext={handleNextFromStep1}
              />
            ) : null}

            {wizardStep === 2 ? (
              <CvGenerateStep2
                isMobile={isMobile}
                draftTitle={draftTitle}
                onDraftTitleChange={setDraftTitle}
                jobPosting={jobPosting}
                onJobPostingChange={setJobPosting}
                targetPosition={targetPosition}
                onTargetPositionChange={setTargetPosition}
                additionalNotes={additionalNotes}
                onAdditionalNotesChange={setAdditionalNotes}
                onPrev={handlePrevFromStep2}
                onBuildPrompt={handleBuildPrompt}
                buildPromptPending={buildPromptMutation.isPending}
              />
            ) : null}

            {wizardStep === 3 ? (
              <CvGenerateStep3
                value={generatedPrompt}
                onChange={setGeneratedPrompt}
                onPrev={handlePrevFromStep3}
                onNextToStep4={handleGoToStep4}
              />
            ) : null}

            {wizardStep === 4 ? (
              <CvGenerateStep4
                htmlInput={htmlResultDraft}
                onHtmlChange={setHtmlResultDraft}
                draftTitle={draftTitle}
                jobPosting={jobPosting}
                targetPosition={targetPosition}
                onPrev={handlePrevFromStep4}
                onSave={handleSaveHistory}
                saveDisabled={patchCvMutation.isPending}
              />
            ) : null}
          </>
        )}
      </S.Card>
    </Flex.Column>
  );
};

export default CvGeneratePage;
