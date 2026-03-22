import { Button, Flex, Heading, Text } from '@/components';
import { palette } from '@/styles/palette';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SubtitlesOutlinedIcon from '@mui/icons-material/SubtitlesOutlined';
import { TextField, useTheme } from '@mui/material';
import { type FunctionComponent, type SVGProps } from 'react';

import { INPUT_MAX_LENGTH } from '@/pages/summary/constants/inputLimits';

import { CvGeneratePageS as S } from '../cvGeneratePageStyles';

const TITLE_PLACEHOLDER = '예) 카카오 2026 상반기 백엔드 신입';

const JOB_POSTING_PLACEHOLDER = `예) 회사: 카카오
포지션: 백엔드 개발자 (인턴)
자격요건: Java/Spring 경험, 알고리즘 실력
우대사항: AWS 경험, 오픈소스 기여
...`;

const TARGET_POSITION_PLACEHOLDER =
  '예) 백엔드 개발자, AI 엔지니어, 프론트엔드 인턴 등';

const ADDITIONAL_NOTES_PLACEHOLDER =
  '예) 프로젝트 경험 위주로 강조해줘, 간결하게 작성해줘 등';

const AutoAwesomeIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
);

export interface CvGenerateStep2Props {
  isMobile: boolean;
  draftTitle: string;
  onDraftTitleChange: (v: string) => void;
  jobPosting: string;
  onJobPostingChange: (v: string) => void;
  targetPosition: string;
  onTargetPositionChange: (v: string) => void;
  additionalNotes: string;
  onAdditionalNotesChange: (v: string) => void;
  onPrev: () => void;
  onBuildPrompt: () => void;
  buildPromptPending: boolean;
}

const CvGenerateStep2 = ({
  isMobile,
  draftTitle,
  onDraftTitleChange,
  jobPosting,
  onJobPostingChange,
  targetPosition,
  onTargetPositionChange,
  additionalNotes,
  onAdditionalNotesChange,
  onPrev,
  onBuildPrompt,
  buildPromptPending,
}: CvGenerateStep2Props) => {
  const theme = useTheme();

  return (
    <>
      <Flex.Column gap="1.25rem" width="100%" style={{ marginTop: '1.5rem' }}>
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
            제목·공고 정보·지원 직무는 필수입니다. 추가 요청사항은 선택입니다.
          </Text>
        </Flex.Column>

        <S.JdFieldRow align="flex-start" gap="0.65rem" width="100%">
          <S.FieldLeadIcon aria-hidden>
            <SubtitlesOutlinedIcon sx={{ fontSize: 22, color: palette.grey600 }} />
          </S.FieldLeadIcon>
          <Flex.Column gap="0.35rem" style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
            <TextField
              required
              fullWidth
              label="제목"
              helperText="이력서 히스토리에서 구분할 이름을 짧게 입력하세요."
              placeholder={TITLE_PLACEHOLDER}
              value={draftTitle}
              onChange={e => onDraftTitleChange(e.target.value)}
              inputProps={{
                maxLength: INPUT_MAX_LENGTH.REPO_TITLE,
                'aria-label': '이력서 제목',
              }}
            />
          </Flex.Column>
        </S.JdFieldRow>

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
              onChange={e => onJobPostingChange(e.target.value)}
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
              onChange={e => onTargetPositionChange(e.target.value)}
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
        justify="space-between"
        gap="0.75rem"
        wrap="wrap"
        width="100%"
        style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${palette.grey200}`,
        }}
      >
        <S.BackButton
          type="button"
          variant="outlined"
          onClick={onPrev}
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
          disabled={buildPromptPending}
          onClick={onBuildPrompt}
        />
      </Flex.Row>
    </>
  );
};

export default CvGenerateStep2;
