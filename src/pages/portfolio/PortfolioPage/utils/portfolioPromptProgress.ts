import { useMemo } from 'react';

import type { TechStackDomain } from '../../apis/portfolio';

import {
  usePortfolioContext,
} from '../context/PortfolioContext';
import type { ActivityItem, MileageItem, RepoItem } from '../../types/portfolioItems';

/** 한 줄 소개 만점 기준 글자 수 */
export const PROMPT_PROGRESS_INTRO_CHARS_FULL = 100;
/** 기술 스택: 서로 다른 도메인 개수 만점 기준 */
export const PROMPT_PROGRESS_TECH_DOMAINS_FULL = 2;
/** 기술 스택: 기술 항목(이름 있는 행) 개수 만점 기준 */
export const PROMPT_PROGRESS_TECH_ITEMS_FULL = 5;
/** 선택한 레포지토리 설명 만점 기준 (레포당) */
export const PROMPT_PROGRESS_REPO_DESC_CHARS_FULL = 100;
/** 활동 개수 만점 기준 */
export const PROMPT_PROGRESS_ACTIVITIES_FULL = 5;

/** 섹션별 만점 기준 안내 (UI) */
export const PROMPT_QUALITY_SECTION_HINTS = {
  intro: '100자 이상 작성 시 만점',
  tech: '도메인 2개, 기술 5개 이상 시 만점',
  repo: '각 레포 설명 100자 이상 시 만점',
  activities: '5개 이상 추가 시 만점',
  mileage: '선택한 항목 모두 내용 추가 시 만점',
} as const;

export interface PortfolioPromptProgressInput {
  bio: string;
  techStackDomains: TechStackDomain[];
  repos: RepoItem[];
  mileageItems: MileageItem[];
  activities: ActivityItem[];
}

export interface PortfolioPromptProgress {
  /** 자기소개(한 줄 소개) 0–100 */
  intro: number;
  /** 기술 스택(도메인·개수) 0–100 */
  tech: number;
  /** 노출 중인 레포 설명 충실도 평균 0–100 */
  repo: number;
  /** 활동 개수 0–100 */
  activities: number;
  /** 선택된 마일리지 중 추가 설명을 채운 비율 0–100 */
  mileage: number;
  /** 다섯 섹션 산술 평균 0–100 */
  overall: number;
}

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function effectiveTechRows(domains: TechStackDomain[]) {
  const rows: { name: string; domain: string }[] = [];
  for (const d of domains) {
    const domain = (d.name ?? '').trim() || '기타';
    for (const t of d.tech_stacks ?? []) {
      const name = (t.name ?? '').trim();
      if (name !== '') rows.push({ name, domain });
    }
  }
  return rows;
}

/**
 * 자기소개: 글자 수가 PROMPT_PROGRESS_INTRO_CHARS_FULL 이상이면 100%
 */
export function computeIntroProgress(bio: string): number {
  const len = (bio ?? '').trim().length;
  return clampPct((len / PROMPT_PROGRESS_INTRO_CHARS_FULL) * 100);
}

/**
 * 기술 스택: (고유 도메인 수 / 2)와 (항목 수 / 5)의 평균, 각각 상한 100%
 */
export function computeTechProgress(domains: TechStackDomain[]): number {
  const rows = effectiveTechRows(domains);
  if (rows.length === 0) return 0;
  const domainCount = new Set(rows.map(r => r.domain)).size;
  const domainPart = Math.min(domainCount / PROMPT_PROGRESS_TECH_DOMAINS_FULL, 1);
  const itemPart = Math.min(rows.length / PROMPT_PROGRESS_TECH_ITEMS_FULL, 1);
  return clampPct(((domainPart + itemPart) / 2) * 100);
}

/**
 * 노출(is_visible) 레포만 대상. 레포당 설명 글자 수 / 100 의 평균.
 * 노출 레포가 없으면 0%.
 */
export function computeRepoProgress(repos: RepoItem[]): number {
  const visible = repos.filter(r => r.is_visible);
  if (visible.length === 0) return 0;
  const sum = visible.reduce((acc, r) => {
    const len = (r.description ?? '').trim().length;
    return acc + Math.min(len / PROMPT_PROGRESS_REPO_DESC_CHARS_FULL, 1);
  }, 0);
  return clampPct((sum / visible.length) * 100);
}

export function computeActivitiesProgress(activities: ActivityItem[]): number {
  const n = activities.length;
  return clampPct(Math.min(n / PROMPT_PROGRESS_ACTIVITIES_FULL, 1) * 100);
}

/**
 * 포트폴리오에 담긴 마일리지 행마다 additional_info 가 비어 있지 않으면 채움으로 간주.
 */
export function computeMileageProgress(mileageItems: MileageItem[]): number {
  if (mileageItems.length === 0) return 0;
  const filled = mileageItems.filter(
    m => (m.additional_info ?? '').trim().length > 0,
  ).length;
  return clampPct((filled / mileageItems.length) * 100);
}

export function computePortfolioPromptProgress(
  input: PortfolioPromptProgressInput,
): PortfolioPromptProgress {
  const intro = computeIntroProgress(input.bio);
  const tech = computeTechProgress(input.techStackDomains);
  const repo = computeRepoProgress(input.repos);
  const activities = computeActivitiesProgress(input.activities);
  const mileage = computeMileageProgress(input.mileageItems);
  const overall = clampPct(
    (intro + tech + repo + activities + mileage) / 5,
  );
  return { intro, tech, repo, activities, mileage, overall };
}

export function usePortfolioPromptProgress(): PortfolioPromptProgress {
  const {
    userInfo,
    techStackDomains,
    repos,
    mileageItems,
    activities,
  } = usePortfolioContext();

  return useMemo(
    () =>
      computePortfolioPromptProgress({
        bio: userInfo?.bio ?? '',
        techStackDomains,
        repos: Array.isArray(repos) ? repos : [],
        mileageItems,
        activities,
      }),
    [
      userInfo?.bio,
      techStackDomains,
      repos,
      mileageItems,
      activities,
    ],
  );
}
