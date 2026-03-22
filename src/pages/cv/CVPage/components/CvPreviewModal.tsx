import { LoadingIcon } from '@/assets';
import { Button, Flex, Text } from '@/components';
import { palette } from '@/styles/palette';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import HtmlIcon from '@mui/icons-material/Html';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState, type FunctionComponent, type SVGProps } from 'react';
import { toast } from 'react-toastify';

import { formatDateOnly } from '@/pages/summary/utils/date';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import type { PortfolioCvDetail } from '../../apis/cv';

export interface CvPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: PortfolioCvDetail | undefined;
  isPending: boolean;
  isError: boolean;
}

const CopyIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <ContentCopyIcon sx={{ fontSize: 18 }} />
);
const CodeIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <CodeIcon sx={{ fontSize: 16 }} />
);
const HtmlIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <HtmlIcon sx={{ fontSize: 16 }} />
);

function notesToPills(notes: string): string[] {
  if (!notes.trim()) return [];
  return notes
    .split(/[,，、]/)
    .map(s => s.trim())
    .filter(Boolean);
}

const CvPreviewModal = ({
  open,
  onClose,
  data,
  isPending,
  isError,
}: CvPreviewModalProps) => {
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  useEffect(() => {
    if (!open) setShowHtmlPreview(false);
  }, [open]);

  useEffect(() => {
    setShowHtmlPreview(false);
  }, [data?.id]);

  const handleCopyPrompt = async () => {
    if (!data?.prompt?.trim()) {
      toast.info('복사할 프롬프트가 없습니다.', { position: 'top-center' });
      return;
    }
    const ok = await copyTextToClipboard(data.prompt);
    if (ok) {
      toast.success('프롬프트가 복사되었습니다.', { position: 'top-center' });
    } else {
      toast.error(
        '복사에 실패했습니다. HTTPS 접속인지 확인하거나 텍스트를 직접 선택해 복사해 주세요.',
        { position: 'top-center' },
      );
    }
  };

  const pills = data ? notesToPills(data.additional_notes ?? '') : [];
  const htmlRaw = data?.html_content ?? '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '0.75rem',
          minHeight: isPending ? 'min(58vh, 440px)' : undefined,
          maxHeight: 'min(90dvh, 680px)',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(83, 127, 241, 0.15)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: 0,
        }}
      >
        <S.HeaderBar direction="column" gap="0.5rem" padding="1rem 1.25rem">
          <Flex.Row align="flex-start" justify="space-between" gap="0.75rem" wrap="wrap">
            <Flex.Row align="center" gap="0.5rem" style={{ flex: '1 1 auto', minWidth: 0 }}>
              <BusinessIcon sx={{ fontSize: 22, color: palette.blue500, flexShrink: 0 }} />
              <Text
                as="h2"
                margin="0"
                bold
                color={palette.nearBlack}
                style={{ fontSize: '1.0625rem', lineHeight: 1.35 }}
              >
                {data ? `${data.title} — ${data.target_position}` : '이력서 미리보기'}
              </Text>
            </Flex.Row>
            <IconButton
              type="button"
              onClick={onClose}
              aria-label="닫기"
              size="small"
              sx={{
                color: palette.grey600,
                flexShrink: 0,
                backgroundColor: palette.white,
                border: `1px solid ${palette.grey200}`,
                '&:hover': { backgroundColor: palette.grey100 },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Flex.Row>

          {data ? (
            <Flex.Row align="center" gap="0.35rem" wrap="wrap">
              <CalendarTodayIcon sx={{ fontSize: 18, color: palette.grey500 }} />
              <Text margin="0" color={palette.grey600} style={{ fontSize: '0.875rem' }}>
                {formatDateOnly(data.updated_at)}
              </Text>
              <Text margin="0" color={palette.grey400} style={{ fontSize: '0.75rem' }}>
                (생성 {formatDateOnly(data.created_at)})
              </Text>
            </Flex.Row>
          ) : null}
        </S.HeaderBar>

        <S.ScrollBody
          direction="column"
          gap="1.25rem"
          padding={isPending ? '0' : '1.25rem 1.25rem 1.5rem'}
          $loading={isPending}
        >
          {isPending ? (
            <S.LoadingArea
              align="center"
              justify="center"
              gap="0.75rem"
              width="100%"
              role="status"
              aria-live="polite"
            >
              <LoadingIcon width={88} height={88} aria-hidden />
              <Text margin="0" color={palette.grey600} style={{ fontSize: '0.875rem' }}>
                이력서 정보를 불러오는 중입니다…
              </Text>
            </S.LoadingArea>
          ) : null}
          {isError ? (
            <Text margin="0" color={palette.pink500} style={{ fontSize: '0.875rem' }}>
              불러오지 못했습니다.
            </Text>
          ) : null}
          {!isPending && data ? (
            <>
              <S.Section direction="column" gap="0.5rem">
                <S.SectionTitle>공고 정보</S.SectionTitle>
                <S.BodyBox>{data.job_posting || '—'}</S.BodyBox>
              </S.Section>

              <S.Section direction="column" gap="0.5rem">
                <S.SectionTitle>추가 요청사항</S.SectionTitle>
                {pills.length > 0 ? (
                  <Flex.Row gap="0.5rem" wrap="wrap">
                    {pills.map(tag => (
                      <S.Pill key={tag}>{tag}</S.Pill>
                    ))}
                  </Flex.Row>
                ) : (
                  <Text margin="0" color={palette.grey500} style={{ fontSize: '0.8125rem' }}>
                    —
                  </Text>
                )}
                {data.additional_notes && pills.length === 0 ? (
                  <S.BodyBox>{data.additional_notes}</S.BodyBox>
                ) : null}
              </S.Section>

              <S.Section direction="column" gap="0.5rem">
                <Flex.Row align="center" justify="space-between" gap="0.75rem" wrap="wrap">
                  <S.SectionTitle>프롬프트</S.SectionTitle>
                  <Button
                    label="복사하기"
                    variant="outlined"
                    color="blue"
                    size="small"
                    icon={CopyIconWrap}
                    iconPosition="start"
                    onClick={handleCopyPrompt}
                    disabled={!data.prompt?.trim()}
                  />
                </Flex.Row>
                <S.PreWrapScrollable>{data.prompt || '—'}</S.PreWrapScrollable>
              </S.Section>

              <S.Section direction="column" gap="0.5rem">
                <Flex.Row align="center" justify="space-between" gap="0.75rem" wrap="wrap">
                  <S.SectionTitle>AI 생성 결과 (HTML)</S.SectionTitle>
                  <Button
                    label={showHtmlPreview ? '소스 보기' : 'HTML 미리보기'}
                    variant="outlined"
                    color="blue"
                    size="small"
                    icon={showHtmlPreview ? CodeIconWrap : HtmlIconWrap}
                    iconPosition="start"
                    onClick={() => setShowHtmlPreview(v => !v)}
                    disabled={!htmlRaw.trim()}
                  />
                </Flex.Row>
                {showHtmlPreview ? (
                  <S.HtmlRenderBox
                    dangerouslySetInnerHTML={{ __html: htmlRaw }}
                  />
                ) : (
                  <S.PreWrapScrollable>
                    {htmlRaw.trim() ? htmlRaw : '—'}
                  </S.PreWrapScrollable>
                )}
              </S.Section>
            </>
          ) : null}
        </S.ScrollBody>
      </DialogContent>
    </Dialog>
  );
};

export default CvPreviewModal;

const S = {
  HeaderBar: styled(Flex.Column)`
    flex-shrink: 0;
    background-color: ${palette.blue300};
    border-bottom: 1px solid ${palette.grey200};
  `,
  ScrollBody: styled(Flex.Column, {
    shouldForwardProp: p => p !== '$loading',
  })<{ $loading?: boolean }>`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: ${({ $loading }) => ($loading ? 'hidden' : 'auto')};
    background-color: ${palette.white};
  `,
  LoadingArea: styled(Flex.Column)`
    flex: 1 1 auto;
    min-height: min(52vh, 380px);
    width: 100%;
    box-sizing: border-box;
    padding: 1.5rem 1.25rem;
  `,
  Section: styled(Flex.Column)`
    width: 100%;
    min-width: 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${palette.grey200};
    &:last-of-type {
      border-bottom: none;
      padding-bottom: 0;
    }
  `,
  SectionTitle: styled('span')`
    display: inline-block;
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 700;
    color: ${palette.grey600};
  `,
  BodyBox: styled('div')`
    margin: 0;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.55;
    color: ${palette.nearBlack};
    background-color: ${palette.grey100};
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    white-space: pre-wrap;
    word-break: break-word;
  `,
  PreWrapScrollable: styled('pre')`
    margin: 0;
    padding: 0.75rem 1rem;
    max-height: min(42vh, 400px);
    overflow: auto;
    font-size: 0.8125rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${palette.nearBlack};
    background-color: ${palette.grey100};
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    font-family: ui-monospace, monospace;
  `,
  HtmlRenderBox: styled('div')`
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.55;
    color: ${palette.nearBlack};
    background-color: ${palette.white};
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    word-break: break-word;
    min-height: 3rem;
  `,
  Pill: styled('span')`
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: ${palette.nearBlack};
    background-color: ${palette.blue300};
    border: 1px solid ${palette.grey200};
    border-radius: 2rem;
  `,
};
