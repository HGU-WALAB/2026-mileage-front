import type { DraggableSectionKey } from '../../constants/constants';
import type {
  ActivityItem,
  MileageItem,
  RepoItem,
} from '../context/SummaryContext';
import { SECTION_TITLES } from '../../constants/constants';

/** 미리보기에 보여지는 데이터만 사용해 마크다운 문자열 생성 */
export interface BuildSummaryMarkdownParams {
  sectionOrder: DraggableSectionKey[];
  techStackTags: string[];
  repos: RepoItem[];
  mileageItems: MileageItem[];
  activities: ActivityItem[];
}

/** 유저 정보는 현재 하드코딩 (추후 API 연동 시 파라미터로 받기) */
const DEFAULT_USER = {
  name: '홍길동 (김길동)',
  bio: 'CS student',
  major: '전공1 / 전공2',
};

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[#!|])/g, '\\$1');
}

function sectionUserInfo(): string {
  const { name, bio, major } = DEFAULT_USER;
  const lines: string[] = [
    `# ${escapeMarkdown(name)}`,
    '',
    `**${escapeMarkdown(bio)}**`,
    '',
    escapeMarkdown(major),
  ];
  return lines.join('\n');
}

function sectionTechStack(tags: string[]): string {
  if (tags.length === 0) return '';
  const title = SECTION_TITLES.tech;
  const tagList = tags.map(t => `- ${escapeMarkdown(t)}`).join('\n');
  return `## ${escapeMarkdown(title)}\n\n${tagList}`;
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

const SECTION_BUILDERS: Record<
  DraggableSectionKey,
  (params: BuildSummaryMarkdownParams) => string
> = {
  tech: p => sectionTechStack(p.techStackTags),
  repo: p => sectionRepos(p.repos),
  mileage: p => sectionMileage(p.mileageItems),
  activities: p => sectionActivities(p.activities),
};

/**
 * 미리보기와 동일한 내용(유저 정보 + 선택된 섹션 순서·표시 항목)을 마크다운 문자열로 반환
 */
export function buildSummaryMarkdown(params: BuildSummaryMarkdownParams): string {
  const parts: string[] = [sectionUserInfo(), ''];

  for (const key of params.sectionOrder) {
    const block = SECTION_BUILDERS[key](params);
    if (block) {
      parts.push(block, '');
    }
  }

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
