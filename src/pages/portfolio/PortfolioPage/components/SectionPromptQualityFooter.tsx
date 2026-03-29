import { Text } from '@/components';
import { palette } from '@/styles/palette';
import { styled } from '@mui/material';

export type SectionPromptQualityFooterVariant = 'onPaper' | 'onDark';

export interface SectionPromptQualityFooterProps {
  hint: string;
  percent: number;
  variant?: SectionPromptQualityFooterVariant;
  /** 트랙(미채움) 배경. 기본은 `palette.blue300` (`onPaper`일 때만 적용) */
  trackColor?: string;
}

/**
 * 섹션 카드 하단: 왼쪽 만점 기준 안내, 오른쪽 정렬 프로그레스 바 + %
 */
const SectionPromptQualityFooter = ({
  hint,
  percent,
  variant = 'onPaper',
  trackColor,
}: SectionPromptQualityFooterProps) => {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <S.Grid $variant={variant}>
      <S.Hint $variant={variant}>{hint}</S.Hint>
      <S.ProgressAlign>
        <S.BarRow>
          <S.Track $variant={variant} $trackColor={trackColor}>
            <S.Fill $variant={variant} style={{ width: `${safe}%` }} />
          </S.Track>
          <S.Pct $variant={variant}>{safe}%</S.Pct>
        </S.BarRow>
      </S.ProgressAlign>
    </S.Grid>
  );
};

export default SectionPromptQualityFooter;

const S = {
  Grid: styled('div')<{ $variant: SectionPromptQualityFooterVariant }>`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem 1rem;
    align-items: end;
    width: 100%;
    margin-top: 1rem;
    padding-top: 0.875rem;
    border-top: 1px solid
      ${({ $variant }) =>
        $variant === 'onDark'
          ? 'rgba(255, 255, 255, 0.2)'
          : palette.grey200};
  `,
  Hint: styled(Text)<{ $variant: SectionPromptQualityFooterVariant }>`
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: ${({ $variant }) =>
      $variant === 'onDark' ? 'rgba(255, 255, 255, 0.85)' : palette.grey600};
    min-width: 0;
  `,
  ProgressAlign: styled('div')`
    justify-self: end;
    min-width: 0;
  `,
  BarRow: styled('div')`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: nowrap;
  `,
  Track: styled('div')<{
    $variant: SectionPromptQualityFooterVariant;
    $trackColor?: string;
  }>`
    width: clamp(5.5rem, 28vw, 7.5rem);
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: ${({ $variant, $trackColor }) =>
      $variant === 'onDark'
        ? 'rgba(255, 255, 255, 0.22)'
        : $trackColor ?? palette.blue300};
    flex-shrink: 0;
  `,
  Fill: styled('div')<{ $variant: SectionPromptQualityFooterVariant }>`
    height: 100%;
    border-radius: 3px;
    background-color: ${({ $variant }) =>
      $variant === 'onDark' ? palette.white : palette.blue500};
    transition: width 0.2s ease;
  `,
  Pct: styled('span')<{ $variant: SectionPromptQualityFooterVariant }>`
    font-size: 0.8125rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    min-width: 2.25rem;
    text-align: right;
    color: ${({ $variant }) =>
      $variant === 'onDark' ? palette.white : palette.blue700};
    flex-shrink: 0;
  `,
};
