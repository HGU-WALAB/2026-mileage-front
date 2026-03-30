import { Button, Flex, Heading, Text } from '@/components';
import { palette } from '@/styles/palette';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Checkbox, useTheme } from '@mui/material';
import { type FunctionComponent, type ReactNode, type SVGProps } from 'react';

import {
  normalizePortfolioProfileUrl,
  type ProfileLinkItem,
} from '@/pages/portfolio/apis/userInfo';
import { TechStackSectionContent } from '@/pages/portfolio/PortfolioPage/components';
import { formatActivityPeriodRange } from '@/pages/portfolio/utils/date';
import {
  type ActivityItem,
  type MileageItem,
  type RepoItem,
} from '@/pages/portfolio/PortfolioPage/context/PortfolioContext';

import { CvGeneratePageS as S } from '../cvGeneratePageStyles';
import { repoSelectionId, toggleInList } from '../../utils/cvWizardSelection';

const AutoAwesomeIconWrap: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
);

export interface CvGenerateStep1Props {
  name: string;
  bio: string;
  departmentMajorLine: string;
  profileImageUrl: string | null;
  profileLinks: ProfileLinkItem[];
  mileageItems: MileageItem[];
  activities: ActivityItem[];
  visibleRepos: RepoItem[];
  selectedMileageIds: number[];
  selectedActivityIds: number[];
  selectedRepoIds: number[];
  onSelectedMileageIdsChange: (updater: (prev: number[]) => number[]) => void;
  onSelectedActivityIdsChange: (updater: (prev: number[]) => number[]) => void;
  onSelectedRepoIdsChange: (updater: (prev: number[]) => number[]) => void;
  onPrev: () => void;
  onBuildPrompt: () => void;
  buildPromptPending: boolean;
}

const CvGenerateStep1 = ({
  name,
  bio,
  departmentMajorLine,
  profileImageUrl,
  profileLinks,
  mileageItems,
  activities,
  visibleRepos,
  selectedMileageIds,
  selectedActivityIds,
  selectedRepoIds,
  onSelectedMileageIdsChange,
  onSelectedActivityIdsChange,
  onSelectedRepoIdsChange,
  onPrev,
  onBuildPrompt,
  buildPromptPending,
}: CvGenerateStep1Props) => {
  const theme = useTheme();
  const visibleProfileLinks = (profileLinks ?? []).filter(
    l => l.url?.trim() || l.label?.trim(),
  );

  return (
    <>
      <Flex.Column gap="1.25rem" width="100%" style={{ marginTop: '1.5rem' }}>
        <Flex.Column gap="0.35rem" width="100%">
          <Heading as="h3" margin="0" color={theme.palette.text.primary}>
            어떤 항목을 포함할까요?
          </Heading>
          <Text
            margin="0"
            style={{
              ...theme.typography.body2,
              color: theme.palette.grey[600],
            }}
          >
            포트폴리오에 넣을 마일리지·레포지토리·활동을 선택하세요. 프로필과 기술 스택은 자동으로 포함됩니다.
          </Text>
        </Flex.Column>

        <S.HighlightSection>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <PersonOutlineIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Heading as="h4" margin="0" color={theme.palette.text.primary}>
              프로필 (필수)
            </Heading>
          </Flex.Row>
          <S.ProfileInner align="flex-start" gap="1rem" wrap="wrap">
            <S.AvatarBox>
              {profileImageUrl ? <S.AvatarImg src={profileImageUrl} alt="" /> : null}
            </S.AvatarBox>
            <Flex.Column gap="0.35rem" style={{ flex: '1 1 12rem', minWidth: 0 }}>
              <Heading as="h2" margin="0" color={theme.palette.text.primary}>
                {name}
              </Heading>
              <Text
                margin="0"
                style={{
                  ...theme.typography.body1,
                  color: theme.palette.grey[600],
                }}
              >
                {bio || '-'}
              </Text>
              <Text
                margin="0"
                style={{
                  ...theme.typography.body1,
                  color: theme.palette.grey[600],
                }}
              >
                {departmentMajorLine}
              </Text>
              {visibleProfileLinks.length > 0 ? (
                <S.ProfileLinkList aria-label="프로필 링크">
                  {visibleProfileLinks.map((link, idx) => {
                    const href = normalizePortfolioProfileUrl(link.url?.trim() ?? '');
                    const label = link.label?.trim() || '링크';
                    return (
                      <li key={`${link.url}-${idx}`}>
                        <Flex.Row
                          align="flex-start"
                          gap="0.5rem"
                          wrap="wrap"
                          style={{ minWidth: 0 }}
                        >
                          <Text
                            margin="0"
                            style={{
                              ...theme.typography.body2,
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              flexShrink: 0,
                            }}
                          >
                            {label}
                          </Text>
                          {href ? (
                            <S.ProfileLinkAnchor
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.url?.trim()}
                            </S.ProfileLinkAnchor>
                          ) : (
                            <Text
                              margin="0"
                              style={{
                                ...theme.typography.body2,
                                color: theme.palette.grey[500],
                              }}
                            >
                              —
                            </Text>
                          )}
                        </Flex.Row>
                      </li>
                    );
                  })}
                </S.ProfileLinkList>
              ) : null}
            </Flex.Column>
          </S.ProfileInner>
        </S.HighlightSection>

        <S.HighlightSection>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap" style={{ marginBottom: '0.65rem' }}>
            <CodeIcon sx={{ fontSize: 20, color: palette.grey500 }} />
            <Heading as="h4" margin="0" color={theme.palette.text.primary}>
              기술 스택 (필수)
            </Heading>
          </Flex.Row>
          <TechStackSectionContent readOnly />
        </S.HighlightSection>

        <SelectableSection
          title="마일리지 항목"
          countLabel={`${selectedMileageIds.length}개 선택`}
          itemCount={mileageItems.length}
          icon={<MenuBookIcon sx={{ fontSize: 20, color: palette.grey600 }} />}
          emptyText="포트폴리오에 등록된 마일리지가 없습니다. 내 활동 관리에서 마일리지를 추가하세요."
        >
          {mileageItems.map(m => (
            <MileageSelectableRow
              key={m.mileage_id}
              item={m}
              selected={typeof m.id === 'number' && selectedMileageIds.includes(m.id)}
              disabled={typeof m.id !== 'number'}
              onToggle={() => {
                const mid = m.id;
                if (typeof mid !== 'number') return;
                onSelectedMileageIdsChange(prev => toggleInList(prev, mid));
              }}
            />
          ))}
        </SelectableSection>

        <SelectableSection
          title="레포지토리"
          countLabel={`${selectedRepoIds.filter(id => visibleRepos.some(r => repoSelectionId(r) === id)).length}개 선택`}
          itemCount={visibleRepos.length}
          icon={<FolderIcon sx={{ fontSize: 20, color: palette.grey600 }} />}
          emptyText="표시 중인 레포지토리가 없습니다. 내 활동 관리에서 레포를 선택·노출하세요."
        >
          {visibleRepos.map(r => {
            const sid = repoSelectionId(r);
            return (
              <RepoSelectableRow
                key={`${r.repo_id}-${sid}`}
                repo={r}
                selected={selectedRepoIds.includes(sid)}
                onToggle={() => onSelectedRepoIdsChange(prev => toggleInList(prev, sid))}
              />
            );
          })}
        </SelectableSection>

        <SelectableSection
          title="활동"
          countLabel={`${selectedActivityIds.length}개 선택`}
          itemCount={activities.length}
          icon={<EmojiEventsIcon sx={{ fontSize: 20, color: palette.grey600 }} />}
          emptyText="등록된 활동이 없습니다. 내 활동 관리에서 활동을 추가하세요."
        >
          {activities.map(a => (
            <ActivitySelectableRow
              key={a.id}
              activity={a}
              selected={selectedActivityIds.includes(a.id)}
              onToggle={() => onSelectedActivityIdsChange(prev => toggleInList(prev, a.id))}
            />
          ))}
        </SelectableSection>
      </Flex.Column>

      <Flex.Row
        align="center"
        justify="space-between"
        gap="0.75rem"
        wrap="wrap"
        width="100%"
        style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${palette.grey200}`,
        }}
      >
        <S.BackButton
          type="button"
          variant="outlined"
          onClick={onPrev}
          aria-label="공고 입력 단계로 돌아가기"
          startIcon={<ArrowBackIcon sx={{ fontSize: 20, color: 'inherit' }} />}
        >
          이전 단계
        </S.BackButton>
        <Button
          label="프롬프트 생성"
          variant="contained"
          color="blue"
          size="large"
          icon={AutoAwesomeIconWrap}
          iconPosition="start"
          disabled={buildPromptPending}
          onClick={onBuildPrompt}
        />
      </Flex.Row>
    </>
  );
};

export default CvGenerateStep1;

function SelectableSection({
  title,
  countLabel,
  itemCount,
  icon,
  emptyText,
  children,
}: {
  title: string;
  countLabel: string;
  itemCount: number;
  icon: ReactNode;
  emptyText: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  const isEmpty = itemCount === 0;

  return (
    <S.SectionBlock>
      <Flex.Row
        align="center"
        justify="space-between"
        gap="0.75rem"
        wrap="wrap"
        style={{ marginBottom: '0.65rem' }}
      >
        <Flex.Row align="center" gap="0.5rem" wrap="wrap">
          {icon}
          <Heading as="h4" margin="0" color={theme.palette.text.primary}>
            {title}
          </Heading>
          <S.CountPill>{countLabel}</S.CountPill>
        </Flex.Row>
      </Flex.Row>
      {isEmpty ? (
        <Text
          margin="0"
          style={{
            ...theme.typography.body2,
            color: theme.palette.grey[500],
          }}
        >
          {emptyText}
        </Text>
      ) : (
        <S.ScrollList role="list">{children}</S.ScrollList>
      )}
    </S.SectionBlock>
  );
}

function MileageSelectableRow({
  item,
  selected,
  disabled,
  onToggle,
}: {
  item: MileageItem;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  return (
    <S.SelectRow
      $disabled={disabled}
      $selected={selected}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <Flex.Row align="center" gap="0.75rem" width="100%" style={{ minWidth: 0 }}>
        <Checkbox
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
          size="small"
          sx={{ padding: '4px', flexShrink: 0 }}
          inputProps={{ 'aria-label': `${item.item} 선택` }}
        />
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <S.CategoryTag>{item.category}</S.CategoryTag>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {item.item}
            </Text>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[500],
              }}
            >
              {item.semester}
            </Text>
          </Flex.Row>
          {item.additional_info?.trim() ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                lineHeight: 1.45,
              }}
            >
              {item.additional_info}
            </Text>
          ) : null}
          {disabled ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.caption,
                color: palette.pink500,
              }}
            >
              포트폴리오에 연결된 항목만 선택할 수 있습니다.
            </Text>
          ) : null}
        </Flex.Column>
      </Flex.Row>
    </S.SelectRow>
  );
}

function RepoSelectableRow({
  repo,
  selected,
  onToggle,
}: {
  repo: RepoItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const rowTitle =
    repo.custom_title !== null &&
    repo.custom_title !== undefined &&
    repo.custom_title.trim() !== ''
      ? repo.custom_title.trim()
      : repo.name;
  return (
    <S.SelectRow $selected={selected} style={{ cursor: 'pointer' }}>
      <Flex.Row align="center" gap="0.75rem" width="100%" style={{ minWidth: 0 }}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          size="small"
          sx={{ padding: '4px', flexShrink: 0 }}
          inputProps={{ 'aria-label': `${rowTitle} 선택` }}
        />
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {rowTitle}
            </Text>
          </Flex.Row>
          {repo.description?.trim() ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                lineHeight: 1.45,
              }}
            >
              {repo.description}
            </Text>
          ) : null}
        </Flex.Column>
      </Flex.Row>
    </S.SelectRow>
  );
}

function ActivitySelectableRow({
  activity,
  selected,
  onToggle,
}: {
  activity: ActivityItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const range = formatActivityPeriodRange(
    activity.start_date,
    activity.end_date,
  );
  return (
    <S.SelectRow $selected={selected} style={{ cursor: 'pointer' }}>
      <Flex.Row align="center" gap="0.75rem" width="100%" style={{ minWidth: 0 }}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          size="small"
          sx={{ padding: '4px', flexShrink: 0 }}
          inputProps={{ 'aria-label': `${activity.title} 선택` }}
        />
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem" wrap="wrap">
            <S.CategoryTag>{activity.category}</S.CategoryTag>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {activity.title}
            </Text>
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[500],
              }}
            >
              {range}
            </Text>
          </Flex.Row>
          {activity.description?.trim() ? (
            <Text
              margin="0"
              style={{
                ...theme.typography.body2,
                color: theme.palette.grey[600],
                lineHeight: 1.45,
              }}
            >
              {activity.description}
            </Text>
          ) : null}
          {activity.url?.trim() ? (
            <S.ActivityUrlLink
              href={activity.url.trim()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {activity.url.trim()}
            </S.ActivityUrlLink>
          ) : null}
          {activity.tags && activity.tags.length > 0 ? (
            <Flex.Row gap="0.375rem" wrap="wrap" style={{ width: '100%' }}>
              {activity.tags.map(tag => (
                <S.TagChip key={`${activity.id}-${tag}`}>{tag}</S.TagChip>
              ))}
            </Flex.Row>
          ) : null}
        </Flex.Column>
      </Flex.Row>
    </S.SelectRow>
  );
}
