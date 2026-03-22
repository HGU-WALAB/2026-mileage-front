import { Button, Flex, Text } from '@/components';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { IconButton, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, type FunctionComponent, type SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTE_PATH } from '@/constants/routePath';

import { formatDateOnly } from '@/pages/summary/utils/date';
import {
  getPortfolioCvById,
  getPortfolioCvList,
  type PortfolioCvListItem,
} from '../apis/cv';
import CvPreviewModal from './CvPreviewModal';

const CV_QUERY_CONFIG = { retry: 1, refetchOnWindowFocus: false } as const;

const AddIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AddIcon sx={{ fontSize: 20 }} />
);
const VisibilityIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <VisibilityIcon sx={{ fontSize: 18 }} />
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
          <Text as="span" bold margin="0" color={palette.nearBlack}>
            이력서 관리
          </Text>
        </Flex.Row>
        <Flex.Row align="center" gap="0.5rem" wrap="wrap">
          <Button
            label="이력서 생성"
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
            aria-label="이력서 패널 닫기"
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
          as="h3"
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
          <Text margin="0" color={palette.grey500} style={{ fontSize: '0.875rem' }}>
            저장된 이력서가 없습니다.
          </Text>
        ) : null}
        {cvs.map(item => (
          <CvHistoryCard
            key={item.id}
            item={item}
            onView={() => openPreview(item.id)}
          />
        ))}
      </S.ListArea>

      <CvPreviewModal
        open={previewId != null}
        onClose={closePreview}
        data={detailQuery.data}
        isPending={previewId != null && detailQuery.isPending}
        isError={previewId != null && detailQuery.isError}
      />
    </S.Root>
  );
};

function CvHistoryCard({
  item,
  onView,
}: {
  item: PortfolioCvListItem;
  onView: () => void;
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
          <Flex.Row style={{ flexShrink: 0 }}>
            <Button
              label="보기"
              variant="outlined"
              color="blue"
              size="medium"
              icon={VisibilityIconWrap}
              iconPosition="start"
              onClick={onView}
            />
          </Flex.Row>
        </Flex.Row>
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
};
