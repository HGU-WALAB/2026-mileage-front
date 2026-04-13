import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  deleteActivity as deleteActivityApi,
  getActivities,
  getPortfolioMileage,
  getTechStack,
  getUserInfo,
  postActivity,
  putActivityById,
  putTechStack,
} from '../../apis/portfolio';
import type {
  PortfolioRepositoryItem,
  TechStackDomain,
} from '../../apis/portfolio';
import {
  normalizeTechStackDomainsForPersist,
  normalizeTechStackDomainsFromResponse,
} from '../../utils/techStackDomains';
import type { ActivityItem, MileageItem, RepoItem, UserInfo } from '../../types/portfolioItems';
import type { PortfolioState } from '../../types/portfolioState';
import {
  getGitHubStatus,
  readGitHubConnectedFromStorage,
} from '@/pages/profile/apis/github';

const SAVED_TOAST_OPTIONS = {
  position: 'top-center' as const,
};

function normalizeActivityTags(raw: string[] | undefined): string[] {
  if (!raw?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const s = String(t).trim();
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

function apiActivityToItem(
  a: import('../../apis/portfolio').ActivityApiItem,
): ActivityItem {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    start_date: a.start_date,
    end_date: a.end_date,
    category: (a.category ?? '').trim() || '기타',
    display_order: a.display_order,
    url: (a.url ?? '').trim(),
    tags: normalizeActivityTags(a.tags),
  };
}

function nonEmpty(s: string | null | undefined): string | null {
  const t = s?.trim();
  return t !== undefined && t !== null && t !== '' ? t : null;
}

/** GET 응답에 snake_case / camelCase·숫자·문자열이 섞여 올 때 대비 */
function repoItemIsVisible(p: PortfolioRepositoryItem): boolean {
  const raw: unknown =
    (p as { is_visible?: unknown }).is_visible ??
    (p as { isVisible?: unknown }).isVisible;
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0) return false;
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    if (s === 'true' || s === '1') return true;
    if (s === 'false' || s === '0' || s === '') return false;
  }
  return false;
}

export function portfolioRepoToRepoItem(p: PortfolioRepositoryItem): RepoItem {
  const breakdown =
    p.languages && p.languages.length > 0 ? [...p.languages] : undefined;
  const languageNames =
    breakdown?.map(l => l.name) ??
    (p.language ? [p.language] : []);

  return {
    id: p.id ?? undefined,
    repo_id: p.repo_id,
    custom_title: p.custom_title,
    is_visible: repoItemIsVisible(p),
    display_order: p.display_order,
    github_title: nonEmpty(p.github_title) ?? '',
    name:
      nonEmpty(p.github_title) ??
      nonEmpty(p.custom_title) ??
      String(p.repo_id),
    description: p.description ?? '',
    github_description: p.github_description ?? '',
    created_at: p.created_at ?? '',
    updated_at: p.updated_at ?? '',
    languages: languageNames,
    languageBreakdown: breakdown,
    commit_count: p.commit_count,
    stargazers_count: p.stargazers_count,
    forks_count: p.forks_count,
    html_url: p.html_url ?? '',
    owner: p.owner ?? '',
  };
}

/**
 * PATCH 응답이 제목·설명 등 일부 필드만 포함할 때, 기존 카드의 언어·통계·URL 등을 유지.
 * (백엔드가 전체 엔티티가 아닌 DTO를 내려주면 `portfolioRepoToRepoItem`만 쓰면 스택이 비는 문제)
 */
export function mergePortfolioRepoPatch(
  prev: RepoItem,
  patch: PortfolioRepositoryItem,
): RepoItem {
  const next = portfolioRepoToRepoItem(patch);
  return {
    ...prev,
    ...next,
    github_title:
      next.github_title !== '' ? next.github_title : prev.github_title,
    languages: next.languages.length > 0 ? next.languages : prev.languages,
    languageBreakdown:
      next.languageBreakdown != null && next.languageBreakdown.length > 0
        ? next.languageBreakdown
        : prev.languageBreakdown,
    commit_count: next.commit_count ?? prev.commit_count,
    stargazers_count: next.stargazers_count ?? prev.stargazers_count,
    forks_count: next.forks_count ?? prev.forks_count,
    html_url: next.html_url !== '' ? next.html_url : prev.html_url,
    owner: next.owner !== '' ? next.owner : prev.owner,
    created_at: next.created_at !== '' ? next.created_at : prev.created_at,
    updated_at: next.updated_at !== '' ? next.updated_at : prev.updated_at,
  };
}

export function portfolioMileageToItem(
  p: import('../../apis/portfolio').PortfolioMileageItem,
): MileageItem {
  return {
    id: p.id,
    mileage_id: p.mileage_id,
    semester: p.semester ?? '',
    category: p.categoryName ?? '',
    item: p.subitemName ?? '',
    additional_info: p.additional_info ?? '',
    is_visible: true,
  };
}


const PortfolioContext = createContext<PortfolioState | null>(null);

export const usePortfolioContext = () => {
  const ctx = useContext(PortfolioContext);
  if (ctx == null) {
    throw new Error('usePortfolioContext must be used within PortfolioProvider');
  }
  return ctx;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

const QUERY_CONFIG = { retry: 1, refetchOnWindowFocus: false } as const;

const EMPTY_PORTFOLIO_REPOS: RepoItem[] = [];

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
  const queryClient = useQueryClient();
  const [activitiesNextId, setActivitiesNextId] = useState(-1);

  // ── 유저 정보 ──────────────────────────────────────────────────────────────
  const userInfoQuery = useQuery<UserInfo | null>({
    queryKey: [QUERY_KEYS.portfolioUserInfo],
    queryFn: async () => {
      const res = await getUserInfo();
      try {
        localStorage.setItem('portfolio-user-info', JSON.stringify(res));
      } catch {
        // ignore
      }
      return res;
    },
    ...QUERY_CONFIG,
  });

  const setUserInfo = useCallback(
    (v: UserInfo | null | ((p: UserInfo | null) => UserInfo | null)) => {
      queryClient.setQueryData<UserInfo | null>(
        [QUERY_KEYS.portfolioUserInfo],
        prev => (typeof v === 'function' ? v(prev ?? null) : v),
      );
    },
    [queryClient],
  );

  // ── 기술 스택 ──────────────────────────────────────────────────────────────
  const techStackQuery = useQuery<TechStackDomain[]>({
    queryKey: [QUERY_KEYS.portfolioTechStack],
    queryFn: async () => {
      const res = await getTechStack();
      return normalizeTechStackDomainsFromResponse(res.domains);
    },
    ...QUERY_CONFIG,
  });

  const setTechStackDomains = useCallback(
    (v: TechStackDomain[] | ((p: TechStackDomain[]) => TechStackDomain[])) => {
      const prev =
        queryClient.getQueryData<TechStackDomain[]>([QUERY_KEYS.portfolioTechStack]) ?? [];
      const next = typeof v === 'function' ? v(prev) : v;
      queryClient.setQueryData<TechStackDomain[]>([QUERY_KEYS.portfolioTechStack], next);
      putTechStack({ domains: normalizeTechStackDomainsForPersist(next) })
        .then(res => {
          queryClient.setQueryData<TechStackDomain[]>(
            [QUERY_KEYS.portfolioTechStack],
            normalizeTechStackDomainsFromResponse(res.domains),
          );
          toast.success('변경사항이 저장되었습니다.', SAVED_TOAST_OPTIONS);
        })
        .catch(() => toast.error('기술 스택 저장에 실패했습니다.'));
    },
    [queryClient],
  );

  // ── 레포지토리 ─────────────────────────────────────────────────────────────
  const repoQueryKey = useMemo(() => [QUERY_KEYS.portfolioRepositories], []);

  const githubStatusQuery = useQuery({
    queryKey: [QUERY_KEYS.githubStatus],
    queryFn: () => getGitHubStatus(),
    ...QUERY_CONFIG,
  });
  const githubConnectedFromApi = githubStatusQuery.data?.connected === true;
  /** 상태 GET이 늦어도, 직전 세션에서 연결됐으면 레포 목록을 바로 요청 (새로고침 후 빈 화면 방지) */
  const reposFetchEnabled =
    githubConnectedFromApi ||
    (githubStatusQuery.isPending && readGitHubConnectedFromStorage());

  const reposQuery = useQuery<RepoItem[]>({
    queryKey: repoQueryKey,
    queryFn: async () => {
      const { getAllRepositories } = await import('../../apis/portfolio');
      // 편집 화면 카드: 포트폴리오에 표시로 둔 레포만(is_visible). API는 visible_only 로 필터합니다.
      // 전체 목록은 선택 모달에서 별도로 불러옵니다.
      const list = await getAllRepositories({ visible_only: true });
      return (list ?? []).map(portfolioRepoToRepoItem);
    },
    enabled: reposFetchEnabled,
    ...QUERY_CONFIG,
  });

  useEffect(() => {
    // 로딩 중에는 연결 여부 미확정 → 레포 캐시를 지우지 않음 (깃헙 상태보다 늦게 도착한 GET이 날아감)
    if (githubStatusQuery.isPending) return;
    if (githubConnectedFromApi) return;
    queryClient.removeQueries({ queryKey: repoQueryKey });
    queryClient.setQueryData<RepoItem[]>(repoQueryKey, []);
  }, [
    githubConnectedFromApi,
    githubStatusQuery.isPending,
    queryClient,
    repoQueryKey,
  ]);

  const setRepos = useCallback(
    (v: RepoItem[] | ((p: RepoItem[]) => RepoItem[])) => {
      queryClient.setQueryData<RepoItem[]>(repoQueryKey, prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return typeof v === 'function' ? v(safePrev) : v;
      });
    },
    [queryClient, repoQueryKey],
  );

  // ── 마일리지 ───────────────────────────────────────────────────────────────
  const mileageQuery = useQuery<MileageItem[]>({
    queryKey: [QUERY_KEYS.portfolioMileage],
    queryFn: async () => {
      const res = await getPortfolioMileage();
      const list = res.mileage ?? [];
      const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
      return sorted.map(portfolioMileageToItem);
    },
    ...QUERY_CONFIG,
  });

  const setMileageItems = useCallback(
    (v: MileageItem[] | ((p: MileageItem[]) => MileageItem[])) => {
      queryClient.setQueryData<MileageItem[]>(
        [QUERY_KEYS.portfolioMileage],
        prev => (typeof v === 'function' ? v(prev ?? []) : v),
      );
    },
    [queryClient],
  );

  // ── 활동 ───────────────────────────────────────────────────────────────────
  const activitiesQuery = useQuery<ActivityItem[]>({
    queryKey: [QUERY_KEYS.portfolioActivities],
    queryFn: async () => {
      const res = await getActivities();
      const list = res.activities ?? [];
      const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
      return sorted.map(apiActivityToItem);
    },
    ...QUERY_CONFIG,
  });

  const setActivities = useCallback(
    (v: ActivityItem[] | ((p: ActivityItem[]) => ActivityItem[])) => {
      queryClient.setQueryData<ActivityItem[]>(
        [QUERY_KEYS.portfolioActivities],
        prev => (typeof v === 'function' ? v(prev ?? []) : v),
      );
    },
    [queryClient],
  );

  // ── 활동 CRUD ──────────────────────────────────────────────────────────────
  const deleteActivity = useCallback(async (id: number) => {
    if (id > 0) {
      try {
        await deleteActivityApi(id);
      } catch {
        toast.error('활동 삭제에 실패했습니다.');
        return;
      }
    }
    setActivities(prev => prev.filter(a => a.id !== id));
  }, [setActivities]);

  const postNewActivity = useCallback(async (item: ActivityItem) => {
    if (item.id >= 0) return;
    try {
      const tags = normalizeActivityTags(item.tags);
      const posted = await postActivity({
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: item.category.trim() || '기타',
        url: (item.url ?? '').trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      setActivities(prev =>
        prev.map(a => (a.id === item.id ? apiActivityToItem(posted) : a)),
      );
    } catch {
      toast.error('활동 추가에 실패했습니다.');
      throw new Error('활동 추가 실패');
    }
  }, [setActivities]);

  const saveExistingActivity = useCallback(async (item: ActivityItem) => {
    if (item.id <= 0) return;
    try {
      const updated = await putActivityById(item.id, {
        title: item.title,
        description: item.description ?? '',
        start_date: item.start_date,
        end_date: item.end_date,
        category: item.category.trim() || '기타',
        url: (item.url ?? '').trim(),
        tags: normalizeActivityTags(item.tags),
      });
      setActivities(prev =>
        prev.map(a => (a.id === item.id ? apiActivityToItem(updated) : a)),
      );
      toast.success('변경사항이 저장되었습니다.', SAVED_TOAST_OPTIONS);
    } catch {
      toast.error('활동 수정에 실패했습니다.');
      throw new Error('활동 수정 실패');
    }
  }, [setActivities]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = useMemo<PortfolioState>(
    () => ({
      userInfo: userInfoQuery.data ?? null,
      setUserInfo,
      isUserInfoLoading: userInfoQuery.isLoading,
      techStackDomains: techStackQuery.data ?? [],
      setTechStackDomains,
      isTechStackLoading: techStackQuery.isLoading,
      repos: reposQuery.data ?? EMPTY_PORTFOLIO_REPOS,
      setRepos,
      isReposLoading: reposQuery.isLoading,
      mileageItems: mileageQuery.data ?? [],
      setMileageItems,
      isMileageLoading: mileageQuery.isLoading,
      activities: activitiesQuery.data ?? [],
      setActivities,
      isActivitiesLoading: activitiesQuery.isLoading,
      deleteActivity,
      postNewActivity,
      saveExistingActivity,
      activitiesNextId,
      setActivitiesNextId,
    }),
    [
      userInfoQuery.data,
      userInfoQuery.isLoading,
      setUserInfo,
      techStackQuery.data,
      techStackQuery.isLoading,
      setTechStackDomains,
      reposQuery.data,
      reposQuery.isLoading,
      setRepos,
      mileageQuery.data,
      mileageQuery.isLoading,
      setMileageItems,
      activitiesQuery.data,
      activitiesQuery.isLoading,
      setActivities,
      deleteActivity,
      postNewActivity,
      saveExistingActivity,
      activitiesNextId,
    ],
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
};
