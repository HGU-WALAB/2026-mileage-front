import { Flex, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useCallback, useMemo, useState } from 'react';
import { styled, useTheme } from '@mui/material';
import { toast } from 'react-toastify';

import { putPortfolioMileageItem } from '../../apis/portfolio';
import {
  type MileageItem,
  useSummaryContext,
} from '../context/SummaryContext';

interface MileageSectionContentProps {
  readOnly?: boolean;
}

const MileageSectionContent = ({
  readOnly = false,
}: MileageSectionContentProps) => {
  const theme = useTheme();
  const { mileageItems, setMileageItems } = useSummaryContext();
  const [editingItem, setEditingItem] = useState<MileageItem | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const displayItems = useMemo(
    () => (readOnly ? mileageItems.filter(m => m.is_visible) : mileageItems),
    [mileageItems, readOnly],
  );

  const handleToggleVisible = useCallback(
    (mileageId: number) => {
      setMileageItems(prev =>
        prev.map(m =>
          m.mileage_id === mileageId ? { ...m, is_visible: !m.is_visible } : m,
        ),
      );
    },
    [setMileageItems],
  );

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
    <S.List>
      {displayItems.map(row => (
        <S.Row key={row.mileage_id} align="center" gap="0.75rem" wrap="wrap">
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
              minWidth: 0,
              flex: 1,
              margin: 0,
            }}
          >
            {row.item}
          </Text>
          {!readOnly && editingItem?.mileage_id === row.mileage_id ? (
            <Flex.Row
              gap="0.5rem"
              align="center"
              style={{ flex: 1, minWidth: '12rem' }}
            >
              <S.EditInput
                value={editDraft}
                onChange={e => setEditDraft(e.target.value)}
                placeholder="추가 설명"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
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
            </Flex.Row>
          ) : (
            <Text
              as="span"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                minWidth: 0,
                margin: 0,
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
          )}
          {!readOnly && (
            <Flex.Row gap="0.25rem" align="center" style={{ flexShrink: 0 }}>
              {editingItem?.mileage_id !== row.mileage_id && (
                <S.EditButton
                  type="button"
                  onClick={() => handleStartEdit(row)}
                  aria-label="내용 수정"
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </S.EditButton>
              )}
              <S.EyeButton
                type="button"
                onClick={() => handleToggleVisible(row.mileage_id)}
                aria-label={
                  row.is_visible ? '미리보기에서 숨기기' : '미리보기에 표시'
                }
              >
                {row.is_visible ? (
                  <VisibilityIcon
                    sx={{ fontSize: 18, color: palette.blue500 }}
                  />
                ) : (
                  <VisibilityOffOutlinedIcon
                    sx={{ fontSize: 18, color: theme.palette.grey[500] }}
                  />
                )}
              </S.EyeButton>
            </Flex.Row>
          )}
        </S.Row>
      ))}
    </S.List>
  );
};

export default MileageSectionContent;

const S = {
  List: styled(Flex.Column)`
    gap: 0.5rem;
  `,
  Row: styled(Flex.Row)`
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-left: 3px solid ${palette.blue400};
    ${boxShadow};
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    overflow: hidden;
    &:hover {
      box-shadow: 0 2px 8px rgba(83, 127, 241, 0.1);
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
  EditInput: styled('input')`
    flex: 1;
    min-width: 8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    border: 1.5px solid ${palette.blue400};
    font-size: 0.875rem;
    outline: none;
    &:focus {
      border-color: ${palette.blue500};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
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
  EyeButton: styled('button')`
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &:hover {
      opacity: 0.8;
    }
  `,
};
