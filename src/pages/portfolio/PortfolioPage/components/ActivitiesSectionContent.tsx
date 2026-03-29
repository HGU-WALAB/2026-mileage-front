import { Flex, Text, Title } from '@/components';
import { palette } from '@/styles/palette';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { styled, useTheme } from '@mui/material';

import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import { groupActivitiesByCategory } from '../../utils/activityGrouping';
import {
  type ActivityItem,
  usePortfolioContext,
} from '../context/PortfolioContext';

interface ActivitiesSectionContentProps {
  readOnly?: boolean;
}

export type ActivitiesSectionContentHandle = {
  openAddActivity: () => void;
};

const ActivitiesSectionContent = forwardRef<
  ActivitiesSectionContentHandle,
  ActivitiesSectionContentProps
>(function ActivitiesSectionContent({ readOnly = false }, ref) {
  const theme = useTheme();
  const {
    activities,
    setActivities,
    deleteActivity,
    postNewActivity,
    saveExistingActivity,
    activitiesNextId,
    setActivitiesNextId,
  } = usePortfolioContext();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ActivityItem>>({});

  const grouped = useMemo(
    () => groupActivitiesByCategory(activities),
    [activities],
  );

  const handleAdd = useCallback(() => {
    const newItem: ActivityItem = {
      id: activitiesNextId,
      title: '새 활동',
      description: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      category: '기타',
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

  const handleSaveEdit = useCallback(async () => {
    if (editingId == null || !editDraft.title?.trim()) return;
    const categoryNorm = (editDraft.category ?? '').trim() || '기타';
    if (editingId < 0) {
      const item = activities.find(a => a.id === editingId);
      if (!item) return;
      const toSave: ActivityItem = {
        ...item,
        title: editDraft.title ?? item.title,
        description: editDraft.description ?? item.description,
        start_date: editDraft.start_date ?? item.start_date,
        end_date: editDraft.end_date ?? item.end_date,
        category: categoryNorm,
      };
      try {
        await postNewActivity(toSave);
        setEditingId(null);
        setEditDraft({});
      } catch {
        /* 토스트는 context에서 처리, 폼 유지 */
      }
      return;
    }
    const item = activities.find(a => a.id === editingId);
    if (!item) return;
    const toSave: ActivityItem = {
      ...item,
      title: editDraft.title ?? item.title,
      description: editDraft.description ?? item.description,
      start_date: editDraft.start_date ?? item.start_date,
      end_date: editDraft.end_date ?? item.end_date,
      category: categoryNorm,
    };
    try {
      await saveExistingActivity(toSave);
      setEditingId(null);
      setEditDraft({});
    } catch {
      /* 토스트는 context에서 처리, 폼 유지 */
    }
  }, [editingId, editDraft, activities, postNewActivity, saveExistingActivity]);

  const handleCancelEdit = useCallback(() => {
    if (editingId != null && editingId < 0) {
      setActivities(prev => prev.filter(a => a.id !== editingId));
    }
    setEditingId(null);
    setEditDraft({});
  }, [editingId, setActivities]);

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteActivity(id);
      if (editingId === id) {
        setEditingId(null);
        setEditDraft({});
      }
    },
    [editingId, deleteActivity],
  );

  useImperativeHandle(
    ref,
    () => ({
      openAddActivity: () => {
        if (!readOnly) handleAdd();
      },
    }),
    [readOnly, handleAdd],
  );

  return (
    <Flex.Column gap="0.5rem" style={{ width: '100%' }}>
      <Flex.Column gap="0" style={{ width: '100%' }}>
        {grouped.map(([categoryLabel, items]) => (
          <Flex.Column
            key={categoryLabel}
            padding="1rem 0"
            gap="0"
            style={{ width: '100%' }}
          >
            <Title label={categoryLabel} />
            <S.List>
              {items.map(item => (
                <S.Row key={item.id}>
                  {!readOnly && editingId === item.id ? (
                    <S.EditForm gap="0.75rem">
                      <Flex.Column gap="0.75rem" style={{ flex: 1, minWidth: 0 }}>
                        <Flex.Row
                          align="flex-end"
                          gap="0.75rem"
                          wrap="wrap"
                          style={{ width: '100%' }}
                        >
                          <Flex.Column
                            gap="0.25rem"
                            style={{
                              flex: '1 1 10rem',
                              minWidth: 'min(100%, 7rem)',
                              maxWidth: '16rem',
                            }}
                          >
                            <S.FieldLabel>카테고리</S.FieldLabel>
                            <S.EditInput
                              value={editDraft.category ?? ''}
                              onChange={e =>
                                setEditDraft(prev => ({
                                  ...prev,
                                  category: e.target.value,
                                }))
                              }
                              placeholder="예: 수상, 동아리"
                              maxLength={INPUT_MAX_LENGTH.ACTIVITY_CATEGORY}
                              aria-label="카테고리"
                              style={{ width: '100%' }}
                            />
                          </Flex.Column>
                          <Flex.Column
                            gap="0.25rem"
                            style={{
                              flex: '2 1 14rem',
                              minWidth: 'min(100%, 12rem)',
                            }}
                          >
                            <S.FieldLabel>기간</S.FieldLabel>
                            <Flex.Row
                              align="center"
                              gap="0.375rem"
                              wrap="wrap"
                              style={{ width: '100%' }}
                            >
                              <S.DateInput
                                type="date"
                                value={editDraft.start_date ?? ''}
                                onChange={e => {
                                  const start = e.target.value;
                                  setEditDraft(prev => {
                                    const end = prev.end_date ?? '';
                                    return {
                                      ...prev,
                                      start_date: start,
                                      end_date:
                                        end && start > end ? start : end,
                                    };
                                  });
                                }}
                                style={{
                                  flex: '1 1 6.75rem',
                                  minWidth: '6.5rem',
                                  maxWidth: '100%',
                                }}
                              />
                              <Text
                                as="span"
                                style={{
                                  margin: 0,
                                  flexShrink: 0,
                                  color: theme.palette.grey[500],
                                  fontSize: '0.875rem',
                                }}
                              >
                                ~
                              </Text>
                              <S.DateInput
                                type="date"
                                value={editDraft.end_date ?? ''}
                                onChange={e => {
                                  const end = e.target.value;
                                  setEditDraft(prev => {
                                    const start = prev.start_date ?? '';
                                    return {
                                      ...prev,
                                      end_date: end,
                                      start_date:
                                        start && end < start ? end : start,
                                    };
                                  });
                                }}
                                style={{
                                  flex: '1 1 6.75rem',
                                  minWidth: '6.5rem',
                                  maxWidth: '100%',
                                }}
                              />
                            </Flex.Row>
                          </Flex.Column>
                        </Flex.Row>
                        <Flex.Column gap="0.25rem" style={{ width: '100%' }}>
                          <S.FieldLabel>제목</S.FieldLabel>
                          <S.EditInput
                            value={editDraft.title ?? ''}
                            onChange={e =>
                              setEditDraft(prev => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="활동 제목"
                            maxLength={INPUT_MAX_LENGTH.ACTIVITY_TITLE}
                            aria-label="제목"
                            style={{ width: '100%' }}
                          />
                        </Flex.Column>
                        <Flex.Column gap="0.25rem" style={{ width: '100%' }}>
                          <S.FieldLabel>상세 설명</S.FieldLabel>
                          <S.EditTextarea
                            value={editDraft.description ?? ''}
                            onChange={e =>
                              setEditDraft(prev => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="활동의 상세 내용을 입력해 주세요."
                            rows={3}
                            maxLength={INPUT_MAX_LENGTH.ACTIVITY_DESCRIPTION}
                          />
                          <S.CharCount
                            warn={
                              (editDraft.description?.length ?? 0) >=
                              INPUT_MAX_LENGTH.ACTIVITY_DESCRIPTION - 20
                            }
                          >
                            {editDraft.description?.length ?? 0} /{' '}
                            {INPUT_MAX_LENGTH.ACTIVITY_DESCRIPTION}
                          </S.CharCount>
                        </Flex.Column>
                      </Flex.Column>
                      <S.ActionColumn>
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
                      </S.ActionColumn>
                    </S.EditForm>
                  ) : (
                    <>
                      <Flex.Row align="center" gap="0.5rem" wrap="wrap">
                        <S.CategoryTag>{item.category}</S.CategoryTag>
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
                          {item.description ? (
                            <>{item.description}</>
                          ) : (
                            <span style={{ color: theme.palette.grey[400] }}>
                              추가 설명을 통해 더 나은 프롬프트 결과를 얻을 수 있습니다.
                            </span>
                          )}
                        </Text>
                        {!readOnly && (
                          <Flex.Row
                            gap="0.25rem"
                            align="center"
                            style={{ flexShrink: 0 }}
                          >
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
        ))}
      </Flex.Column>
    </Flex.Column>
  );
});

export default ActivitiesSectionContent;

const S = {
  List: styled(Flex.Column)`
    gap: 0.5rem;
    width: 100%;
  `,
  Row: styled(Flex.Column)`
    padding: 0.75rem 1rem;
    gap: 0.375rem;
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid ${({ theme }) => theme.palette.grey[200]};
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
    transition: box-shadow 0.15s ease;
    &:hover {
      box-shadow: 0 2px 6px rgba(16, 24, 40, 0.08);
    }
  `,
  EditForm: styled(Flex.Row)`
    flex: 1;
    min-width: 0;
    align-items: flex-start;
  `,
  FieldLabel: styled('span')`
    font-size: 0.75rem;
    font-weight: 500;
    color: ${({ theme }) => theme.palette.text.secondary};
    line-height: 1.2;
  `,
  ActionColumn: styled(Flex.Column)`
    flex-shrink: 0;
    align-self: flex-start;
    padding-top: 1.15rem;
    gap: 0.375rem;
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
  EditInput: styled('input')`
    padding: 0.4rem 0.625rem;
    border-radius: 0.375rem;
    border: 1.5px solid ${palette.blue400};
    font-size: 0.875rem;
    line-height: 1.5;
    outline: none;
    box-sizing: border-box;
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
    box-sizing: border-box;
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
    box-sizing: border-box;
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
