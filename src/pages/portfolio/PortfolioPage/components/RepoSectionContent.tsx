import { Button, Flex, Input, Text } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { ROUTE_PATH } from '@/constants/routePath';
import { palette } from '@/styles/palette';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useMemo, useState } from 'react';
import { styled, useTheme, useMediaQuery } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import { patchRepository } from '../../apis/repositories';
import { formatDateRange } from '../../utils/date';
import {
  mergePortfolioRepoPatch,
  usePortfolioContext,
} from '../context/PortfolioContext';
import type { RepoItem } from '../../types/portfolioItems';
import useGetGitHubStatusQuery from '@/pages/profile/hooks/useGetGitHubStatusQuery';
import {
  formatRepoStat,
  RepoLanguageBar,
  RepoStatPills,
} from './repoCardMeta';

const ITEMS_PER_PAGE = 4;

interface RepoSectionContentProps {
  readOnly?: boolean;
}

/** 깃허브 레포지토리. GET /api/portfolio/repositories 페이지네이션으로 조회, is_visible true만 표시 */
const RepoSectionContent = ({ readOnly = false }: RepoSectionContentProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const navigate = useNavigate();
  const { data: githubStatus } = useGetGitHubStatusQuery();
  const { repos: contextRepos, setRepos } = usePortfolioContext();
  const repos = Array.isArray(contextRepos) ? contextRepos : [];
  const [page, setPage] = useState(0);
  const [editingRepo, setEditingRepo] = useState<RepoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openEdit = useCallback((repo: RepoItem) => {
    setEditingRepo(repo);
    setEditTitle(
      (repo.custom_title != null && repo.custom_title.trim() !== '')
        ? repo.custom_title.trim()
        : repo.github_title || repo.name,
    );
    setEditDescription(repo.description ?? '');
  }, []);

  const closeEdit = useCallback(() => {
    setEditingRepo(null);
    setEditTitle('');
    setEditDescription('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingRepo?.id == null) return;
    setSubmitting(true);
    try {
      const res = await patchRepository(editingRepo.id, {
        custom_title:
          editTitle.trim() || editingRepo.github_title || editingRepo.name,
        description: editDescription.trim(),
        is_visible: editingRepo.is_visible,
        display_order: editingRepo.display_order ?? 0,
      });
      setRepos(prev =>
        prev.map(r =>
          r.repo_id === res.repo_id ? mergePortfolioRepoPatch(r, res) : r,
        ),
      );
      toast.success('레포지토리 정보가 수정되었습니다.', {
        position: 'top-center',
      });
      closeEdit();
    } catch {
      toast.error('레포지토리 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [editingRepo, editTitle, editDescription, setRepos, closeEdit]);

  const displayRepos = useMemo(
    () => repos.filter(r => r.is_visible),
    [repos],
  );

  const totalPages = Math.ceil(displayRepos.length / ITEMS_PER_PAGE) || 1;
  const paginatedRepos = useMemo(
    () =>
      displayRepos.slice(
        page * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      ),
    [displayRepos, page],
  );

  const isConnected = githubStatus?.connected ?? false;

  const connectCard = (
    <S.ConnectCard>
      <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
        <S.ConnectMessage>
          {isConnected
            ? '선택된 레포지토리가 없습니다.'
            : '깃허브 계정을 연결해 레포지토리를 추가해 주세요.'}
        </S.ConnectMessage>
        {!readOnly && !isConnected && (
          <Flex.Row justify="flex-start" style={{ width: '100%' }}>
            <Button
              label="마이페이지로 이동"
              variant="contained"
              color="blue"
              size="medium"
              onClick={() => navigate(ROUTE_PATH.myPage)}
            />
          </Flex.Row>
        )}
      </Flex.Column>
    </S.ConnectCard>
  );

  // 깃허브가 연결 해제된 상태라면, 선택된 레포가 있더라도 표시하지 않습니다.
  if (!isConnected) {
    return connectCard;
  }

  if (!readOnly && displayRepos.length === 0) {
    return connectCard;
  }

  const displayName = (repo: RepoItem) =>
    (repo.custom_title != null && repo.custom_title.trim() !== '')
      ? repo.custom_title.trim()
      : (repo.github_title != null && repo.github_title.trim() !== '')
        ? repo.github_title.trim()
        : (repo.name != null && repo.name.trim() !== '')
          ? repo.name.trim()
          : String(repo.repo_id);

  const displayDescription = (repo: RepoItem) => {
    const custom = (repo.description ?? '').trim();
    if (custom !== '') return custom;
    const gh = (repo.github_description ?? '').trim();
    return gh;
  };

  return (
    <Flex.Column gap="1rem">
      <S.Grid $isMobile={isMobile}>
        {paginatedRepos.map(repo => {
          const isEditing = editingRepo?.repo_id === repo.repo_id;
          const githubDescriptionPlaceholder =
            (repo.github_description ?? '').trim() || '설명을 입력하세요';
          return (
            <S.Card key={repo.repo_id} $isMobile={isMobile}>
              {isEditing ? (
                <Flex.Column gap="0.5rem">
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder={displayName(repo)}
                    size="small"
                    fullWidth
                    inputProps={{
                      maxLength: INPUT_MAX_LENGTH.REPO_TITLE,
                      'aria-label': '레포지토리 제목',
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.variant.default,
                      },
                    }}
                  />
                  <Input
                    multiline
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder={githubDescriptionPlaceholder}
                    rows={2}
                    size="small"
                    fullWidth
                    inputProps={{
                      maxLength: INPUT_MAX_LENGTH.REPO_DESCRIPTION,
                      'aria-label': '레포지토리 설명',
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.variant.default,
                      },
                      '& textarea': {
                        resize: 'vertical',
                      },
                    }}
                  />
                  <Flex.Row gap="0.5rem" justify="flex-end">
                    <Button
                      label="취소"
                      variant="outlined"
                      size="medium"
                      onClick={closeEdit}
                    />
                    <Button
                      label="저장"
                      variant="contained"
                      color="blue"
                      size="medium"
                      disabled={submitting}
                      onClick={handleSaveEdit}
                    />
                  </Flex.Row>
                </Flex.Column>
              ) : (
                <Flex.Column gap="0.5rem" style={{ width: '100%' }}>
                  <Flex.Row
                    align="center"
                    gap="0.5rem"
                    wrap="wrap"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <S.RepoLink
                      href={repo.html_url ?? '#'}
                      target={repo.html_url ? '_blank' : undefined}
                      rel={repo.html_url ? 'noopener noreferrer' : undefined}
                      style={{ flex: '1 1 auto', minWidth: 0 }}
                    >
                      {displayName(repo)}
                    </S.RepoLink>
                    {!readOnly && repo.id != null && (
                      <S.EditButton
                        type="button"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEdit(repo);
                        }}
                        aria-label="제목·설명 수정"
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </S.EditButton>
                    )}
                  </Flex.Row>
                  {displayDescription(repo) !== '' && (
                    <Text
                      style={{
                        ...theme.typography.body2,
                        color: theme.palette.grey[600],
                      }}
                    >
                      {displayDescription(repo)}
                    </Text>
                  )}
                  <Flex.Row
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap="0.5rem"
                    style={{ width: '100%' }}
                  >
                    <Text
                      style={{
                        ...theme.typography.caption,
                        color: theme.palette.grey[500],
                        margin: 0,
                        flex: '0 1 auto',
                        minWidth: 0,
                      }}
                    >
                      {formatDateRange(repo.created_at, repo.updated_at)}
                    </Text>
                    {(formatRepoStat(repo.commit_count) != null ||
                      formatRepoStat(repo.stargazers_count) != null ||
                      formatRepoStat(repo.forks_count) != null) && (
                      <RepoStatPills
                        isMobile={isMobile}
                        stats={{
                          commit_count: repo.commit_count,
                          stargazers_count: repo.stargazers_count,
                          forks_count: repo.forks_count,
                        }}
                      />
                    )}
                  </Flex.Row>
                  {repo.languageBreakdown &&
                  repo.languageBreakdown.length > 0 ? (
                    <RepoLanguageBar breakdown={repo.languageBreakdown} />
                  ) : (
                    repo.languages.length > 0 && (
                      <Flex.Row gap="0.5rem" wrap="wrap">
                        {repo.languages.map(lang => (
                          <S.LangTag key={lang}>{lang}</S.LangTag>
                        ))}
                      </Flex.Row>
                    )
                  )}
                </Flex.Column>
              )}
            </S.Card>
          );
        })}
      </S.Grid>
      {totalPages > 1 && (
        <S.Pagination align="center" gap="0.5rem">
          <S.PageButton
            type="button"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
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
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </S.PageButton>
        </S.Pagination>
      )}
    </Flex.Column>
  );
};

export default RepoSectionContent;

const S = {
  ConnectCard: styled('div')`
    padding: 1.5rem;
    border-radius: 0.75rem;
    background-color: ${({ theme }) => theme.palette.grey[50]};
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  `,
  ConnectMessage: styled('p')`
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    letter-spacing: 0.01em;
    color: ${palette.grey600};
    font-weight: 500;
  `,
  Grid: styled('div')<{ $isMobile?: boolean }>`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
  `,
  Card: styled('div')<{ $isMobile?: boolean }>`
    flex: ${({ $isMobile }) =>
      $isMobile ? '1 1 100%' : '0 1 calc(50% - 0.5rem)'};
    max-width: ${({ $isMobile }) =>
      $isMobile ? '100%' : 'calc(50% - 0.5rem)'};
    min-width: 0;
    padding: 1.25rem;
    border-radius: 0.75rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid ${({ theme }) => theme.palette.grey[200]};
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    &:hover {
      border-color: ${({ theme }) => theme.palette.grey[300]};
      box-shadow: 0 2px 6px rgba(16, 24, 40, 0.08);
    }
  `,
  RepoLink: styled('a')`
    ${({ theme }) => theme.typography.body1};
    font-weight: 600;
    color: ${palette.blue500};
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover {
      color: ${palette.blue600};
    }
  `,
  EditButton: styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem;
    border: none;
    border-radius: 0.375rem;
    background: none;
    color: ${palette.grey500};
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.2s ease, background-color 0.2s ease;
    &:hover {
      color: ${palette.blue500};
      background-color: ${palette.blue300};
    }
  `,
  LangTag: styled('span')`
    padding: 0.3rem 0.625rem;
    border-radius: 999px;
    background-color: ${palette.white};
    color: ${palette.blue500};
    border: 1.5px solid ${palette.blue400};
    ${({ theme }) => theme.typography.caption};
    font-size: 0.75rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(83, 127, 241, 0.08);
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
