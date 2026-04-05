import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
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
  getPortfolioSettings,
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
import {
  DRAGGABLE_SECTION_ORDER,
  type DraggableSectionKey,
} from '../../constants/constants';
import type { ActivityItem, MileageItem, RepoItem, UserInfo } from '../../types/portfolioItems';
import type { PortfolioState } from '../../types/portfolioState';

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
    is_visible: p.is_visible,
    display_order: p.display_order,
    name: nonEmpty(p.name) ?? nonEmpty(p.custom_title) ?? String(p.repo_id),
    description: p.description ?? '',
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

  // ── 섹션 순서 ──────────────────────────────────────────────────────────────
  const settingsQuery = useQuery<DraggableSectionKey[]>({
    queryKey: [QUERY_KEYS.portfolioSettings],
    queryFn: async () => {
      const res = await getPortfolioSettings();
      const order = res.section_order ?? [];
      const validKeys = order.filter((k): k is DraggableSectionKey =>
        DRAGGABLE_SECTION_ORDER.includes(k as DraggableSectionKey),
      );
      const missing = DRAGGABLE_SECTION_ORDER.filter(k => !validKeys.includes(k));
      return validKeys.length > 0 ? [...validKeys, ...missing] : DRAGGABLE_SECTION_ORDER;
    },
    ...QUERY_CONFIG,
  });

  const setSectionOrder = useCallback(
    (v: DraggableSectionKey[] | ((p: DraggableSectionKey[]) => DraggableSectionKey[])) => {
      queryClient.setQueryData<DraggableSectionKey[]>(
        [QUERY_KEYS.portfolioSettings],
        prev => (typeof v === 'function' ? v(prev ?? DRAGGABLE_SECTION_ORDER) : v),
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

  const reposQuery = useQuery<RepoItem[]>({
    queryKey: repoQueryKey,
    queryFn: async () => {
      const { getAllRepositories } = await import('../../apis/portfolio');
      const list = await getAllRepositories();
      return (list ?? []).map(portfolioRepoToRepoItem);
    },
    ...QUERY_CONFIG,
  });

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
      sectionOrder: settingsQuery.data ?? DRAGGABLE_SECTION_ORDER,
      setSectionOrder,
      techStackDomains: techStackQuery.data ?? [],
      setTechStackDomains,
      isTechStackLoading: techStackQuery.isLoading,
      repos: reposQuery.data ?? [],
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
      settingsQuery.data,
      setSectionOrder,
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
