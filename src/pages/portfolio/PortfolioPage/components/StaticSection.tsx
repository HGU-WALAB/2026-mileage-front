import { Flex, Heading, Text } from '@/components';
import { boxShadow } from '@/styles/common';
import { styled, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

import {
  PORTFOLIO_SECTION_ELEMENT_ID,
  type DraggableSectionKey,
} from '../../constants/constants';
import SectionPromptQualityFooter from './SectionPromptQualityFooter';

interface StaticSectionProps {
  /** 스크롤 앵커 (미리보기에서 품질 카드와 동일 id) */
  anchorSectionKey?: DraggableSectionKey;
  title: string;
  /** 섹션 타이틀 옆 회색 가이드 텍스트 (미리보기에서도 사용 가능) */
  subtitle?: string;
  icon?: ReactNode;
  promptFooter?: { percent: number; hint: string };
  children: ReactNode;
}

const StaticSection = ({
  anchorSectionKey,
  title,
  subtitle,
  icon,
  promptFooter,
  children,
}: StaticSectionProps) => {
  const theme = useTheme();

  return (
    <S.Section
      id={
        anchorSectionKey != null
          ? PORTFOLIO_SECTION_ELEMENT_ID[anchorSectionKey]
          : undefined
      }
    >
      <S.Header align="center" gap="0.5rem">
        {icon != null && <S.IconWrap>{icon}</S.IconWrap>}
        <Flex.Column gap="0.125rem">
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
          {subtitle != null && subtitle.trim() !== '' && (
            <S.Subtitle>{subtitle}</S.Subtitle>
          )}
        </Flex.Column>
      </S.Header>
      <S.Content>{children}</S.Content>
      {promptFooter != null && (
        <SectionPromptQualityFooter
          hint={promptFooter.hint}
          percent={promptFooter.percent}
        />
      )}
    </S.Section>
  );
};

export default StaticSection;

const S = {
  Section: styled('section')`
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 0.75rem;
    padding: 1.25rem;
    width: 100%;
    ${boxShadow};
  `,
  Header: styled(Flex.Row)`
    margin-bottom: 1rem;
  `,
  IconWrap: styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  Content: styled('div')`
    width: 100%;
  `,
  Subtitle: styled(Text)`
    margin: 0;
    padding: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.palette.grey[600]};
  `,
};

