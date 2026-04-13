import { Flex, Text } from '@/components';
import { palette } from '@/styles/palette';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { styled } from '@mui/material';
import type { ReactNode } from 'react';

import type { PortfolioPromptQualityCardKey } from '../../constants/constants';
import {
  PROMPT_QUALITY_SECTION_HINTS,
  type PortfolioPromptProgress,
} from '../utils/portfolioPromptProgress';

interface PortfolioPromptQualityDashboardProps {
  progress: PortfolioPromptProgress;
  /** 미니 카드 클릭 시 해당 포트폴리오 섹션으로 스크롤 */
  onSectionClick?: (key: PortfolioPromptQualityCardKey) => void;
}

const PortfolioPromptQualityDashboard = ({
  progress,
  onSectionClick,
}: PortfolioPromptQualityDashboardProps) => {
  return (
    <S.Root>
      <S.HeaderRow>
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <S.Title>프롬프트 품질 점수</S.Title>
          <S.Guide>
            진행도를 채우면 더 정교하고 퀄리티 높은 포트폴리오 프롬프트를 받을 수
            있어요!
          </S.Guide>
        </Flex.Column>
        <S.OverallBlock>
          <S.OverallPct>{progress.overall}%</S.OverallPct>
          <S.OverallLabel>전체 진행도</S.OverallLabel>
        </S.OverallBlock>
      </S.HeaderRow>

      <S.GridScroll>
        <S.Grid>
        <MiniCard
          sectionKey="intro"
          onSectionClick={onSectionClick}
          icon={<PersonOutlineIcon sx={{ fontSize: 18, color: palette.blue600 }} />}
          title="자기소개"
          hint={PROMPT_QUALITY_SECTION_HINTS.intro}
          percent={progress.intro}
        />
        <MiniCard
          sectionKey="tech"
          onSectionClick={onSectionClick}
          icon={<CodeIcon sx={{ fontSize: 18, color: palette.blue600 }} />}
          title="기술 스택"
          hint={PROMPT_QUALITY_SECTION_HINTS.tech}
          percent={progress.tech}
        />
        <MiniCard
          sectionKey="repo"
          onSectionClick={onSectionClick}
          icon={<FolderIcon sx={{ fontSize: 18, color: palette.blue600 }} />}
          title="레포지토리"
          hint={PROMPT_QUALITY_SECTION_HINTS.repo}
          percent={progress.repo}
        />
        <MiniCard
          sectionKey="mileage"
          onSectionClick={onSectionClick}
          icon={<MenuBookIcon sx={{ fontSize: 18, color: palette.blue600 }} />}
          title="마일리지"
          hint={PROMPT_QUALITY_SECTION_HINTS.mileage}
          percent={progress.mileage}
        />
        <MiniCard
          sectionKey="activities"
          onSectionClick={onSectionClick}
          icon={<EmojiEventsIcon sx={{ fontSize: 18, color: palette.blue600 }} />}
          title="활동"
          hint={PROMPT_QUALITY_SECTION_HINTS.activities}
          percent={progress.activities}
        />
        </S.Grid>
      </S.GridScroll>
    </S.Root>
  );
};

export default PortfolioPromptQualityDashboard;

function MiniCard({
  sectionKey,
  onSectionClick,
  icon,
  title,
  hint,
  percent,
}: {
  sectionKey: PortfolioPromptQualityCardKey;
  onSectionClick?: (key: PortfolioPromptQualityCardKey) => void;
  icon: ReactNode;
  title: string;
  hint: string;
  percent: number;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  const body = (
    <>
      <S.CardTop>
        <S.IconWrap>{icon}</S.IconWrap>
        <S.CardTitle>{title}</S.CardTitle>
      </S.CardTop>
      <S.CardHint>{hint}</S.CardHint>
      <S.CardProgressRow>
        <S.CardBarTrack>
          <S.CardBarFill style={{ width: `${safe}%` }} />
        </S.CardBarTrack>
        <S.CardPct>{safe}%</S.CardPct>
      </S.CardProgressRow>
    </>
  );
  if (onSectionClick) {
    return (
      <S.CardButton
        type="button"
        onClick={() => onSectionClick(sectionKey)}
      >
        {body}
      </S.CardButton>
    );
  }
  return <S.Card>{body}</S.Card>;
}

const S = {
  Root: styled('section')`
    width: 100%;
    border-radius: 0.75rem;
    padding: 1rem 1rem 1rem;
    background-color: ${palette.blue500};
    color: ${palette.white};
    box-sizing: border-box;
  `,
  HeaderRow: styled(Flex.Row)`
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.22);
    flex-wrap: wrap;
  `,
  Title: styled('h2')`
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.01em;
    color: ${palette.white};
  `,
  Guide: styled(Text)`
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.92);
    max-width: 36rem;
  `,
  OverallBlock: styled('div')`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
  `,
  OverallPct: styled('span')`
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.1;
    color: ${palette.white};
  `,
  OverallLabel: styled('span')`
    font-size: 0.6875rem;
    font-weight: 500;
    margin-top: 0.125rem;
    color: rgba(255, 255, 255, 0.88);
  `,
  GridScroll: styled('div')`
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    margin: 0 -0.125rem;
    padding: 0.125rem 0.125rem 0.25rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
  `,
  Grid: styled('div')`
    display: grid;
    grid-template-columns: repeat(5, minmax(10rem, 1fr));
    gap: 0.625rem;
    width: 100%;
  `,
  Card: styled('div')`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    padding: 0.7rem 0.65rem 0.65rem;
    border-radius: 0.5rem;
    background-color: ${palette.white};
    border: 1px solid ${palette.grey200};
    box-sizing: border-box;
  `,
  CardButton: styled('button')`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    width: 100%;
    padding: 0.7rem 0.65rem 0.65rem;
    border-radius: 0.5rem;
    background-color: ${palette.white};
    border: 1px solid ${palette.grey200};
    box-sizing: border-box;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: box-shadow 0.15s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &:focus-visible {
      outline: 2px solid ${palette.blue500};
      outline-offset: 2px;
    }
  `,
  CardTop: styled(Flex.Row)`
    align-items: flex-start;
    gap: 0.45rem;
    margin-bottom: 0.45rem;
    min-width: 0;
  `,
  IconWrap: styled('span')`
    display: flex;
    flex-shrink: 0;
    margin-top: 0.1rem;
  `,
  CardTitle: styled('span')`
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1.35;
    color: ${palette.nearBlack};
    min-width: 0;
    word-break: keep-all;
    overflow-wrap: break-word;
  `,
  CardHint: styled(Text)`
    flex: 1 1 auto;
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.5;
    color: ${palette.grey600};
    min-width: 0;
    word-break: keep-all;
    overflow-wrap: break-word;
  `,
  CardProgressRow: styled('div')`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-top: 0.55rem;
    padding-top: 0.45rem;
    border-top: 1px solid ${palette.grey200};
    flex-shrink: 0;
    width: 100%;
    min-width: 0;
  `,
  CardBarTrack: styled('div')`
    flex: 1 1 0;
    min-width: 0;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: ${palette.blue300};
  `,
  CardBarFill: styled('div')`
    height: 100%;
    border-radius: 3px;
    background-color: ${palette.blue500};
    transition: width 0.2s ease;
  `,
  CardPct: styled('span')`
    font-size: 0.75rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: ${palette.blue700};
    min-width: 2rem;
    text-align: right;
    flex-shrink: 0;
  `,
};
