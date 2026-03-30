import { Flex } from '@/components';
import { boxShadow } from '@/styles/common';
import { palette } from '@/styles/palette';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CvGeneratePageS = {
  Card: styled('section')`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    padding: 1.25rem 1.25rem 1.5rem;
    border-radius: 0.75rem;
    background-color: ${palette.white};
    ${boxShadow};
    box-sizing: border-box;
  `,
  StepperRow: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.125rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    flex-wrap: nowrap;
    @media (min-width: 901px) {
      gap: 0.25rem;
    }
  `,
  StepItemColumn: styled(Flex.Column)`
    align-items: center;
    gap: 0.35rem;
    flex: 1 1 0;
    min-width: 0;
    @media (min-width: 901px) {
      flex: 0 0 auto;
      width: 4.75rem;
    }
  `,
  StepCircle: styled('span', {
    shouldForwardProp: p => p !== '$active' && p !== '$muted' && p !== '$completed',
  })<{ $active?: boolean; $muted?: boolean; $completed?: boolean }>(
    ({ theme, $active, $muted, $completed }) => {
      const filled = $active || $completed;
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        ...theme.typography.body2,
        fontSize: '0.8125rem',
        fontWeight: 700,
        flexShrink: 0,
        boxSizing: 'border-box',
        border: `2px solid ${filled ? palette.blue500 : palette.grey300}`,
        backgroundColor: filled ? palette.blue500 : palette.white,
        color: filled ? palette.white : theme.palette.grey[600],
        ...($muted && !filled ? { opacity: 0.85 } : {}),
        '@media (max-width: 900px)': {
          width: '1.625rem',
          height: '1.625rem',
          fontSize: '0.6875rem',
        },
      };
    },
  ),
  StepLabel: styled('span', {
    shouldForwardProp: p => p !== '$active' && p !== '$completed',
  })<{ $active?: boolean; $completed?: boolean }>(({ theme, $active, $completed }) => ({
    ...theme.typography.caption,
    fontWeight: $active ? 700 : $completed ? 600 : 500,
    color: $active || $completed ? palette.blue600 : theme.palette.text.secondary,
    textAlign: 'center',
    lineHeight: 1.25,
    wordBreak: 'keep-all',
    width: '100%',
    maxWidth: '100%',
    '@media (max-width: 900px)': {
      fontSize: '0.625rem',
      lineHeight: 1.2,
    },
  })),
  StepConnector: styled('div', {
    shouldForwardProp: p => p !== '$completed',
  })<{ $completed?: boolean }>`
    flex: 1 1 0;
    min-width: 0;
    height: 2px;
    margin-top: 0.8125rem;
    align-self: flex-start;
    background-color: ${({ $completed }) =>
      $completed ? palette.blue500 : palette.grey200};
    transition: background-color 0.2s ease;
    @media (min-width: 901px) {
      min-width: 0.5rem;
      margin-top: 1rem;
    }
  `,
  HighlightSection: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding: 1rem 1.1rem;
    border-radius: 0.75rem;
    border: 1px solid ${palette.blue300};
    background-color: ${palette.blue300};
    box-sizing: border-box;
  `,
  ProfileInner: styled(Flex.Row)`
    width: 100%;
  `,
  AvatarBox: styled('div')`
    width: 5rem;
    height: 5rem;
    border-radius: 0.5rem;
    background-color: ${palette.grey200};
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
  `,
  AvatarImg: styled('img')`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  ProfileLinkList: styled('ul')`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
  `,
  ProfileLinkAnchor: styled('a')`
    color: ${palette.blue500};
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    word-break: break-all;
    &:hover {
      text-decoration: underline;
    }
  `,
  SectionBlock: styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    padding: 1rem 1.1rem;
    border-radius: 0.75rem;
    border: 1px solid ${palette.grey200};
    background-color: ${palette.white};
    box-sizing: border-box;
  `,
  SectionBulkBar: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
  `,
  SectionBulkButton: styled('button')`
    margin: 0;
    padding: 0.25rem 0.55rem;
    border-radius: 0.375rem;
    border: 1px solid ${palette.blue400};
    background-color: ${palette.white};
    color: ${palette.blue500};
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    line-height: 1.25;
    text-transform: none;
    font-family: inherit;
    box-sizing: border-box;
    &:hover:not(:disabled) {
      background-color: ${palette.blue300};
      border-color: ${palette.blue500};
      color: ${palette.blue600};
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
  ScrollList: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 17.5rem;
    overflow-y: auto;
    width: 100%;
    min-width: 0;
    padding-right: 0.25rem;
  `,
  /** 체크박스는 1행만 차지하고, 첫 텍스트 줄 높이 기준 세로 가운데 */
  SelectRowInner: styled('div')`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.75rem;
    row-gap: 0.25rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  `,
  SelectRowCheckCell: styled('div')`
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    display: flex;
    align-items: center;
  `,
  SelectRowFirstLine: styled('div')`
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  `,
  SelectRowBody: styled('div')`
    grid-column: 2;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  `,
  SelectRow: styled('div', {
    shouldForwardProp: p => p !== '$disabled' && p !== '$selected',
  })<{ $disabled?: boolean; $selected?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: 0.65rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid
      ${({ $selected }) => ($selected ? palette.blue400 : palette.grey200)};
    background-color: ${({ $selected }) =>
      $selected ? palette.blue300 : palette.grey100};
    opacity: ${({ $disabled }) => ($disabled ? 0.75 : 1)};
    box-sizing: border-box;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
  `,
  CategoryTag: styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.45rem',
    borderRadius: '0.375rem',
    ...theme.typography.caption,
    fontWeight: 600,
    color: palette.blue600,
    backgroundColor: palette.blue300,
    flexShrink: 0,
  })),
  ActivityUrlLink: styled('a')`
    display: inline-block;
    max-width: 100%;
    font-size: 0.8125rem;
    color: ${palette.blue500};
    text-decoration: underline;
    word-break: break-all;
    &:hover {
      color: ${palette.blue600};
    }
  `,
  TagChip: styled('span')`
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    background-color: ${palette.grey100};
    color: ${palette.grey600};
    border: 1px solid ${palette.grey200};
    font-size: 0.75rem;
    font-weight: 500;
  `,
  CountPill: styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    boxSizing: 'border-box',
    border: `1px solid ${palette.blue500}`,
    ...theme.typography.caption,
    fontWeight: 600,
    color: palette.blue500,
    backgroundColor: palette.white,
    flexShrink: 0,
  })),
  JdFieldRow: styled(Flex.Row)`
    flex-wrap: wrap;
    @media (min-width: 901px) {
      flex-wrap: nowrap;
    }
  `,
  FieldLeadIcon: styled('span')`
    display: flex;
    flex-shrink: 0;
    width: 2rem;
    justify-content: center;
    padding-top: 0.35rem;
    box-sizing: border-box;
  `,
  BackButton: styled(MuiButton)(({ theme }) => ({
    minWidth: '7.5rem',
    padding: '0.5rem 1rem 0.5rem 0.75rem',
    borderColor: palette.blue400,
    color: palette.blue400,
    borderRadius: '0.75rem',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.2,
    '&:hover': {
      borderColor: palette.blue600,
      color: palette.blue600,
      backgroundColor: 'rgba(91, 140, 241, 0.08)',
    },
  })),
};
