import { Flex, Input, Text } from '@/components';
import { palette } from '@/styles/palette';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { styled, useTheme } from '@mui/material';
import { toast } from 'react-toastify';

import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import { putPortfolioMileageItem } from '../../apis/portfolio';
import {
  usePortfolioContext,
} from '../context/PortfolioContext';
import type { MileageItem } from '../../types/portfolioItems';

interface MileageSectionContentProps {
  readOnly?: boolean;
}

const ITEMS_PER_PAGE = 6;

const MileageSectionContent = ({
  readOnly = false,
}: MileageSectionContentProps) => {
  const theme = useTheme();
  const { mileageItems, setMileageItems } = usePortfolioContext();
  const [editingItem, setEditingItem] = useState<MileageItem | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [page, setPage] = useState(0);

  const displayItems = mileageItems;

  const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(
    () =>
      displayItems.slice(
        page * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      ),
    [displayItems, page],
  );

  useEffect(() => {
    setPage(p => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const handleStartEdit = useCallback((item: MileageItem) => {
    setEditingItem(item);
    setEditDraft(item.additional_info);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingItem == null) return;
    const next = editDraft.trim();
    const portfolioId = editingItem.id;
    if (portfolioId != null) {
      try {
        await putPortfolioMileageItem(portfolioId, { additional_info: next });
      } catch {
        toast.error('추가 설명 저장에 실패했습니다.');
        return;
      }
    }
    setMileageItems(prev =>
      prev.map(m =>
        m.mileage_id === editingItem.mileage_id
          ? { ...m, additional_info: next }
          : m,
      ),
    );
    setEditingItem(null);
    setEditDraft('');
  }, [editingItem, editDraft, setMileageItems]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setEditDraft('');
  }, []);

  return (
    <Flex.Column gap="1rem" style={{ width: '100%' }}>
      <S.List>
        {paginatedItems.map(row => (
          <S.Row key={row.mileage_id}>
            {/* 메타 행: 학기 + 카테고리 + 제목 */}
            <Flex.Row align="center" gap="0.5rem" wrap="wrap">
              <Text
                as="span"
                style={{
                  ...theme.typography.body2,
                  color: theme.palette.grey[600],
                  flexShrink: 0,
                  margin: 0,
                }}
              >
                {row.semester}
              </Text>
              <S.CategoryTag>{row.category}</S.CategoryTag>
              <Text
                as="span"
                style={{
                  ...theme.typography.body2,
                  fontWeight: 600,
                  margin: 0,
                  wordBreak: 'break-word',
                }}
              >
                {row.item}
              </Text>
            </Flex.Row>
            {/* 내용 행: 추가 설명 + 편집 버튼 */}
            {!readOnly && editingItem?.mileage_id === row.mileage_id ? (
              <Flex.Row
                gap="0.5rem"
                align="flex-start"
                style={{ width: '100%' }}
              >
                <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    multiline
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    placeholder="마일리지 활동의 상세 내용을 입력해 주세요."
                    autoFocus
                    rows={2}
                    inputProps={{
                      maxLength: INPUT_MAX_LENGTH.MILEAGE_ADDITIONAL_INFO,
                      'aria-label': '유저 추가 설명',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.variant.default,
                      },
                      '& textarea': {
                        resize: 'vertical',
                      },
                    }}
                  />
                  <S.CharCount
                    warn={
                      editDraft.length >=
                      INPUT_MAX_LENGTH.MILEAGE_ADDITIONAL_INFO - 20
                    }
                  >
                    {editDraft.length} /{' '}
                    {INPUT_MAX_LENGTH.MILEAGE_ADDITIONAL_INFO}
                  </S.CharCount>
                </Flex.Column>
                <Flex.Column gap="0.25rem" style={{ flexShrink: 0 }}>
                  <S.SmallButton type="button" onClick={handleSaveEdit}>
                    저장
                  </S.SmallButton>
                  <S.SmallButton
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    취소
                  </S.SmallButton>
                </Flex.Column>
              </Flex.Row>
            ) : (
              <Flex.Row
                align="center"
                justify="space-between"
                gap="0.5rem"
                style={{ width: '100%' }}
              >
                <Text
                  as="span"
                  style={{
                    ...theme.typography.body2,
                    color: theme.palette.grey[600],
                    margin: 0,
                    wordBreak: 'break-word',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {row.additional_info ? (
                    <>{row.additional_info}</>
                  ) : (
                    <span style={{ color: theme.palette.grey[400] }}>
                      추가 설명을 통해 더 나은 프롬프트 결과를 얻을 수 있습니다.
                    </span>
                  )}
                </Text>
                {!readOnly && (
                  <S.EditButton
                    type="button"
                    onClick={() => handleStartEdit(row)}
                    aria-label="내용 수정"
                    style={{ flexShrink: 0 }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </S.EditButton>
                )}
              </Flex.Row>
            )}
          </S.Row>
        ))}
      </S.List>
      {totalPages > 1 && (
        <S.Pagination align="center" gap="0.5rem">
          <S.PageButton
            type="button"
            disabled={page === 0}
            onClick={() => {
              handleCancelEdit();
              setPage(p => Math.max(0, p - 1));
            }}
            aria-label="이전 페이지"
          >
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </S.PageButton>
          <Text
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[600],
            }}
          >
            {page + 1} / {totalPages}
          </Text>
          <S.PageButton
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => {
              handleCancelEdit();
              setPage(p => Math.min(totalPages - 1, p + 1));
            }}
            aria-label="다음 페이지"
          >
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </S.PageButton>
        </S.Pagination>
      )}
    </Flex.Column>
  );
};

export default MileageSectionContent;

const S = {
  List: styled(Flex.Column)`
    gap: 0.5rem;
  `,
  Row: styled(Flex.Column)`
    padding: 0.75rem 1rem;
    gap: 0.375rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid ${({ theme }) => theme.palette.grey[200]};
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    &:hover {
      border-color: ${({ theme }) => theme.palette.grey[300]};
      box-shadow: 0 2px 6px rgba(16, 24, 40, 0.08);
    }
  `,
  CategoryTag: styled('span')`
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.625rem;
    border-radius: 999px;
    background-color: ${palette.white};
    color: ${palette.blue500};
    border: 1.5px solid ${palette.blue400};
    font-size: 0.75rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(83, 127, 241, 0.08);
  `,
  EditButton: styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border: none;
    background: none;
    cursor: pointer;
    color: ${palette.grey500};
    border-radius: 0.25rem;
    &:hover {
      color: ${palette.blue500};
      background-color: ${palette.blue300};
    }
  `,
  CharCount: styled('span')<{ warn?: boolean }>`
    font-size: 0.75rem;
    color: ${({ warn }) => (warn ? palette.pink500 : palette.grey400)};
    flex-shrink: 0;
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
    &:hover {
      opacity: 0.9;
    }
  `,
  Pagination: styled(Flex.Row)`
    margin-top: 0.5rem;
  `,
  PageButton: styled('button')`
    padding: 0.25rem;
    border: none;
    background: none;
    cursor: pointer;
    color: ${({ theme }) => theme.palette.grey[600]};
    border-radius: 0.25rem;
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.palette.grey[200]};
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
};
