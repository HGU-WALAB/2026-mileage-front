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
  patchActivityById,
  postActivity,
  putTechStack,
} from '../../apis/portfolio';
import type {
  PortfolioRepositoryLanguage,
  PortfolioRepositoryItem,
  TechStackItem,
  UserInfoResponse,
} from '../../apis/portfolio';
import { clampTechLevel } from '../../utils/techStackLevel';
import {
  DRAGGABLE_SECTION_ORDER,
  type DraggableSectionKey,
} from '../../constants/constants';

const SAVED_TOAST_OPTIONS = {
  position: 'top-center' as const,
};

export interface RepoItem {
  /** PATCH /api/portfolio/repositories/:id 시 사용. API가 null 반환 시 없을 수 있음 */
  id?: number;
  repo_id: number;
  custom_title: string | null;
  is_visible: boolean;
  display_order?: number;
  name: string;
  owner?: string;
  description: string;
  created_at: string;
  updated_at: string;
  /** 마크다운 등에 쓰는 언어 이름 목록 */
  languages: string[];
  /** 카드 UI: 언어별 비율 표시용 */
  languageBreakdown?: PortfolioRepositoryLanguage[];
  commit_count?: number;
  stargazers_count?: number;
  forks_count?: number;
  /** GitHub 레포 페이지 URL (제목 클릭 시 이동) */
  html_url?: string;
}

export interface MileageItem {
  /** 이력서 마일리지 항목 id (PUT /api/portfolio/mileage/{id}용) */
  id?: number;
  mileage_id: number;
  semester: string;
  category: string;
  item: string;
  additional_info: string;
  is_visible: boolean;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  /** 사용자 정의 카테고리 문자열 */
  category: string;
  /** API 응답용. 0이 맨 위. 로컬 추가분은 없을 수 있음 */
  display_order?: number;
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

export type UserInfo = UserInfoResponse;

export interface SummaryState {
  userInfo: UserInfo | null;
  setUserInfo: (v: UserInfo | null | ((p: UserInfo | null) => UserInfo | null)) => void;
  sectionOrder: DraggableSectionKey[];
  setSectionOrder: (v: DraggableSectionKey[] | ((p: DraggableSectionKey[]) => DraggableSectionKey[])) => void;
  techStackItems: TechStackItem[];
  setTechStackItems: (
    v: TechStackItem[] | ((p: TechStackItem[]) => TechStackItem[]),
  ) => void;
  repos: RepoItem[];
  setRepos: (v: RepoItem[] | ((p: RepoItem[]) => RepoItem[])) => void;
  mileageItems: MileageItem[];
  setMileageItems: (v: MileageItem[] | ((p: MileageItem[]) => MileageItem[])) => void;
  activities: ActivityItem[];
  setActivities: (v: ActivityItem[] | ((p: ActivityItem[]) => ActivityItem[])) => void;
  /** 활동 삭제 (즉시 DELETE API 호출) */
  deleteActivity: (id: number) => void;
  /** 새 활동(id<0) 저장 버튼 클릭 시 POST. 실패 시 throw */
  postNewActivity: (item: ActivityItem) => Promise<void>;
  /** 기존 활동(id>0) 저장 버튼 클릭 시 PUT. 실패 시 throw */
  saveExistingActivity: (item: ActivityItem) => Promise<void>;
  activitiesNextId: number;
  setActivitiesNextId: (v: number | ((p: number) => number)) => void;
}

const SummaryContext = createContext<SummaryState | null>(null);

export const useSummaryContext = () => {
  const ctx = useContext(SummaryContext);
  if (ctx == null) {
    throw new Error('useSummaryContext must be used within SummaryProvider');
  }
  return ctx;
};

interface SummaryProviderProps {
  children: ReactNode;
}

const normalizeTechStackList = (list: TechStackItem[]) =>
  list
    .map(item => ({
      name: (item.name ?? '').trim(),
      domain: (item.domain ?? '').trim() || '기타',
      level: clampTechLevel(item.level ?? 0),
    }))
    .filter(item => item.name !== '');

const QUERY_CONFIG = { retry: 1, refetchOnWindowFocus: false } as const;

export const SummaryProvider = ({ children }: SummaryProviderProps) => {
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
  const techStackQuery = useQuery<TechStackItem[]>({
    queryKey: [QUERY_KEYS.portfolioTechStack],
    queryFn: async () => {
      const res = await getTechStack();
      return normalizeTechStackList(res.tech_stack ?? []);
    },
    ...QUERY_CONFIG,
  });

  const setTechStackItems = useCallback(
    (v: TechStackItem[] | ((p: TechStackItem[]) => TechStackItem[])) => {
      const prev = queryClient.getQueryData<TechStackItem[]>([QUERY_KEYS.portfolioTechStack]) ?? [];
      const next = typeof v === 'function' ? v(prev) : v;
      queryClient.setQueryData<TechStackItem[]>([QUERY_KEYS.portfolioTechStack], next);
      putTechStack({ tech_stack: normalizeTechStackList(next) })
        .then(() => toast.success('변경사항이 저장되었습니다.', SAVED_TOAST_OPTIONS))
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
      const posted = await postActivity({
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: item.category.trim() || '기타',
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
      const updated = await patchActivityById(item.id, {
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: item.category.trim() || '기타',
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
  const value = useMemo<SummaryState>(
    () => ({
      userInfo: userInfoQuery.data ?? null,
      setUserInfo,
      sectionOrder: settingsQuery.data ?? DRAGGABLE_SECTION_ORDER,
      setSectionOrder,
      techStackItems: techStackQuery.data ?? [],
      setTechStackItems,
      repos: reposQuery.data ?? [],
      setRepos,
      mileageItems: mileageQuery.data ?? [],
      setMileageItems,
      activities: activitiesQuery.data ?? [],
      setActivities,
      deleteActivity,
      postNewActivity,
      saveExistingActivity,
      activitiesNextId,
      setActivitiesNextId,
    }),
    [
      userInfoQuery.data,
      setUserInfo,
      settingsQuery.data,
      setSectionOrder,
      techStackQuery.data,
      setTechStackItems,
      reposQuery.data,
      setRepos,
      mileageQuery.data,
      setMileageItems,
      activitiesQuery.data,
      setActivities,
      deleteActivity,
      postNewActivity,
      saveExistingActivity,
      activitiesNextId,
    ],
  );

  return (
    <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>
  );
};
