import { Flex, Text } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMemo, useState } from 'react';
import { styled, useTheme, useMediaQuery } from '@mui/material';

import { formatDateRange } from '../../utils/date';
import { useSummaryContext } from '../context/SummaryContext';

const ITEMS_PER_PAGE = 4;

interface RepoSectionContentProps {
  readOnly?: boolean;
}

/** 깃허브 레포지토리. GET /api/portfolio/repositories 페이지네이션으로 조회, is_visible true만 표시 */
const RepoSectionContent = ({ readOnly = false }: RepoSectionContentProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { repos: contextRepos } = useSummaryContext();
  const repos = Array.isArray(contextRepos) ? contextRepos : [];
  const [page, setPage] = useState(0);

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

  if (!readOnly && displayRepos.length === 0) {
    return (
      <S.ConnectCard>
        <S.ConnectMessage>선택된 레포지토리가 없습니다.</S.ConnectMessage>
      </S.ConnectCard>
    );
  }

  const displayName = (repo: {
    custom_title: string | null;
    name: string;
    repo_id: number;
  }) =>
    (repo.custom_title != null && repo.custom_title.trim() !== '')
      ? repo.custom_title.trim()
      : (repo.name != null && repo.name.trim() !== '')
        ? repo.name.trim()
        : String(repo.repo_id);

  return (
    <Flex.Column gap="1rem">
      <S.Grid $isMobile={isMobile}>
        {paginatedRepos.map(repo => (
          <S.Card key={repo.repo_id} $isMobile={isMobile}>
            <Flex.Column gap="0.5rem">
              <S.RepoLink
                href={repo.html_url ?? '#'}
                target={repo.html_url ? '_blank' : undefined}
                rel={repo.html_url ? 'noopener noreferrer' : undefined}
              >
                {displayName(repo)}
              </S.RepoLink>
              {(repo.description?.trim() ?? '') !== '' && (
                <Text
                  style={{
                    ...theme.typography.body2,
                    color: theme.palette.grey[600],
                  }}
                >
                  {repo.description}
                </Text>
              )}
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.palette.grey[500],
                }}
              >
                {formatDateRange(repo.created_at, repo.updated_at)}
              </Text>
              <Flex.Row gap="0.5rem" wrap="wrap">
                {repo.languages.map(lang => (
                  <S.LangTag key={lang}>{lang}</S.LangTag>
                ))}
              </Flex.Row>
            </Flex.Column>
          </S.Card>
        ))}
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
    flex: ${({ $isMobile }) => ($isMobile ? '1 1 100%' : '1 1 18rem')};
    min-width: 0;
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: ${({ theme }) =>
      `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`};
    border-left: 3px solid ${palette.blue400};
    ${boxShadow};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(83, 127, 241, 0.12);
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
