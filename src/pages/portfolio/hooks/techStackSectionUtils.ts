import type { TechStackDomain, TechStackSkill } from '../apis/portfolio';
import {
  levelToProficiencyTier,
  type ProficiencyTierIndex,
  PROFICIENCY_TIER_LABELS,
} from '../utils/techStackLevel';

export function sortTechStackDomains(domains: TechStackDomain[]): TechStackDomain[] {
  return [...domains].sort((a, b) => a.order_index - b.order_index);
}

/** 칼럼별 스택 원본 인덱스 유지 (삭제용) */
export function bucketStacksByTier(stacks: TechStackSkill[]) {
  const buckets: Array<Array<{ skill: TechStackSkill; stackIndex: number }>> =
    Array.from({ length: PROFICIENCY_TIER_LABELS.length }, () => []);
  stacks.forEach((skill, stackIndex) => {
    const tier = levelToProficiencyTier(skill.level);
    buckets[tier].push({ skill, stackIndex });
  });
  buckets.forEach(b =>
    b.sort((a, c) => a.skill.name.localeCompare(c.skill.name, 'ko')),
  );
  return buckets;
}

/** 표에 그리는 칼럼(숙련도 단계)에 맞춰 버킷만 추림 */
export function bucketStacksForVisible(
  stacks: TechStackSkill[],
  visibleTiers: ProficiencyTierIndex[],
) {
  const full = bucketStacksByTier(stacks);
  return visibleTiers.map(ti => full[ti]);
}

