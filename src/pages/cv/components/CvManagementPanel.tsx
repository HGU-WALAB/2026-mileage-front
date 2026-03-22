import { Button, Flex, Text } from '@/components';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, LinearProgress, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import {
  useCallback,
  useState,
  type FunctionComponent,
  type SVGProps,
} from 'react';

import { formatDateOnly } from '@/pages/summary/utils/date';
import {
  getPortfolioCvById,
  getPortfolioCvList,
  type PortfolioCvDetail,
} from '../apis/cv';

const CV_QUERY_CONFIG = { retry: 1, refetchOnWindowFocus: false } as const;

const AddIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AddIcon sx={{ fontSize: 20 }} />
);

export interface CvManagementPanelProps {
  onClose: () => void;
}

const CvManagementPanel = ({ onClose }: CvManagementPanelProps) => {
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.portfolioCv, 'list'] as const,
    queryFn: () => getPortfolioCvList(),
    ...CV_QUERY_CONFIG,
  });

  const cvs = listQuery.data?.cvs ?? [];

  const detailQuery = useQuery({
    queryKey: [QUERY_KEYS.portfolioCv, 'detail', selectedId] as const,
    queryFn: () => getPortfolioCvById(selectedId!),
    enabled: selectedId != null,
    ...CV_QUERY_CONFIG,
  });

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
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

      <Flex
        direction={isMobile ? 'column' : 'row'}
        align="stretch"
        gap="1rem"
        padding="1rem"
        width="100%"
        style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}
      >
        <S.ListColumn
          direction="column"
          gap="0.75rem"
          style={{
            flex: isMobile ? '0 0 auto' : '1 1 42%',
            maxHeight: isMobile ? '14rem' : 'none',
            minHeight: 0,
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          <Text
            as="h3"
            margin="0"
            bold
            color={palette.grey600}
            style={{ fontSize: '0.875rem' }}
          >
            목록 ({cvs.length})
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
            <S.ListCard
              key={item.id}
              type="button"
              $active={item.id === selectedId}
              onClick={() => handleSelect(item.id)}
            >
              <Text
                as="span"
                margin="0 0 0.25rem 0"
                bold
                color={palette.nearBlack}
                style={{ fontSize: '0.9375rem', textAlign: 'left' }}
              >
                {item.title}
              </Text>
              <Text
                margin="0 0 0.25rem 0"
                color={palette.grey600}
                style={{ fontSize: '0.8125rem', textAlign: 'left' }}
              >
                {item.target_position}
              </Text>
              <Text
                margin="0"
                color={palette.grey500}
                style={{ fontSize: '0.75rem', textAlign: 'left' }}
              >
                {formatDateOnly(item.updated_at)}
              </Text>
            </S.ListCard>
          ))}
        </S.ListColumn>

        <S.DetailColumn
          direction="column"
          gap="0.75rem"
          style={{
            flex: isMobile ? '1 1 auto' : '1 1 58%',
            minHeight: isMobile ? '12rem' : 0,
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          <Text
            as="h3"
            margin="0"
            bold
            color={palette.grey600}
            style={{ fontSize: '0.875rem' }}
          >
            상세
          </Text>
          {selectedId == null ? (
            <Text margin="0" color={palette.grey500} style={{ fontSize: '0.875rem' }}>
              목록에서 이력서를 선택하면 상세 정보가 표시됩니다.
            </Text>
          ) : null}
          {selectedId != null && detailQuery.isPending ? (
            <LinearProgress />
          ) : null}
          {selectedId != null && detailQuery.isError ? (
            <Text margin="0" color={palette.pink500} style={{ fontSize: '0.875rem' }}>
              상세 정보를 불러오지 못했습니다.
            </Text>
          ) : null}
          {detailQuery.data ? (
            <CvDetailView data={detailQuery.data} />
          ) : null}
        </S.DetailColumn>
      </Flex>
    </S.Root>
  );
};

function CvDetailView({ data }: { data: PortfolioCvDetail }) {
  return (
    <Flex.Column gap="1rem" width="100%" style={{ minWidth: 0 }}>
      <Flex.Row align="flex-start" justify="space-between" gap="1rem" wrap="wrap">
        <Text as="h2" margin="0" bold color={palette.nearBlack} style={{ fontSize: '1.25rem' }}>
          {data.title}
        </Text>
        <Text margin="0" color={palette.grey500} style={{ fontSize: '0.8125rem' }}>
          {formatDateOnly(data.updated_at)}
        </Text>
      </Flex.Row>
      <S.FieldBlock direction="column" gap="0.25rem">
        <S.FieldLabel>공고 정보</S.FieldLabel>
        <S.FieldValue>{data.job_posting || '—'}</S.FieldValue>
      </S.FieldBlock>
      <S.FieldBlock direction="column" gap="0.25rem">
        <S.FieldLabel>지원 직무</S.FieldLabel>
        <S.FieldValue>{data.target_position || '—'}</S.FieldValue>
      </S.FieldBlock>
      <S.FieldBlock direction="column" gap="0.25rem">
        <S.FieldLabel>추가 요청사항</S.FieldLabel>
        <S.FieldValue>{data.additional_notes || '—'}</S.FieldValue>
      </S.FieldBlock>
      <S.FieldBlock direction="column" gap="0.25rem">
        <S.FieldLabel>프롬프트</S.FieldLabel>
        <S.PreBlock>{data.prompt || '—'}</S.PreBlock>
      </S.FieldBlock>
      <S.FieldBlock direction="column" gap="0.25rem">
        <S.FieldLabel>HTML 미리보기</S.FieldLabel>
        <S.HtmlPreview
          dangerouslySetInnerHTML={{ __html: data.html_content || '' }}
        />
      </S.FieldBlock>
    </Flex.Column>
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
  ListColumn: styled(Flex.Column)`
    flex-shrink: 0;
  `,
  DetailColumn: styled(Flex.Column)`
    flex-shrink: 0;
  `,
  ListCard: styled('button')<{ $active: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid
      ${({ $active }) => ($active ? palette.blue500 : palette.grey200)};
    background-color: ${({ $active }) => ($active ? palette.blue300 : palette.white)};
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s ease, background-color 0.15s ease;
    box-sizing: border-box;
    &:hover {
      border-color: ${palette.blue400};
    }
  `,
  FieldBlock: styled(Flex.Column)`
    width: 100%;
    min-width: 0;
  `,
  FieldLabel: styled('span')`
    display: block;
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${palette.grey500};
    text-transform: uppercase;
    letter-spacing: 0.02em;
  `,
  FieldValue: styled('p')`
    margin: 0;
    font-size: 0.875rem;
    color: ${palette.nearBlack};
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  `,
  PreBlock: styled('pre')`
    margin: 0;
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${palette.nearBlack};
    background-color: ${palette.grey100};
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    font-family: inherit;
  `,
  HtmlPreview: styled('div')`
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: ${palette.nearBlack};
    background-color: ${palette.white};
    border-radius: 0.5rem;
    border: 1px solid ${palette.grey200};
    min-height: 4rem;
    word-break: break-word;
  `,
};
