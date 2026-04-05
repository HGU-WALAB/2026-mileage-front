import { Button, Flex, Heading, Text } from '@/components';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { Dialog, DialogContent, IconButton, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, type FunctionComponent, type SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { openCvShareInNewTab, ROUTE_PATH } from '@/constants/routePath';

import { formatDateOnly } from '@/pages/portfolio/utils/date';
import {
  getPortfolioCvById,
  getPortfolioCvList,
  type PortfolioCvListItem,
} from '../../apis/cv';
import useDeletePortfolioCvMutation from '../../hooks/useDeletePortfolioCvMutation';
import usePatchPortfolioCvMutation from '../../hooks/usePatchPortfolioCvMutation';
import CvPreviewModal from './CvPreviewModal';
import { CvHtmlPublicSwitchControl } from './cvHtmlPublicUi';

const CV_QUERY_CONFIG = { retry: 1, refetchOnWindowFocus: false } as const;

const AddIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AddIcon sx={{ fontSize: 20 }} />
);
const VisibilityIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <VisibilityIcon sx={{ fontSize: 18 }} />
);
const DeleteOutlineIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
);

export interface CvManagementPanelProps {
  onClose: () => void;
}

function truncateText(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function keywordCount(notes: string): number {
  if (!notes.trim()) return 0;
  return notes
    .split(/[,，、]/)
    .map(x => x.trim())
    .filter(Boolean).length;
}

const CvManagementPanel = ({ onClose }: CvManagementPanelProps) => {
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const deleteMutation = useDeletePortfolioCvMutation();
  const patchMutation = usePatchPortfolioCvMutation();
  const publishingId =
    patchMutation.isPending && patchMutation.variables
      ? patchMutation.variables.id
      : null;

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.portfolioCv, 'list'] as const,
    queryFn: () => getPortfolioCvList(),
    ...CV_QUERY_CONFIG,
  });

  const cvs = listQuery.data?.cvs ?? [];

  const detailQuery = useQuery({
    queryKey: [QUERY_KEYS.portfolioCv, 'detail', previewId] as const,
    queryFn: () => getPortfolioCvById(previewId!),
    enabled: previewId != null,
    ...CV_QUERY_CONFIG,
  });

  const openPreview = useCallback((id: number) => {
    setPreviewId(id);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewId(null);
  }, []);

  const handleDeleteCv = useCallback(
    (id: number) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('포트폴리오가 삭제되었습니다.', { position: 'top-center' });
          setPreviewId(current => (current === id ? null : current));
        },
        onError: () => {
          toast.error('삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.', {
            position: 'top-center',
          });
        },
      });
    },
    [deleteMutation],
  );

  const deletePending = deleteMutation.isPending;

  const confirmDeleteCv = useCallback(() => {
    if (deleteConfirmId == null) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    handleDeleteCv(id);
  }, [deleteConfirmId, handleDeleteCv]);

  const handleListHtmlPublicChange = useCallback(
    (item: PortfolioCvListItem, next: boolean) => {
      if (!String(item.public_token ?? '').trim()) {
        toast.error('공개 토큰이 없습니다. 포트폴리오를 다시 저장해 주세요.', {
          position: 'top-center',
        });
        return;
      }
      patchMutation.mutate(
        { id: item.id, body: { is_public: next } },
        {
          onSuccess: () => {
            toast.success(
              next
                ? 'HTML이 공개되었습니다. 「링크 열기」로 미리보기 할 수 있습니다.'
                : '비공개로 전환했습니다.',
              { position: 'top-center' },
            );
          },
          onError: () => {
            toast.error('공개 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.', {
              position: 'top-center',
            });
          },
        },
      );
    },
    [patchMutation],
  );

  return (
    <S.Root
      width="100%"
      style={{ flex: 1, minHeight: 0, minWidth: 0 }}
      gap="0"
    >
      <S.HeaderRow
        align="center"
        justify="space-between"
        wrap="wrap"
        gap="0.75rem"
        padding="0.75rem 1rem"
      >
        <Flex.Row align="center" gap="0.5rem" wrap="wrap">
          <Heading
            as="h3"
            margin="0"
            color={palette.nearBlack}
            style={{
              fontWeight: 700,
              fontSize: '1.125rem',
              lineHeight: 1.5,
            }}
          >
            포트폴리오 관리
          </Heading>
        </Flex.Row>
        <Flex.Row align="center" gap="0.5rem" wrap="wrap">
          <Button
            label="포트폴리오 생성"
            variant="contained"
            color="blue"
            size="medium"
            icon={AddIconWrap}
            iconPosition="start"
            onClick={() => {
              onClose();
              navigate(ROUTE_PATH.cv);
            }}
          />
          <IconButton
            type="button"
            onClick={onClose}
            aria-label="포트폴리오 패널 닫기"
            size="small"
            sx={{ color: palette.grey600 }}
          >
            <CloseIcon />
          </IconButton>
        </Flex.Row>
      </S.HeaderRow>

      {listQuery.isPending ? <LinearProgress /> : null}

      <S.ListArea
        direction="column"
        gap="1rem"
        padding="1rem"
        width="100%"
        style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}
      >
        <Text
          // as="h5"
          margin="0"
          bold
          color={palette.grey600}
          style={{ fontSize: '0.875rem' }}
        >
          히스토리 ({cvs.length})
        </Text>
        {listQuery.isError ? (
          <Text margin="0" color={palette.pink500} style={{ fontSize: '0.875rem' }}>
            목록을 불러오지 못했습니다.
          </Text>
        ) : null}
        {!listQuery.isPending && cvs.length === 0 ? (
          <S.EmptyConnectCard>
            <S.EmptyConnectMessage>저장된 포트폴리오가 없습니다.</S.EmptyConnectMessage>
          </S.EmptyConnectCard>
        ) : null}
        {cvs.map(item => (
          <CvHistoryCard
            key={item.id}
            item={item}
            onView={() => openPreview(item.id)}
            onRequestDelete={() => setDeleteConfirmId(item.id)}
            deletePending={deletePending}
            onHtmlPublicChange={next => handleListHtmlPublicChange(item, next)}
            publicToggleDisabled={
              publishingId === item.id || !String(item.public_token ?? '').trim()
            }
            onOpenShareLink={() => {
              const token = String(item.public_token ?? '').trim();
              if (!token) return;
              if (!openCvShareInNewTab(token)) {
                toast.warn('새 창이 열리지 않았습니다. 팝업 차단을 해제해 주세요.', {
                  position: 'top-center',
                });
              }
            }}
          />
        ))}
      </S.ListArea>

      <CvPreviewModal
        open={previewId != null}
        onClose={closePreview}
        data={detailQuery.data}
        isPending={previewId != null && detailQuery.isPending}
        isError={previewId != null && detailQuery.isError}
        onRequestDelete={
          previewId != null ? () => setDeleteConfirmId(previewId) : undefined
        }
        isDeletePending={deletePending}
      />

      <Dialog
        open={deleteConfirmId != null}
        aria-labelledby="cv-delete-confirm-title"
        onClose={() => {
          if (deletePending) return;
          setDeleteConfirmId(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0.75rem',
            border: `1px solid ${palette.grey200}`,
            boxShadow: '0 4px 24px rgba(83, 127, 241, 0.15)',
            width: '100%',
            maxWidth: '26rem',
            overflow: 'hidden',
          },
        }}
        sx={{ zIndex: theme => theme.zIndex.modal + 2 }}
      >
        <DialogContent
          sx={{
            p: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Flex.Row align="flex-start" gap="0.5rem" width="100%" style={{ minWidth: 0 }}>
            <DeleteOutlineIcon
              sx={{ fontSize: 22, color: palette.red500, flexShrink: 0, marginTop: '0.125rem' }}
              aria-hidden
            />
            <Flex.Column gap="0.5rem" style={{ flex: '1 1 auto', minWidth: 0 }}>
              <Heading
                as="h2"
                margin="0"
                color={palette.nearBlack}
                id="cv-delete-confirm-title"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                포트폴리오를 삭제할까요?
              </Heading>
              <Text
                margin="0"
                color={palette.grey600}
                style={{ fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all' }}
              >
                저장된 HTML·프롬프트·공개 링크 설정이 함께 사라지며, 되돌릴 수 없습니다.
              </Text>
            </Flex.Column>
          </Flex.Row>
          <S.DeleteDialogActions>
            <Flex.Row align="center" justify="flex-end" gap="0.5rem" wrap="wrap" width="100%">
              <Button
                label="취소"
                variant="outlined"
                color="grey"
                size="medium"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deletePending}
              />
              <Button
                label="삭제하기"
                variant="outlined"
                color="red"
                size="medium"
                icon={DeleteOutlineIconWrap}
                iconPosition="start"
                onClick={confirmDeleteCv}
                disabled={deletePending}
              />
            </Flex.Row>
          </S.DeleteDialogActions>
        </DialogContent>
      </Dialog>
    </S.Root>
  );
};

function CvHistoryCard({
  item,
  onView,
  onRequestDelete,
  deletePending,
  onHtmlPublicChange,
  publicToggleDisabled,
  onOpenShareLink,
}: {
  item: PortfolioCvListItem;
  onView: () => void;
  onRequestDelete: () => void;
  deletePending: boolean;
  onHtmlPublicChange: (next: boolean) => void;
  publicToggleDisabled: boolean;
  onOpenShareLink: () => void;
}) {
  const kCount = keywordCount(item.additional_notes ?? '');
  const subLine =
    kCount > 0
      ? `반영 키워드 ${kCount}개`
      : item.additional_notes?.trim()
        ? '추가 요청 있음'
        : '추가 요청 없음';
  const snippetSource =
    [item.job_posting, item.target_position, item.additional_notes]
      .filter(Boolean)
      .join(' · ') || '미리보기 내용이 없습니다.';
  const snippet = truncateText(snippetSource, 140);

  return (
    <S.Card>
      <Flex.Column gap="0.65rem" width="100%" style={{ minWidth: 0 }}>
        <Flex.Row
          align="flex-start"
          justify="space-between"
          gap="0.75rem"
          wrap="wrap"
          width="100%"
          style={{ minWidth: 0 }}
        >
          <Flex.Row align="center" gap="0.75rem" wrap="wrap" style={{ flex: '1 1 auto', minWidth: 0 }}>
            <S.MetaChip>
              <BusinessIcon sx={{ fontSize: 16, color: palette.grey500 }} />
              <span>{item.title || '—'}</span>
            </S.MetaChip>
            <S.MetaChip>
              <WorkOutlineIcon sx={{ fontSize: 16, color: palette.grey500 }} />
              <span>{item.target_position || '—'}</span>
            </S.MetaChip>
            <S.MetaChip>
              <CalendarTodayIcon sx={{ fontSize: 16, color: palette.grey500 }} />
              <span>{formatDateOnly(item.updated_at)}</span>
            </S.MetaChip>
          </Flex.Row>
          <Flex.Row
            align="center"
            gap="0.5rem"
            wrap="wrap"
            style={{ flexShrink: 0 }}
          >
            <Button
              label="보기"
              variant="outlined"
              color="blue"
              size="medium"
              icon={VisibilityIconWrap}
              iconPosition="start"
              onClick={onView}
            />
            <Button
              label="삭제"
              variant="outlined"
              color="red"
              size="medium"
              icon={DeleteOutlineIconWrap}
              iconPosition="start"
              onClick={onRequestDelete}
              disabled={deletePending}
            />
          </Flex.Row>
        </Flex.Row>

        <CvHtmlPublicSwitchControl
          isPublic={Boolean(item.is_public)}
          onPublicChange={onHtmlPublicChange}
          disabled={publicToggleDisabled}
          size="medium"
          linkButton={{
            onClick: onOpenShareLink,
            disabled: !String(item.public_token ?? '').trim(),
          }}
        />

        <Text margin="0" color={palette.grey500} style={{ fontSize: '0.8125rem' }}>
          {subLine}
        </Text>
        <S.SnippetBox>{snippet}</S.SnippetBox>
      </Flex.Column>
    </S.Card>
  );
}

export default CvManagementPanel;

const S = {
  Root: styled(Flex.Column)`
    border: 1px solid ${palette.grey200};
    border-radius: 0.75rem;
    background-color: ${palette.white};
    box-shadow: 0 1px 4px rgba(83, 127, 241, 0.12);
  `,
  HeaderRow: styled(Flex.Row)`
    flex-shrink: 0;
    border-bottom: 1px solid ${palette.grey200};
    background-color: ${palette.blue300};
  `,
  ListArea: styled(Flex.Column)`
    flex-shrink: 0;
    background-color: ${palette.grey100};
  `,
  /** `ListArea`(grey100) 위에서 카드처럼 떠 보이도록 히스토리 카드(`S.Card`)와 동일한 면·테두리·그림자 */
  EmptyConnectCard: styled('div')`
    padding: 2rem 1.5rem;
    border-radius: 0.75rem;
    background-color: ${palette.white};
    border: 1px solid ${palette.grey200};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    min-height: 7.5rem;
  `,
  EmptyConnectMessage: styled('p')`
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    letter-spacing: 0.01em;
    color: ${palette.grey600};
    font-weight: 500;
    text-align: center;
  `,
  Card: styled('div')`
    display: flex;
    flex-direction: column;
    padding: 1rem 1.1rem;
    border-radius: 0.75rem;
    background-color: ${palette.white};
    border: 1px solid ${palette.grey200};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    box-sizing: border-box;
  `,
  MetaChip: styled('span')`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${palette.nearBlack};
  `,
  SnippetBox: styled('div')`
    margin: 0;
    padding: 0.65rem 0.85rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: ${palette.grey600};
    background-color: ${palette.grey100};
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    word-break: break-word;
  `,
  DeleteDialogActions: styled('div')`
    box-sizing: border-box;
    margin: 0 -1.5rem -1.25rem;
    padding: 0.85rem 1.5rem 1rem;
    border-top: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
  `,
};
