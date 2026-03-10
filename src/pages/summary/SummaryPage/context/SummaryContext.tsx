import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import {
  deleteActivity as deleteActivityApi,
  getActivities,
  getAllRepositories,
  getPortfolioMileage,
  getPortfolioSettings,
  getTechStack,
  getUserInfo,
  postActivity,
  putActivity,
  putTechStack,
} from '../../apis/portfolio';
import type {
  PortfolioRepositoryItem,
  UserInfoResponse,
} from '../../apis/portfolio';
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
  languages: string[];
  /** GitHub 레포 페이지 URL (제목 클릭 시 이동) */
  html_url?: string;
}

export interface MileageItem {
  /** 포트폴리오 마일리지 항목 id (PUT /api/portfolio/mileage/{id}용) */
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
  /** 활동 섹션에는 category === 0 인 것만 표시 */
  category?: number;
  /** API 응답용. 0이 맨 위. 로컬 추가분은 없을 수 있음 */
  display_order?: number;
}

const ACTIVITY_SECTION_CATEGORY = 0;
const CERTIFICATE_SECTION_CATEGORY = 1;

function apiActivityToItem(
  a: import('../../apis/portfolio').ActivityApiItem,
): ActivityItem {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    start_date: a.start_date,
    end_date: a.end_date,
    category: a.category,
    display_order: a.display_order,
  };
}

function nonEmpty(s: string | null | undefined): string | null {
  const t = s?.trim();
  return t !== undefined && t !== null && t !== '' ? t : null;
}

export function portfolioRepoToRepoItem(p: PortfolioRepositoryItem): RepoItem {
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
    languages: p.language ? [p.language] : [],
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
  techStackTags: string[];
  setTechStackTags: (v: string[] | ((p: string[]) => string[])) => void;
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
  /** 자격증 섹션 (동일 activities API, category 1) */
  certificates: ActivityItem[];
  setCertificates: (v: ActivityItem[] | ((p: ActivityItem[]) => ActivityItem[])) => void;
  deleteCertificate: (id: number) => void;
  /** 새 자격증(id<0) 저장 버튼 클릭 시 POST. 실패 시 throw */
  postNewCertificate: (item: ActivityItem) => Promise<void>;
  /** 기존 자격증(id>0) 저장 버튼 클릭 시 PUT. 실패 시 throw */
  saveExistingCertificate: (item: ActivityItem) => Promise<void>;
  certificatesNextId: number;
  setCertificatesNextId: (v: number | ((p: number) => number)) => void;
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

export const SummaryProvider = ({ children }: SummaryProviderProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sectionOrder, setSectionOrder] = useState<DraggableSectionKey[]>(
    DRAGGABLE_SECTION_ORDER,
  );
  const [techStackTags, setTechStackTagsState] = useState<string[]>([]);
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [mileageItems, setMileageItems] = useState<MileageItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesNextId, setActivitiesNextId] = useState(-1);
  const [certificates, setCertificates] = useState<ActivityItem[]>([]);
  const [certificatesNextId, setCertificatesNextId] = useState(-1);

  const techStackUserModifiedRef = useRef(false);

  const setTechStackTags = useCallback(
    (v: string[] | ((p: string[]) => string[])) => {
      techStackUserModifiedRef.current = true;
      setTechStackTagsState(v);
    },
    [],
  );

  /** 활동 삭제 (즉시 DELETE API 호출) */
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
  }, []);

  /** 자격증 삭제 (즉시 DELETE API 호출) */
  const deleteCertificate = useCallback(async (id: number) => {
    if (id > 0) {
      try {
        await deleteActivityApi(id);
      } catch {
        toast.error('자격증 삭제에 실패했습니다.');
        return;
      }
    }
    setCertificates(prev => prev.filter(a => a.id !== id));
  }, []);

  /** 새 활동(id<0) 저장 버튼 클릭 시에만 POST. 성공 시 목록에 서버 응답으로 교체, 실패 시 throw */
  const postNewActivity = useCallback(async (item: ActivityItem) => {
    if (item.id >= 0) return;
    try {
      const posted = await postActivity({
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: ACTIVITY_SECTION_CATEGORY,
      });
      setActivities(prev =>
        prev.map(a => (a.id === item.id ? apiActivityToItem(posted) : a)),
      );
    } catch {
      toast.error('활동 추가에 실패했습니다.');
      throw new Error('활동 추가 실패');
    }
  }, []);

  /** 새 자격증(id<0) 저장 버튼 클릭 시에만 POST. 성공 시 목록에 서버 응답으로 교체, 실패 시 throw */
  const postNewCertificate = useCallback(async (item: ActivityItem) => {
    if (item.id >= 0) return;
    try {
      const posted = await postActivity({
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: CERTIFICATE_SECTION_CATEGORY,
      });
      setCertificates(prev =>
        prev.map(a => (a.id === item.id ? apiActivityToItem(posted) : a)),
      );
    } catch {
      toast.error('자격증 추가에 실패했습니다.');
      throw new Error('자격증 추가 실패');
    }
  }, []);

  /** 기존 활동(id>0) 저장 버튼 클릭 시 즉시 PUT. 실패 시 throw */
  const saveExistingActivity = useCallback(async (item: ActivityItem) => {
    if (item.id <= 0) return;
    try {
      const updated = await putActivity(item.id, {
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: ACTIVITY_SECTION_CATEGORY,
      });
      setActivities(prev =>
        prev.map(a => (a.id === item.id ? apiActivityToItem(updated) : a)),
      );
      toast.success('변경사항이 저장되었습니다.', SAVED_TOAST_OPTIONS);
    } catch {
      toast.error('활동 수정에 실패했습니다.');
      throw new Error('활동 수정 실패');
    }
  }, []);

  /** 기존 자격증(id>0) 저장 버튼 클릭 시 즉시 PUT. 실패 시 throw */
  const saveExistingCertificate = useCallback(async (item: ActivityItem) => {
    if (item.id <= 0) return;
    try {
      const updated = await putActivity(item.id, {
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        category: CERTIFICATE_SECTION_CATEGORY,
      });
      setCertificates(prev =>
        prev.map(a => (a.id === item.id ? apiActivityToItem(updated) : a)),
      );
      toast.success('변경사항이 저장되었습니다.', SAVED_TOAST_OPTIONS);
    } catch {
      toast.error('자격증 수정에 실패했습니다.');
      throw new Error('자격증 수정 실패');
    }
  }, []);

  /** 활동 요약 페이지 진입 시 GET 1회 */
  useEffect(() => {
    getPortfolioSettings()
      .then(res => {
        const order = res.section_order ?? [];
        const validKeys = order.filter((k): k is DraggableSectionKey =>
          DRAGGABLE_SECTION_ORDER.includes(k as DraggableSectionKey),
        );
        const missing = DRAGGABLE_SECTION_ORDER.filter(k => !validKeys.includes(k));
        if (validKeys.length > 0) {
          setSectionOrder([...validKeys, ...missing]);
        }
      })
      .catch(() => {
        // 설정 조회 실패 시 기본 순서 유지
      });

    getTechStack()
      .then(res => {
        setTechStackTagsState(res.tech_stack ?? []);
      })
      .catch(() => {
        toast.error('기술 스택을 불러오지 못했습니다.');
      });

    getActivities({ category: [ACTIVITY_SECTION_CATEGORY] })
      .then(res => {
        const list = (res.activities ?? []).filter(
          a => a.category === ACTIVITY_SECTION_CATEGORY,
        );
        const sorted = [...list].sort(
          (a, b) => a.display_order - b.display_order,
        );
        setActivities(sorted.map(apiActivityToItem));
      })
      .catch(() => {
        toast.error('활동 목록을 불러오지 못했습니다.');
      });

    getActivities({ category: [CERTIFICATE_SECTION_CATEGORY] })
      .then(res => {
        const list = (res.activities ?? []).filter(
          a => a.category === CERTIFICATE_SECTION_CATEGORY,
        );
        const sorted = [...list].sort(
          (a, b) => a.display_order - b.display_order,
        );
        setCertificates(sorted.map(apiActivityToItem));
      })
      .catch(() => {
        toast.error('자격증 목록을 불러오지 못했습니다.');
      });

    getUserInfo()
      .then(res => {
        setUserInfo(res);
        try {
          localStorage.setItem(
            'portfolio-user-info',
            JSON.stringify(res),
          );
        } catch {
          // ignore
        }
      })
      .catch(() => {
        toast.error('유저 정보를 불러오지 못했습니다.');
      });

    getAllRepositories()
      .then(list => {
        setRepos(list.map(portfolioRepoToRepoItem));
      })
      .catch(() => {
        toast.error('레포지토리 목록을 불러오지 못했습니다.');
      });

    getPortfolioMileage()
      .then(res => {
        const list = res.mileage ?? [];
        const sorted = [...list].sort(
          (a, b) => a.display_order - b.display_order,
        );
        setMileageItems(sorted.map(portfolioMileageToItem));
      })
      .catch(() => {
        toast.error('마일리지 목록을 불러오지 못했습니다.');
      });
  }, []);

  /** 기술 스택 변경 시 즉시 PUT */
  useEffect(() => {
    if (!techStackUserModifiedRef.current) return;

    putTechStack({ tech_stack: techStackTags })
      .then(() => {
        toast.success('변경사항이 저장되었습니다.', SAVED_TOAST_OPTIONS);
      })
      .catch(() => {
        toast.error('기술 스택 저장에 실패했습니다.');
      });
  }, [techStackTags]);

  const value = useMemo<SummaryState>(
    () => ({
      userInfo,
      setUserInfo,
      sectionOrder,
      setSectionOrder,
      techStackTags,
      setTechStackTags,
      repos,
      setRepos,
      mileageItems,
      setMileageItems,
      activities,
      setActivities,
      deleteActivity,
      postNewActivity,
      saveExistingActivity,
      activitiesNextId,
      setActivitiesNextId,
      certificates,
      setCertificates,
      deleteCertificate,
      postNewCertificate,
      saveExistingCertificate,
      certificatesNextId,
      setCertificatesNextId,
    }),
    [
      userInfo,
      sectionOrder,
      techStackTags,
      setTechStackTags,
      repos,
      mileageItems,
      activities,
      deleteActivity,
      postNewActivity,
      saveExistingActivity,
      activitiesNextId,
      certificates,
      deleteCertificate,
      postNewCertificate,
      saveExistingCertificate,
      certificatesNextId,
    ],
  );

  return (
    <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>
  );
};
