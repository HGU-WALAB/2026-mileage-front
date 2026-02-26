import { SearchIcon } from '@/assets';
import { Button, Flex, Input, Modal, Text } from '@/components';
import { palette } from '@/styles/palette';
import type { PortfolioRepositoryItem, PutRepositoryItem } from '../../apis/portfolio';
import { getAllRepositories, putRepositories } from '../../apis/portfolio';
import { formatDateRange } from '../../utils/date';
import { portfolioRepoToRepoItem, useSummaryContext } from '../context/SummaryContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import { styled, useTheme } from '@mui/material';
import { toast } from 'react-toastify';

interface RepoSelectModalProps {
  open: boolean;
  onClose: () => void;
}

/** 포트폴리오 레포지토리 선택 모달. GET /api/portfolio/repositories 전체 페이지 조회, is_visible true 체크, 확인 시 PUT */
const RepoSelectModal = ({ open, onClose }: RepoSelectModalProps) => {
  const theme = useTheme();
  const { setRepos } = useSummaryContext();
  const [allRepos, setAllRepos] = useState<PortfolioRepositoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAllRepositories()
      .then(list => {
        setAllRepos(list);
        setSelectedIds(new Set(list.filter(r => r.is_visible).map(r => r.repo_id)));
      })
      .catch(() => {
        toast.error('레포지토리 목록을 불러오지 못했습니다.');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [open, onClose]);

  const toggleRepo = useCallback((repoId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(repoId)) next.delete(repoId);
      else next.add(repoId);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const putBody: PutRepositoryItem[] = allRepos.map(p => ({
      repo_id: p.repo_id,
      custom_title: p.custom_title != null ? p.custom_title : '',
      description: p.description != null ? p.description : '',
      is_visible: selectedIds.has(p.repo_id),
    }));
    setSubmitting(true);
    try {
      const res = await putRepositories(putBody);
      setRepos((res.repositories ?? []).map(portfolioRepoToRepoItem));
      toast.success('변경사항이 저장되었습니다.', {
        position: 'top-center',
      });
      onClose();
    } catch {
      toast.error('레포지토리 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedIds, allRepos, setRepos, onClose]);

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRepos;
    return allRepos.filter(
      r =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        (r.language?.toLowerCase().includes(q) ?? false),
    );
  }, [allRepos, searchQuery]);

  const selectedRepos = useMemo(
    () => allRepos.filter(r => selectedIds.has(r.repo_id)),
    [allRepos, selectedIds],
  );

  const selectedCount = selectedIds.size;

  return (
    <Modal
      open={open}
      toggleModal={onClose}
      size="large"
      hasCloseButton
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Modal.Header position="start">레포지토리 선택</Modal.Header>
      <Modal.Body position="start" style={{ gap: '1rem', marginTop: '0.5rem' }}>
        <Text
          style={{
            ...theme.typography.body2,
            color: theme.palette.grey[600],
            margin: 0,
          }}
        >
          포트폴리오에 추가할 레포지토리를 선택하세요.
        </Text>
        {!loading && (
          <Flex.Row gap="0.5rem">
            <Input
              placeholder="레포지토리 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '20rem',
                backgroundColor: theme.palette.variant?.default ?? theme.palette.grey[50],
              }}
              inputProps={{ 'aria-label': '레포지토리 검색' }}
            />
            <S.SearchButton type="button" aria-label="검색">
              <SearchIcon />
            </S.SearchButton>
          </Flex.Row>
        )}
        {!loading && selectedRepos.length > 0 && (
          <S.SelectedTags wrap="wrap" gap="0.5rem">
            {selectedRepos.map(repo => (
              <S.SelectedTag
                key={repo.repo_id}
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleRepo(repo.repo_id);
                }}
                aria-label={`${(repo.custom_title?.trim() && repo.custom_title) || repo.name || repo.repo_id} 선택 해제`}
              >
                <span>{(repo.custom_title != null && repo.custom_title.trim() !== '') ? repo.custom_title.trim() : (repo.name != null && repo.name.trim() !== '') ? repo.name.trim() : String(repo.repo_id)}</span>
                <S.TagRemove aria-hidden>×</S.TagRemove>
              </S.SelectedTag>
            ))}
          </S.SelectedTags>
        )}
        <S.ListWrap>
          {loading ? (
            <S.LoadingWrap>
              <LinearProgress
                sx={{
                  width: '12rem',
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: palette.blue300,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: palette.blue500,
                  },
                }}
              />
            </S.LoadingWrap>
          ) : (
          <S.List>
            {filteredRepos.map(repo => (
              <S.Row
                key={repo.repo_id}
                role="button"
                tabIndex={0}
                onClick={() => toggleRepo(repo.repo_id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleRepo(repo.repo_id);
                  }
                }}
              >
                <Checkbox
                  checked={selectedIds.has(repo.repo_id)}
                  onChange={() => toggleRepo(repo.repo_id)}
                  onClick={e => e.stopPropagation()}
                  sx={{
                    color: palette.grey400,
                    '&.Mui-checked': { color: palette.blue500 },
                  }}
                />
                <Flex.Column gap="0.375rem" style={{ flex: 1, minWidth: 0 }}>
                  {repo.html_url ? (
                    <S.RepoNameLink
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        ...theme.typography.body2,
                        fontWeight: 600,
                        margin: 0,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {(repo.custom_title != null && repo.custom_title.trim() !== '')
                        ? repo.custom_title.trim()
                        : (repo.name != null && repo.name.trim() !== '')
                          ? repo.name.trim()
                          : String(repo.repo_id)}
                    </S.RepoNameLink>
                  ) : (
                    <Text
                      style={{
                        ...theme.typography.body2,
                        fontWeight: 600,
                        margin: 0,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {(repo.custom_title != null && repo.custom_title.trim() !== '')
                        ? repo.custom_title.trim()
                        : (repo.name != null && repo.name.trim() !== '')
                          ? repo.name.trim()
                          : String(repo.repo_id)}
                    </Text>
                  )}
                  {repo.description && (
                    <Text
                      style={{
                        ...theme.typography.caption,
                        color: theme.palette.grey[600],
                        margin: 0,
                      }}
                    >
                      {repo.description}
                    </Text>
                  )}
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.grey[500],
                      margin: 0,
                    }}
                  >
                    {formatDateRange(repo.created_at, repo.updated_at)}
                  </Text>
                  {repo.language && (
                    <Flex.Row gap="0.375rem" wrap="wrap">
                      <S.LangTag>{repo.language}</S.LangTag>
                    </Flex.Row>
                  )}
                </Flex.Column>
              </S.Row>
            ))}
          </S.List>
          )}
        </S.ListWrap>
      </Modal.Body>
      <Modal.Footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Text
          style={{
            ...theme.typography.body2,
            color: theme.palette.grey[600],
            margin: 0,
          }}
        >
          {selectedCount}개 선택됨
        </Text>
        <Flex.Row gap="0.5rem">
          <Button
            label="취소"
            variant="outlined"
            size="large"
            onClick={onClose}
          />
          <Button
            label="확인"
            variant="contained"
            color="blue"
            size="large"
            disabled={loading || submitting}
            onClick={handleConfirm}
          />
        </Flex.Row>
      </Modal.Footer>
    </Modal>
  );
};

export default RepoSelectModal;

const LIST_AREA_HEIGHT = '28rem';

const S = {
  SearchButton: styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.palette.primary.main};
    border: none;
    border-radius: 0.4rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    color: ${palette.white};
    &:hover,
    &:active {
      background-color: ${palette.blue600};
    }
  `,
  ListWrap: styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: ${LIST_AREA_HEIGHT};
    min-height: ${LIST_AREA_HEIGHT};
    flex-shrink: 0;
  `,
  LoadingWrap: styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: ${LIST_AREA_HEIGHT};
  `,
  List: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  `,
  Row: styled(Flex.Row)`
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid ${({ theme }) => theme.palette.grey[200]};
    cursor: pointer;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    &:hover {
      border-color: ${palette.blue300};
      box-shadow: 0 2px 8px rgba(83, 127, 241, 0.08);
    }
  `,
  RepoNameLink: styled('a')`
    color: ${palette.blue500};
    text-decoration: none;
    cursor: pointer;
    &:hover {
      color: ${palette.blue600};
      text-decoration: underline;
    }
  `,
  LangTag: styled('span')`
    padding: 0.3rem 0.625rem;
    border-radius: 999px;
    background-color: ${palette.blue300};
    color: ${palette.blue600};
    font-size: 0.75rem;
    font-weight: 500;
    flex-shrink: 0;
  `,
  SelectedTags: styled(Flex.Row)`
    width: 100%;
  `,
  SelectedTag: styled('button')`
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.35rem 0.5rem 0.35rem 0.75rem;
    border-radius: 999px;
    border: 1.5px solid ${palette.blue400};
    background-color: ${palette.white};
    color: ${palette.blue600};
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    &:hover {
      background-color: ${palette.blue300};
      border-color: ${palette.blue500};
    }
    span {
      max-width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  TagRemove: styled('span')`
    font-size: 1.125rem;
    line-height: 1;
    opacity: 0.8;
  `,
};
