import { Flex, Heading, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { LinearProgress, styled, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

import PortfolioSectionSkeleton from './PortfolioSectionSkeleton';

import {
  PORTFOLIO_SECTION_ELEMENT_ID,
  type DraggableSectionKey,
} from '../../constants/constants';

import SectionPromptQualityFooter from './SectionPromptQualityFooter';

interface DraggableSectionProps {
  sectionId: DraggableSectionKey;
  title: string;
  /** 섹션 타이틀 옆에 표시할 회색 가이드 텍스트 */
  subtitle?: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  /** true면 좁은 화면에서도 헤더 우측(작은 버튼)이 제목과 한 줄에 유지 */
  compactHeaderRight?: boolean;
  /** 데이터 로딩 중 여부 — 카드 상단 LinearProgress + 스켈레톤 표시 */
  isLoading?: boolean;
  /** 포트폴리오 프롬프트 품질 진행도 (카드 하단 오른쪽 정렬 바) */
  promptFooter?: { percent: number; hint: string };
  children: ReactNode;
}

const DraggableSection = ({
  sectionId,
  title,
  subtitle,
  icon,
  headerRight,
  compactHeaderRight = false,
  isLoading = false,
  promptFooter,
  children,
}: DraggableSectionProps) => {
  const theme = useTheme();

  return (
    <S.Section id={PORTFOLIO_SECTION_ELEMENT_ID[sectionId]}>
      {isLoading ? <S.LoadingBar color="primary" /> : null}
      <S.Header $hasRight={headerRight != null}>
        <Flex.Column gap="0.25rem" style={{ flex: 1, minWidth: 0 }}>
          <Flex.Row align="center" gap="0.5rem">
            {icon != null && <S.IconWrap>{icon}</S.IconWrap>}
            <Heading
              as="h3"
              style={{
                fontWeight: 700,
                margin: 0,
                fontSize: '1.125rem',
                lineHeight: '1.5',
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Heading>
          </Flex.Row>
          {subtitle != null && subtitle.trim() !== '' && (
            <S.Subtitle>{subtitle}</S.Subtitle>
          )}
        </Flex.Column>
        {headerRight != null && (
          <S.HeaderRight $compact={compactHeaderRight}>{headerRight}</S.HeaderRight>
        )}
      </S.Header>
      <S.Content>{isLoading ? <PortfolioSectionSkeleton /> : children}</S.Content>
      {promptFooter != null && (
        <SectionPromptQualityFooter
          hint={promptFooter.hint}
          percent={promptFooter.percent}
        />
      )}
    </S.Section>
  );
};

export default DraggableSection;

const S = {
  Section: styled('section')`
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 0.75rem;
    padding: 1.25rem;
    width: 100%;
    ${boxShadow};
    position: relative;
    overflow: hidden;
  `,
  LoadingBar: styled(LinearProgress)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 0.75rem 0.75rem 0 0;
  `,
  Header: styled('div')<{ $hasRight?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${({ $hasRight }) =>
      $hasRight ? 'space-between' : 'flex-start'};
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  `,
  IconWrap: styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  HeaderRight: styled('div')<{ $compact?: boolean }>`
    flex-shrink: 0;
    @media (max-width: 500px) {
      width: ${p => (p.$compact ? 'auto' : '100%')};
    }
  `,
  Subtitle: styled(Text)`
    margin: 0;
    padding: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.palette.grey[600]};
  `,
  Content: styled('div')`
    width: 100%;
  `,
};
