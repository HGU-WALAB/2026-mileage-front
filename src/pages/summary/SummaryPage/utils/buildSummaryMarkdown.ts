import type { DraggableSectionKey } from '../../constants/constants';
import {
  INPUT_DATA_LABEL,
  PORTFOLIO_PROMPT_TEMPLATE,
} from '../../constants/promptTemplate';
import type { TechStackItem, UserInfoResponse } from '../../apis/portfolio';
import type {
  ActivityItem,
  MileageItem,
  RepoItem,
} from '../context/SummaryContext';
import { SECTION_TITLES } from '../../constants/constants';
import {
  getTechLevelBand,
  getTechLevelBandLabel,
} from '../../utils/techStackLevel';

/** 미리보기에 보여지는 데이터만 사용해 마크다운 문자열 생성 */
export interface BuildSummaryMarkdownParams {
  userInfo: UserInfoResponse | null;
  sectionOrder: DraggableSectionKey[];
  techStackItems: TechStackItem[];
  repos: RepoItem[];
  mileageItems: MileageItem[];
  activities: ActivityItem[];
  /** 자격증 섹션 (activities API category 1) */
  certificates: ActivityItem[];
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[#!|])/g, '\\$1');
}

function sectionUserInfo(userInfo: UserInfoResponse | null): string {
  const name = userInfo?.name?.trim() ?? '-';
  const bio = userInfo?.bio?.trim() ?? '';
  const department = userInfo?.department?.trim() ?? '';
  const major1 = userInfo?.major1?.trim() ?? '';
  const major2 = userInfo?.major2?.trim() ?? '';
  const majorLine = [major1, major2].filter(Boolean).join(' / ') || '-';
  const departmentMajorLine =
    department !== '' ? `${department} ${majorLine}` : majorLine;
  const grade = userInfo?.grade;
  const semester = userInfo?.semester;
  const gradeSemester =
    grade != null && semester != null
      ? ` (${grade}학년 ${semester}학기)`
      : '';

  const lines: string[] = [
    `# ${escapeMarkdown(name)}`,
    '',
    ...(bio ? [`**${escapeMarkdown(bio)}**`, ''] : []),
    escapeMarkdown(departmentMajorLine) + (gradeSemester ? escapeMarkdown(gradeSemester) : ''),
  ];
  return lines.join('\n');
}

function sectionTechStack(items: TechStackItem[]): string {
  if (items.length === 0) return '';
  const title = SECTION_TITLES.tech;
  const lines = items.map(i => {
    const band = getTechLevelBandLabel(getTechLevelBand(i.level));
    return `- **${escapeMarkdown(i.domain.trim() || '기타')}** · ${escapeMarkdown(i.name)} (${i.level}%, ${band})`;
  });
  return `## ${escapeMarkdown(title)}\n\n${lines.join('\n')}`;
}

function sectionRepos(repos: RepoItem[]): string {
  const visible = repos.filter(r => r.is_visible);
  if (visible.length === 0) return '';
  const title = SECTION_TITLES.repo;
  const items = visible.map(r => {
    const name = r.custom_title ?? r.name;
    const desc = r.description ? ` - ${r.description}` : '';
    const lang = r.languages.length > 0 ? ` (${r.languages.join(', ')})` : '';
    return `- **${escapeMarkdown(name)}**${escapeMarkdown(desc)}${escapeMarkdown(lang)}`;
  });
  return `## ${escapeMarkdown(title)}\n\n${items.join('\n')}`;
}

function sectionMileage(items: MileageItem[]): string {
  const visible = items.filter(m => m.is_visible);
  if (visible.length === 0) return '';
  const title = SECTION_TITLES.mileage;
  const lines = visible.map(m => {
    const extra = m.additional_info ? ` · ${m.additional_info}` : '';
    return `- **${escapeMarkdown(m.semester)}** ${escapeMarkdown(m.category)} - ${escapeMarkdown(m.item)}${escapeMarkdown(extra)}`;
  });
  return `## ${escapeMarkdown(title)}\n\n${lines.join('\n')}`;
}

function sectionActivities(activities: ActivityItem[]): string {
  if (activities.length === 0) return '';
  const title = SECTION_TITLES.activities;
  const lines = activities.map(a => {
    const desc = a.description ? ` · ${a.description}` : '';
    return `- **${escapeMarkdown(a.title)}** (${a.start_date} ~ ${a.end_date})${escapeMarkdown(desc)}`;
  });
  return `## ${escapeMarkdown(title)}\n\n${lines.join('\n')}`;
}

function sectionCertificates(certificates: ActivityItem[]): string {
  if (certificates.length === 0) return '';
  const title = SECTION_TITLES.certificates;
  const lines = certificates.map(a => {
    const desc = a.description ? ` · ${a.description}` : '';
    return `- **${escapeMarkdown(a.title)}** (${a.start_date} ~ ${a.end_date})${escapeMarkdown(desc)}`;
  });
  return `## ${escapeMarkdown(title)}\n\n${lines.join('\n')}`;
}

const SECTION_BUILDERS: Record<
  DraggableSectionKey,
  (params: BuildSummaryMarkdownParams) => string
> = {
  tech: p => sectionTechStack(p.techStackItems),
  repo: p => sectionRepos(p.repos),
  mileage: p => sectionMileage(p.mileageItems),
  activities: p => sectionActivities(p.activities),
  certificates: p => sectionCertificates(p.certificates),
};

/**
 * 미리보기와 동일한 내용(유저 정보 + 선택된 섹션 순서·표시 항목)을 마크다운 문자열로 반환.
 * 프롬프트 템플릿 + [입력 데이터] + 실제 데이터 순으로 붙여 반환.
 */
export function buildSummaryMarkdown(params: BuildSummaryMarkdownParams): string {
  const parts: string[] = [sectionUserInfo(params.userInfo), ''];

  for (const key of params.sectionOrder) {
    const builder = SECTION_BUILDERS[key as DraggableSectionKey];
    if (!builder) continue;
    const block = builder(params);
    if (block) {
      parts.push(block, '');
    }
  }

  const dataMarkdown = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return [
    PORTFOLIO_PROMPT_TEMPLATE,
    '',
    INPUT_DATA_LABEL,
    '',
    dataMarkdown,
  ].join('\n');
}
