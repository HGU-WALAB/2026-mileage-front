import type { DraggableSectionKey } from '../constants/constants';
import type { TechStackDomain } from '../apis/techStack';
import type { ActivityItem, MileageItem, RepoItem, UserInfo } from './portfolioItems';

/** `setState`처럼 값 또는 `(prev) => next` */
export type ListSetterArg<T> = T[] | ((prev: T[]) => T[]);

export interface PortfolioState {
  userInfo: UserInfo | null;
  setUserInfo: (v: UserInfo | null | ((p: UserInfo | null) => UserInfo | null)) => void;
  isUserInfoLoading: boolean;

  sectionOrder: DraggableSectionKey[];
  setSectionOrder: (
    v: DraggableSectionKey[] | ((p: DraggableSectionKey[]) => DraggableSectionKey[]),
  ) => void;

  techStackDomains: TechStackDomain[];
  setTechStackDomains: (
    v: TechStackDomain[] | ((p: TechStackDomain[]) => TechStackDomain[]),
  ) => void;
  isTechStackLoading: boolean;

  repos: RepoItem[];
  setRepos: (v: RepoItem[] | ((p: RepoItem[]) => RepoItem[])) => void;
  isReposLoading: boolean;

  mileageItems: MileageItem[];
  setMileageItems: (v: MileageItem[] | ((p: MileageItem[]) => MileageItem[])) => void;
  isMileageLoading: boolean;

  activities: ActivityItem[];
  setActivities: (v: ActivityItem[] | ((p: ActivityItem[]) => ActivityItem[])) => void;
  isActivitiesLoading: boolean;

  /** 활동 삭제 (즉시 DELETE API 호출) */
  deleteActivity: (id: number) => void;
  /** 새 활동(id<0) 저장 버튼 클릭 시 POST. 실패 시 throw */
  postNewActivity: (item: ActivityItem) => Promise<void>;
  /** 기존 활동(id>0) 저장 시 PUT 전체 덮어쓰기. 실패 시 throw */
  saveExistingActivity: (item: ActivityItem) => Promise<void>;

  activitiesNextId: number;
  setActivitiesNextId: (v: number | ((p: number) => number)) => void;
}

