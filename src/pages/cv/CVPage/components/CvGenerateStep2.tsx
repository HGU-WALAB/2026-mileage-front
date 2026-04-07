import { Button, Dropdown, Flex, Heading, Text } from '@/components';
import { palette } from '@/styles/palette';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import {
  FormControlLabel,
  Switch,
  TextField,
  useTheme,
} from '@mui/material';
import { type FunctionComponent, type SVGProps } from 'react';

import { CV_TARGET_POSITION_PRESETS } from '../../constants/cvTargetPositionOptions';

import { CvGeneratePageS as S } from '../cvGeneratePageStyles';

const JOB_POSTING_PLACEHOLDER = `예) 회사: 카카오
포지션: 백엔드 개발자 (인턴)
자격요건: Java/Spring 경험, 알고리즘 실력
우대사항: AWS 경험, 오픈소스 기여
...`;

const ADDITIONAL_NOTES_PLACEHOLDER =
  '예) 프로젝트 경험 위주로 강조해줘, 간결하게 작성해줘 등';

const JOB_INFO_MAX_LENGTH = 200;

const AutoAwesomeIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
);

export interface CvGenerateStep2Props {
  isMobile: boolean;
  preparingEmployment: boolean;
  onPreparingEmploymentChange: (v: boolean) => void;
  jobPosting: string;
  onJobPostingChange: (v: string) => void;
  targetPosition: string;
  onTargetPositionChange: (v: string) => void;
  additionalNotes: string;
  onAdditionalNotesChange: (v: string) => void;
  /** 스텝 1(JD): 이전 마법사 단계 없음 → 생략 */
  onPrev?: () => void;
  /** 스텝 1(JD): 항목 선택으로 이동 */
  onNext?: () => void;
  nextButtonLabel?: string;
  /** 스텝 2(항목 선택): 프롬프트 생성 — 스텝 1에서는 미사용 */
  onBuildPrompt?: () => void;
  buildPromptPending?: boolean;
}

const CvGenerateStep2 = ({
  isMobile,
  preparingEmployment,
  onPreparingEmploymentChange,
  jobPosting,
  onJobPostingChange,
  targetPosition,
  onTargetPositionChange,
  additionalNotes,
  onAdditionalNotesChange,
  onPrev,
  onNext,
  nextButtonLabel = '다음',
  onBuildPrompt,
  buildPromptPending = false,
}: CvGenerateStep2Props) => {
  const theme = useTheme();
  const showNext = typeof onNext === 'function';
  const showBuild = typeof onBuildPrompt === 'function';

  const positionLabel = preparingEmployment ? '지원 직무' : '관심있는 직무';
  const jobInfoLabel = preparingEmployment
    ? '공고 정보 (선택)'
    : '관심있는 기업 정보 (선택)';
  const jobHelperText = preparingEmployment
    ? '회사명, 공고 제목, 우대사항, 자격요건 등'
    : '관심 있는 회사·산업, 진로와 관련된 메모 등';
  const introText = preparingEmployment
    ? '지원 직무는 필수입니다. 공고 정보·추가 요청사항은 선택입니다.'
    : '관심 직무는 필수입니다. 기업 정보·추가 요청사항은 선택입니다.';

  return (
    <>
      <Flex.Column gap="1.25rem" width="100%" style={{ marginTop: '1.5rem' }}>
        <Flex.Column gap="0.35rem" width="100%">
          <Flex.Row
            align="center"
            justify="space-between"
            gap="0.75rem"
            wrap="wrap"
            width="100%"
            style={{ minWidth: 0 }}
          >
            <Heading
              as="h3"
              margin="0"
              color={theme.palette.text.primary}
              style={{ flex: '1 1 12rem', minWidth: 0 }}
            >
              {preparingEmployment
                ? '채용 공고를 입력하세요'
                : '진로 관심 분야를 입력하세요'}
            </Heading>
            <S.EmploymentToggleBox>
              <FormControlLabel
                control={
                  <Switch
                    id="cv-preparing-employment"
                    checked={preparingEmployment}
                    onChange={e => onPreparingEmploymentChange(e.target.checked)}
                    size="small"
                    sx={{
                      ml: 0.25,
                      mr: 0,
                      '& .MuiSwitch-thumb': {
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: palette.white,
                        '& + .MuiSwitch-track': {
                          backgroundColor: palette.blue500,
                          opacity: 1,
                        },
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: palette.grey300,
                        opacity: 1,
                      },
                    }}
                  />
                }
                label={
                  <Text
                    as="span"
                    margin="0"
                    style={{
                      ...theme.typography.body2,
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    취업을 준비중입니다.
                  </Text>
                }
                labelPlacement="start"
                sx={{
                  m: 0,
                  flexShrink: 0,
                  gap: 0.25,
                  alignItems: 'center',
                  '& .MuiFormControlLabel-label': { mr: 0 },
                }}
              />
            </S.EmploymentToggleBox>
          </Flex.Row>
          <Text
            margin="0"
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[600],
            }}
          >
            {introText}
          </Text>
        </Flex.Column>

        <S.JdFieldRow align="flex-start" gap="0.65rem" width="100%">
          <S.FieldLeadIcon aria-hidden>
            <FlagOutlinedIcon sx={{ fontSize: 22, color: palette.grey600 }} />
          </S.FieldLeadIcon>
          <Flex.Column gap="0.35rem" style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
            <Dropdown
              label={positionLabel}
              items={CV_TARGET_POSITION_PRESETS}
              selectedItem={targetPosition}
              setSelectedItem={onTargetPositionChange}
              width="100%"
              size="medium"
              freeSolo
              freeSoloInputProps={{
                maxLength: 200,
                'aria-label': positionLabel,
              }}
            />
            <Text
              margin="0"
              style={{
                ...theme.typography.caption,
                color: theme.palette.grey[600],
                marginTop: '0.125rem',
              }}
            >
              목록에서 고르거나 직접 입력할 수 있습니다.
            </Text>
          </Flex.Column>
        </S.JdFieldRow>

        <S.JdFieldRow align="flex-start" gap="0.65rem" width="100%">
          <S.FieldLeadIcon aria-hidden>
            <ArticleOutlinedIcon sx={{ fontSize: 22, color: palette.grey600 }} />
          </S.FieldLeadIcon>
          <Flex.Column gap="0.35rem" style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
            <TextField
              fullWidth
              label={jobInfoLabel}
              helperText={
                <Flex.Row
                  align="center"
                  justify="space-between"
                  gap="0.75rem"
                  wrap="nowrap"
                  width="100%"
                  style={{ minWidth: 0 }}
                >
                  <Text
                    as="span"
                    margin="0"
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.grey[600],
                      flex: '1 1 auto',
                      minWidth: 0,
                    }}
                  >
                    {jobHelperText}
                  </Text>
                  <Text
                    as="span"
                    margin="0"
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.grey[600],
                      flexShrink: 0,
                    }}
                  >
                    {jobPosting.length} / {JOB_INFO_MAX_LENGTH}
                  </Text>
                </Flex.Row>
              }
              placeholder={JOB_POSTING_PLACEHOLDER}
              value={jobPosting}
              onChange={e => onJobPostingChange(e.target.value)}
              multiline
              minRows={isMobile ? 6 : 8}
              inputProps={{
                maxLength: JOB_INFO_MAX_LENGTH,
                'aria-label': preparingEmployment ? '공고 정보' : '관심있는 기업 정보',
              }}
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
              onChange={e => onAdditionalNotesChange(e.target.value)}
              multiline
              minRows={3}
              inputProps={{ maxLength: 4000, 'aria-label': '추가 요청사항' }}
            />
          </Flex.Column>
        </S.JdFieldRow>
      </Flex.Column>

      <Flex.Row
        align="center"
        justify={onPrev ? 'space-between' : 'flex-end'}
        gap="0.75rem"
        wrap="wrap"
        width="100%"
        style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${palette.grey200}`,
        }}
      >
        {onPrev ? (
          <S.BackButton
            type="button"
            variant="outlined"
            onClick={onPrev}
            aria-label={
              preparingEmployment
                ? '공고 입력 단계로 돌아가기'
                : '진로 관심 분야 단계로 돌아가기'
            }
            startIcon={<ArrowBackIcon sx={{ fontSize: 20, color: 'inherit' }} />}
          >
            이전 단계
          </S.BackButton>
        ) : null}
        {showNext ? (
          <Button
            label={nextButtonLabel}
            variant="contained"
            color="blue"
            size="large"
            icon={() => <ArrowForwardIcon sx={{ fontSize: 20 }} />}
            iconPosition="end"
            onClick={onNext}
          />
        ) : null}
        {showBuild ? (
          <Button
            label="프롬프트 생성"
            variant="contained"
            color="blue"
            size="large"
            icon={AutoAwesomeIconWrap}
            iconPosition="start"
            disabled={buildPromptPending}
            onClick={onBuildPrompt}
          />
        ) : null}
      </Flex.Row>
    </>
  );
};

export default CvGenerateStep2;
