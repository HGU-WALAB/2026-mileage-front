import { Flex, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useState } from 'react';
import { styled, useTheme } from '@mui/material';

import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import {
  type ActivityItem,
  useSummaryContext,
} from '../context/SummaryContext';

interface ActivitiesSectionContentProps {
  readOnly?: boolean;
}

const ActivitiesSectionContent = ({
  readOnly = false,
}: ActivitiesSectionContentProps) => {
  const theme = useTheme();
  const {
    activities,
    setActivities,
    deleteActivity,
    activitiesNextId,
    setActivitiesNextId,
  } = useSummaryContext();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ActivityItem>>({});

  const handleAdd = useCallback(() => {
    const newItem: ActivityItem = {
      id: activitiesNextId,
      title: '새 활동',
      description: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
    };
    setActivities(prev => [newItem, ...prev]);
    setActivitiesNextId(prev => prev - 1);
    setEditingId(newItem.id);
    setEditDraft(newItem);
  }, [activitiesNextId, setActivities, setActivitiesNextId]);

  const handleStartEdit = useCallback((item: ActivityItem) => {
    setEditingId(item.id);
    setEditDraft({ ...item });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId == null || !editDraft.title?.trim()) return;
    setActivities(prev =>
      prev.map(a =>
        a.id === editingId
          ? {
              ...a,
              title: editDraft.title ?? a.title,
              description: editDraft.description ?? a.description,
              start_date: editDraft.start_date ?? a.start_date,
              end_date: editDraft.end_date ?? a.end_date,
            }
          : a,
      ),
    );
    setEditingId(null);
    setEditDraft({});
  }, [editingId, editDraft, setActivities]);

  const handleCancelEdit = useCallback(() => {
    if (editingId != null && editingId < 0) {
      setActivities(prev => prev.filter(a => a.id !== editingId));
    }
    setEditingId(null);
    setEditDraft({});
  }, [editingId, setActivities]);

  const handleDelete = useCallback(
    (id: number) => {
      deleteActivity(id);
      if (editingId === id) {
        setEditingId(null);
        setEditDraft({});
      }
    },
    [editingId, deleteActivity],
  );

  return (
    <Flex.Column gap="0.75rem">
      {!readOnly && (
        <S.AddButton type="button" onClick={handleAdd}>
          <AddIcon sx={{ fontSize: 18 }} />
          활동 추가
        </S.AddButton>
      )}
      <S.List>
        {activities.map(item => (
          <S.Row key={item.id}>
            {!readOnly && editingId === item.id ? (
              <S.EditForm gap="0.5rem">
                <Flex.Column gap="0.5rem" style={{ flex: 1, minWidth: 0 }}>
                  <Flex.Row gap="0.5rem" align="center" wrap="wrap">
                    <S.DateInput
                      type="date"
                      value={editDraft.start_date ?? ''}
                      onChange={e =>
                        setEditDraft(prev => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                    />
                    <Text as="span" style={{ margin: 0, flexShrink: 0 }}>
                      ~
                    </Text>
                    <S.DateInput
                      type="date"
                      value={editDraft.end_date ?? ''}
                      onChange={e =>
                        setEditDraft(prev => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                    />
                    <S.EditInput
                      value={editDraft.title ?? ''}
                      onChange={e =>
                        setEditDraft(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="제목"
                      maxLength={INPUT_MAX_LENGTH.ACTIVITY_TITLE}
                      style={{ flex: '1 1 8rem', minWidth: '6rem' }}
                    />
                  </Flex.Row>
                  <Flex.Column gap="0.25rem">
                    <S.EditTextarea
                      value={editDraft.description ?? ''}
                      onChange={e =>
                        setEditDraft(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="설명"
                      rows={2}
                      maxLength={INPUT_MAX_LENGTH.ACTIVITY_DESCRIPTION}
                    />
                    <S.CharCount warn={(editDraft.description?.length ?? 0) >= INPUT_MAX_LENGTH.ACTIVITY_DESCRIPTION - 20}>
                      {editDraft.description?.length ?? 0} / {INPUT_MAX_LENGTH.ACTIVITY_DESCRIPTION}
                    </S.CharCount>
                  </Flex.Column>
                </Flex.Column>
                <Flex.Column gap="0.25rem" style={{ flexShrink: 0 }}>
                  <S.SmallButton
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editDraft.title?.trim()}
                  >
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
              </S.EditForm>
            ) : (
              <>
                {/* 메타 행: 날짜 + 제목 */}
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
                    {item.start_date} ~ {item.end_date}
                  </Text>
                  <Text
                    as="span"
                    style={{
                      ...theme.typography.body2,
                      fontWeight: 600,
                      margin: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.title}
                  </Text>
                </Flex.Row>
                {/* 내용 행: 설명 + 버튼 */}
                <Flex.Row align="center" justify="space-between" gap="0.5rem" style={{ width: '100%' }}>
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
                    {item.description ? (
                      <>{item.description}</>
                    ) : (
                      <span style={{ color: theme.palette.grey[400] }}>
                        추가 설명을 통해 더 나은 프롬프트 결과를 얻을 수 있습니다.
                      </span>
                    )}
                  </Text>
                  {!readOnly && (
                    <Flex.Row gap="0.25rem" align="center" style={{ flexShrink: 0 }}>
                      <S.EditButton
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        aria-label="수정"
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </S.EditButton>
                      <S.DeleteButton
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label="삭제"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </S.DeleteButton>
                    </Flex.Row>
                  )}
                </Flex.Row>
              </>
            )}
          </S.Row>
        ))}
      </S.List>
    </Flex.Column>
  );
};

export default ActivitiesSectionContent;

const S = {
  AddButton: styled('button')`
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1.5px solid ${palette.blue400};
    background-color: ${palette.white};
    color: ${palette.blue500};
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    align-self: flex-start;
    box-shadow: 0 1px 2px rgba(83, 127, 241, 0.08);
    transition: background-color 0.15s ease, color 0.15s ease,
      box-shadow 0.15s ease;
    &:hover {
      background-color: ${palette.blue300};
      color: ${palette.blue600};
      box-shadow: 0 2px 4px rgba(83, 127, 241, 0.12);
    }
  `,
  List: styled(Flex.Column)`
    gap: 0.5rem;
  `,
  Row: styled(Flex.Column)`
    padding: 0.75rem 1rem;
    gap: 0.375rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-left: 3px solid ${palette.blue400};
    ${boxShadow};
    transition: box-shadow 0.15s ease;
    &:hover {
      box-shadow: 0 2px 8px rgba(83, 127, 241, 0.1);
    }
  `,
  EditForm: styled(Flex.Row)`
    flex: 1;
    min-width: 0;
    align-items: flex-start;
  `,
  EditInput: styled('input')`
    padding: 0.4rem 0.625rem;
    border-radius: 0.375rem;
    border: 1.5px solid ${palette.blue400};
    font-size: 0.875rem;
    line-height: 1.5;
    outline: none;
    &:focus {
      border-color: ${palette.blue500};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
  `,
  EditTextarea: styled('textarea')`
    width: 100%;
    min-height: 4rem;
    padding: 0.4rem 0.625rem;
    border-radius: 0.375rem;
    border: 1.5px solid ${palette.blue400};
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
    outline: none;
    font-family: inherit;
    &:focus {
      border-color: ${palette.blue500};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
  `,
  CharCount: styled('span')<{ warn?: boolean }>`
    font-size: 0.75rem;
    color: ${({ warn }) => (warn ? palette.pink500 : palette.grey400)};
    text-align: right;
  `,
  DateInput: styled('input')`
    padding: 0.4rem 0.5rem;
    border-radius: 0.375rem;
    border: 1.5px solid ${palette.blue400};
    font-size: 0.875rem;
    outline: none;
    flex-shrink: 0;
    &:focus {
      border-color: ${palette.blue500};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
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
  DeleteButton: styled('button')`
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
      color: ${palette.pink500};
      background-color: rgba(227, 135, 158, 0.15);
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
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
};
