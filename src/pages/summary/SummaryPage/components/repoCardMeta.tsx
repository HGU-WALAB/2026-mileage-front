import { Flex, Text } from '@/components';
import { palette } from '@/styles/palette';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import HistoryIcon from '@mui/icons-material/History';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { useMemo } from 'react';
import { styled } from '@mui/material';

import type { PortfolioRepositoryLanguage } from '../../apis/repositories';

export function formatRepoStat(n: number | undefined): string | null {
  if (n === undefined || n === null) return null;
  return n.toLocaleString('ko-KR');
}

const LANG_BAR_COLORS = [
  palette.blue500,
  palette.purple500,
  palette.green500,
  palette.pink500,
  palette.blue600,
  palette.yellow600,
] as const;

function colorForLanguageName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h + name.charCodeAt(i) * (i + 1)) % 100000;
  }
  return LANG_BAR_COLORS[h % LANG_BAR_COLORS.length];
}

type LangSegment = { name: string; pct: number; color: string };

function buildLanguageSegments(
  breakdown: PortfolioRepositoryLanguage[],
): LangSegment[] {
  const valid = breakdown.filter(l => (l.name?.trim() ?? '') !== '');
  if (valid.length === 0) return [];

  const weights = valid.map(l => Math.max(0, l.percentage ?? 0));
  const sum = weights.reduce((a, b) => a + b, 0);

  if (sum <= 0) {
    const eq = 100 / valid.length;
    return valid.map(l => ({
      name: l.name.trim(),
      pct: eq,
      color: colorForLanguageName(l.name),
    }));
  }

  return valid.map(l => ({
    name: l.name.trim(),
    pct: ((l.percentage ?? 0) / sum) * 100,
    color: colorForLanguageName(l.name),
  }));
}

const SBar = {
  LangBarTrack: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    height: 8px;
    border-radius: 999px;
    overflow: hidden;
    background-color: ${palette.grey200};
  `,
  LangBarSeg: styled('span')<{ $color: string }>`
    height: 100%;
    min-height: 6px;
    background-color: ${({ $color }) => $color};
    opacity: 0.9;
  `,
  LegendDot: styled('span')<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
    background-color: ${({ $color }) => $color};
  `,
};

export function RepoLanguageBar({
  breakdown,
}: {
  breakdown: PortfolioRepositoryLanguage[];
}) {
  const segments = useMemo(
    () => buildLanguageSegments(breakdown),
    [breakdown],
  );

  const ordered = useMemo(
    () => [...segments].sort((a, b) => b.pct - a.pct),
    [segments],
  );

  if (segments.length === 0) return null;

  return (
    <Flex.Column gap="0.5rem" style={{ width: '100%' }}>
      <SBar.LangBarTrack aria-hidden>
        {segments.map((s, idx) => (
          <SBar.LangBarSeg
            key={`${s.name}-${idx}`}
            $color={s.color}
            style={{
              flex: `${Math.max(s.pct, 0.4)} 1 0`,
              minWidth: '3px',
            }}
          />
        ))}
      </SBar.LangBarTrack>
      <Flex.Row
        gap="0.5rem"
        wrap="wrap"
        style={{
          width: '100%',
          justifyContent: 'flex-start',
        }}
      >
        {ordered.map(s => (
          <Flex.Row key={s.name} gap="0.35rem" align="center">
            <SBar.LegendDot $color={s.color} aria-hidden />
            <Text
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: palette.grey600,
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {s.name}{' '}
              <span style={{ color: palette.grey500, fontWeight: 400 }}>
                {Math.round(s.pct)}%
              </span>
            </Text>
          </Flex.Row>
        ))}
      </Flex.Row>
    </Flex.Column>
  );
}

const SPill = {
  StatPill: styled('span')`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 0.28rem;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    border: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
    box-sizing: border-box;
    line-height: 1.2;
  `,
  StatPillValue: styled('span')`
    font-size: 0.75rem;
    font-weight: 700;
    color: ${palette.grey600};
  `,
  StatPillLabel: styled('span')`
    font-size: 0.6875rem;
    font-weight: 500;
    color: ${palette.grey500};
  `,
};

export interface RepoStatCounts {
  commit_count?: number;
  stargazers_count?: number;
  forks_count?: number;
}

/** 날짜 행 오른쪽에 붙는 커밋·스타·포크 pill */
export function RepoStatPills({
  stats,
  isMobile,
}: {
  stats: RepoStatCounts;
  isMobile: boolean;
}) {
  const c = formatRepoStat(stats.commit_count);
  const s = formatRepoStat(stats.stargazers_count);
  const f = formatRepoStat(stats.forks_count);
  if (c == null && s == null && f == null) return null;

  return (
    <Flex.Row
      gap="0.35rem"
      wrap="wrap"
      align="center"
      style={{
        flex: isMobile ? '1 1 100%' : '0 1 auto',
        justifyContent: isMobile ? 'flex-start' : 'flex-end',
      }}
    >
      {c != null && (
        <SPill.StatPill>
          <HistoryIcon sx={{ fontSize: 14, color: palette.grey500 }} />
          <SPill.StatPillValue>{c}</SPill.StatPillValue>
          <SPill.StatPillLabel>커밋</SPill.StatPillLabel>
        </SPill.StatPill>
      )}
      {s != null && (
        <SPill.StatPill>
          <StarOutlineIcon sx={{ fontSize: 14, color: palette.grey500 }} />
          <SPill.StatPillValue>{s}</SPill.StatPillValue>
          <SPill.StatPillLabel>스타</SPill.StatPillLabel>
        </SPill.StatPill>
      )}
      {f != null && (
        <SPill.StatPill>
          <AccountTreeOutlinedIcon
            sx={{ fontSize: 14, color: palette.grey500 }}
          />
          <SPill.StatPillValue>{f}</SPill.StatPillValue>
          <SPill.StatPillLabel>포크</SPill.StatPillLabel>
        </SPill.StatPill>
      )}
    </Flex.Row>
  );
}
