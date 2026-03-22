import { Button, Flex, Text } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import {
  Dialog,
  DialogActions,
  DialogContent,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';

import type { TechStackItem } from '../../apis/portfolio';
import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import {
  clampTechLevel,
  getLevelTagPair,
  getLevelTierLegend,
  getTechLevelBand,
  getTechLevelBandLabel,
} from '../../utils/techStackLevel';
import { useSummaryContext } from '../context/SummaryContext';

interface TechStackSectionContentProps {
  readOnly?: boolean;
}

export type TechStackSectionContentHandle = {
  openAddDialog: () => void;
};

type GroupedEntry = { item: TechStackItem; flatIndex: number };

function groupByDomainWithIndex(
  items: TechStackItem[],
): [string, GroupedEntry[]][] {
  const map = new Map<string, GroupedEntry[]>();
  items.forEach((item, flatIndex) => {
    const d = item.domain.trim() || '기타';
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push({ item, flatIndex });
  });
  for (const [, arr] of map) {
    arr.sort((a, b) => a.item.name.localeCompare(b.item.name, 'ko'));
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ko'));
}

function NotionTag({
  item,
  flatIndex,
  readOnly,
  onRemove,
}: {
  item: TechStackItem;
  flatIndex: number;
  readOnly: boolean;
  onRemove: (index: number) => void;
}) {
  const pair = getLevelTagPair(item.level);
  const lv = clampTechLevel(item.level);

  return (
    <S.NotionTag
      $readOnly={readOnly}
      style={{
        backgroundColor: pair.bg,
        color: pair.fg,
        border: `1px solid ${pair.border}`,
      }}
      title={`숙련도 ${lv}%`}
    >
      <S.TagLabel>{item.name}</S.TagLabel>
      {!readOnly && (
        <S.TagRemove
          type="button"
          $fg={pair.fg}
          onClick={() => onRemove(flatIndex)}
          aria-label={`${item.name} 삭제`}
        >
          <CloseIcon sx={{ fontSize: 13 }} />
        </S.TagRemove>
      )}
    </S.NotionTag>
  );
}

const TechStackSectionContent = forwardRef<
  TechStackSectionContentHandle,
  TechStackSectionContentProps
>(function TechStackSectionContent({ readOnly = false }, ref) {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { techStackItems, setTechStackItems } = useSummaryContext();

  const [addOpen, setAddOpen] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [levelInput, setLevelInput] = useState(50);

  const groupedRows = useMemo(
    () => groupByDomainWithIndex(techStackItems),
    [techStackItems],
  );

  useEffect(() => {
    if (!addOpen) {
      setDomainInput('');
      setNameInput('');
      setLevelInput(50);
    }
  }, [addOpen]);

  const handleRemove = useCallback(
    (flatIndex: number) => {
      setTechStackItems(prev => prev.filter((_, i) => i !== flatIndex));
    },
    [setTechStackItems],
  );

  const handleAddSubmit = useCallback(() => {
    const name = nameInput.trim();
    if (name === '') return;
    const domain = domainInput.trim() || '기타';
    const level = clampTechLevel(levelInput);
    setTechStackItems(prev => [...prev, { name, domain, level }]);
    setAddOpen(false);
  }, [domainInput, nameInput, levelInput, setTechStackItems]);

  const levelBand = getTechLevelBand(levelInput);
  const previewTagPair = getLevelTagPair(levelInput);

  const levelLegend = useMemo(() => getLevelTierLegend(), []);

  useImperativeHandle(
    ref,
    () => ({
      openAddDialog: () => {
        if (!readOnly) setAddOpen(true);
      },
    }),
    [readOnly],
  );

  const headerIconColor = theme.palette.grey[500];
  const headerLabelColor = theme.palette.grey[600];

  const tableBlock = (
    <S.Table role="table" aria-label="기술 스택">
      <S.HeadRow role="row">
        <S.HeadCell $domain>
          <S.HeadInner>
            <TextFieldsOutlinedIcon
              sx={{ fontSize: 17, color: headerIconColor, flexShrink: 0 }}
            />
            <S.HeadLabel style={{ color: headerLabelColor }}>도메인</S.HeadLabel>
          </S.HeadInner>
        </S.HeadCell>
        <S.HeadCell $grow>
          <S.HeadInnerWide>
            <S.HeadLeft>
              <FormatListBulletedIcon
                sx={{ fontSize: 17, color: headerIconColor, flexShrink: 0 }}
              />
              <S.HeadLabel style={{ color: headerLabelColor }}>
                다중 선택
              </S.HeadLabel>
            </S.HeadLeft>
            {!readOnly && (
              <S.AddCircleBtn
                type="button"
                onClick={() => setAddOpen(true)}
                aria-label="항목 추가"
              >
                <AddIcon sx={{ fontSize: 20, color: palette.blue500 }} />
              </S.AddCircleBtn>
            )}
          </S.HeadInnerWide>
        </S.HeadCell>
      </S.HeadRow>
      {groupedRows.map(([domain, entries]) => (
        <S.BodyRow key={domain} role="row">
          <S.BodyCell $domain>
            <S.DomainText>{domain}</S.DomainText>
          </S.BodyCell>
          <S.BodyCell $grow>
            <S.TagCloud>
              {entries.map(({ item, flatIndex }) => (
                <NotionTag
                  key={`${domain}-${flatIndex}`}
                  item={item}
                  flatIndex={flatIndex}
                  readOnly={readOnly}
                  onRemove={handleRemove}
                />
              ))}
            </S.TagCloud>
          </S.BodyCell>
        </S.BodyRow>
      ))}
    </S.Table>
  );

  return (
    <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
      <S.LevelLegend aria-label="숙련도 구간별 색상">
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: 600,
            color: theme.palette.grey[700],
            margin: 0,
          }}
        >
          숙련도 색상 기준
        </Text>
        <S.LegendGrid>
          {levelLegend.map(row => (
            <S.LegendItem key={row.rangeLabel}>
              <S.LegendDot
                style={{
                  backgroundColor: row.bg,
                  borderColor: row.border,
                }}
              />
              <S.LegendRange>{row.rangeLabel}</S.LegendRange>
            </S.LegendItem>
          ))}
        </S.LegendGrid>
      </S.LevelLegend>

      {techStackItems.length === 0 ? (
        <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
          {!readOnly && !isMobile && (
            <Flex.Row justify="flex-end" style={{ width: '100%' }}>
              <Button
                label="항목 추가"
                variant="outlined"
                color="blue"
                size="medium"
                onClick={() => setAddOpen(true)}
              />
            </Flex.Row>
          )}
          <S.EmptyNote>
            등록된 기술 스택이 없습니다.
            {!readOnly && ' 추가 버튼으로 항목을 등록할 수 있습니다.'}
          </S.EmptyNote>
        </Flex.Column>
      ) : isMobile ? (
        <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
          {groupedRows.map(([domain, entries]) => (
            <S.MobileCard key={domain}>
              <S.MobileHead>
                <TextFieldsOutlinedIcon
                  sx={{ fontSize: 16, color: headerIconColor }}
                />
                <S.HeadLabel style={{ color: headerLabelColor }}>
                  {domain}
                </S.HeadLabel>
              </S.MobileHead>
              <S.TagCloud>
                {entries.map(({ item, flatIndex }) => (
                  <NotionTag
                    key={`${domain}-${flatIndex}`}
                    item={item}
                    flatIndex={flatIndex}
                    readOnly={readOnly}
                    onRemove={handleRemove}
                  />
                ))}
              </S.TagCloud>
            </S.MobileCard>
          ))}
        </Flex.Column>
      ) : (
        tableBlock
      )}

      {!readOnly && (
        <Dialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: '0.75rem' },
          }}
        >
          <DialogContent sx={{ pt: 3 }}>
            <Flex.Column gap="1rem" style={{ width: '100%' }}>
              <Flex.Column gap="0.25rem">
                <Text
                  style={{
                    ...theme.typography.h3,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  기술 항목 추가
                </Text>
                <Text
                  style={{
                    ...theme.typography.body2,
                    color: theme.palette.grey[600],
                    margin: 0,
                  }}
                >
                  도메인·기술 이름·숙련도(0~100)를 입력합니다.
                </Text>
              </Flex.Column>
              <S.FieldGroup>
                <S.FieldLabel>도메인</S.FieldLabel>
                <S.FieldInput
                  value={domainInput}
                  onChange={e => setDomainInput(e.target.value)}
                  placeholder="예: 프론트엔드, 백엔드, 인프라, 협업툴"
                  maxLength={INPUT_MAX_LENGTH.TECH_STACK_DOMAIN}
                  aria-label="도메인"
                />
              </S.FieldGroup>
              <S.FieldGroup>
                <S.FieldLabel>기술 이름</S.FieldLabel>
                <S.FieldInput
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="예: SpringBoot, Swift, React.js, Git, Notion"
                  maxLength={INPUT_MAX_LENGTH.TECH_STACK_NAME}
                  aria-label="기술 이름"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubmit();
                    }
                  }}
                />
              </S.FieldGroup>
              <S.FieldGroup>
                <Flex.Row align="center" justify="space-between" wrap="wrap">
                  <S.FieldLabel style={{ margin: 0 }}>숙련도</S.FieldLabel>
                  <Text
                    style={{
                      ...theme.typography.body1,
                      fontWeight: 700,
                      color: previewTagPair.fg,
                      margin: 0,
                    }}
                  >
                    {clampTechLevel(levelInput)}% ·{' '}
                    {getTechLevelBandLabel(levelBand)}
                  </Text>
                </Flex.Row>
                <S.Range
                  type="range"
                  min={0}
                  max={100}
                  value={levelInput}
                  onChange={e =>
                    setLevelInput(clampTechLevel(Number(e.target.value)))
                  }
                  aria-label="숙련도"
                  style={
                    {
                      '--range-pct': `${clampTechLevel(levelInput)}%`,
                      '--range-fill': previewTagPair.bg,
                      '--range-border': previewTagPair.border,
                      '--range-track': palette.white,
                    } as CSSProperties
                  }
                />
              </S.FieldGroup>
            </Flex.Column>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
            <Button
              label="취소"
              variant="outlined"
              color="blue"
              size="medium"
              onClick={() => setAddOpen(false)}
            />
            <Button
              label="추가"
              variant="contained"
              color="blue"
              size="medium"
              onClick={handleAddSubmit}
            />
          </DialogActions>
        </Dialog>
      )}
    </Flex.Column>
  );
});

export default TechStackSectionContent;

const S = {
  LevelLegend: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 0.875rem;
    border-radius: 8px;
    border: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
    box-sizing: border-box;
  `,
  LegendGrid: styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    align-items: center;
    width: 100%;
  `,
  LegendItem: styled('div')`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  `,
  LegendDot: styled('span')`
    width: 12px;
    height: 12px;
    border-radius: 999px;
    flex-shrink: 0;
    border: 1.5px solid;
    box-sizing: border-box;
  `,
  LegendRange: styled('span')`
    font-size: 11px;
    font-weight: 500;
    color: ${palette.grey600};
    white-space: nowrap;
  `,
  Table: styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid ${palette.grey200};
    border-radius: 6px;
    overflow: hidden;
    background-color: ${palette.white};
  `,
  HeadRow: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    border-bottom: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
  `,
  HeadCell: styled('div')<{ $domain?: boolean; $grow?: boolean }>`
    flex: ${p => (p.$domain ? '0 0 180px' : '1 1 0')};
    min-width: 0;
    padding: 10px 14px;
    border-right: ${p => (p.$domain ? `1px solid ${palette.grey200}` : 'none')};
    display: flex;
    align-items: center;
  `,
  HeadInner: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  `,
  HeadInnerWide: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  `,
  HeadLeft: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-width: 0;
  `,
  HeadLabel: styled('span')`
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
  `,
  AddCircleBtn: styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    &:hover {
      background-color: ${palette.blue300};
    }
  `,
  BodyRow: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    border-bottom: 1px solid ${palette.grey200};
    &:last-child {
      border-bottom: none;
    }
  `,
  BodyCell: styled('div')<{ $domain?: boolean; $grow?: boolean }>`
    flex: ${p => (p.$domain ? '0 0 180px' : '1 1 0')};
    min-width: 0;
    padding: 12px 14px;
    border-right: ${p => (p.$domain ? `1px solid ${palette.grey200}` : 'none')};
    display: flex;
    align-items: flex-start;
  `,
  DomainText: styled('span')`
    font-size: 14px;
    font-weight: 700;
    color: ${palette.nearBlack};
    line-height: 1.4;
  `,
  TagCloud: styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    width: 100%;
  `,
  NotionTag: styled('div')<{ $readOnly?: boolean }>`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    max-width: 100%;
    padding: ${p =>
      p.$readOnly ? '4px 10px' : '4px 6px 4px 10px'};
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    letter-spacing: -0.01em;
    flex-shrink: 0;
    box-sizing: border-box;
  `,
  TagLabel: styled('span')`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  TagRemove: styled('button')<{ $fg: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: pointer;
    color: ${p => p.$fg};
    opacity: 0.65;
    border-radius: 4px;
    flex-shrink: 0;
    line-height: 0;
    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.06);
    }
  `,
  MobileCard: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 14px;
    border: 1px solid ${palette.grey200};
    border-radius: 6px;
    background-color: ${palette.white};
    box-sizing: border-box;
  `,
  MobileHead: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${palette.grey200};
  `,
  EmptyNote: styled('p')`
    margin: 0;
    font-size: 0.875rem;
    color: ${palette.grey500};
    line-height: 1.5;
  `,
  FieldGroup: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `,
  FieldLabel: styled('label')`
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${palette.grey600};
  `,
  FieldInput: styled('input')`
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid ${palette.grey200};
    font-size: 0.9375rem;
    outline: none;
    box-sizing: border-box;
    &:focus {
      border-color: ${palette.blue400};
      box-shadow: 0 0 0 2px ${palette.blue300};
    }
  `,
  /** 네이티브 range 오른쪽 트랙이 검게 보이지 않도록 트랙·썸 직접 스타일 */
  Range: styled('input')`
    width: 100%;
    height: 32px;
    margin: 0;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;

    &:focus {
      outline: none;
    }
    &:focus-visible {
      outline: 2px solid ${palette.blue300};
      outline-offset: 2px;
    }

    &::-webkit-slider-runnable-track {
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(
        to right,
        var(--range-fill) 0%,
        var(--range-fill) var(--range-pct),
        var(--range-track) var(--range-pct),
        var(--range-track) 100%
      );
      border: 1px solid var(--range-border);
      box-sizing: border-box;
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      margin-top: -4px;
      border-radius: 50%;
      background: var(--range-fill);
      border: 2px solid var(--range-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      cursor: pointer;
    }

    &::-moz-range-track {
      height: 10px;
      border-radius: 999px;
      background: var(--range-track);
      border: 1px solid var(--range-border);
      box-sizing: border-box;
    }
    &::-moz-range-progress {
      height: 10px;
      border-radius: 999px 0 0 999px;
      background: var(--range-fill);
      box-sizing: border-box;
    }
    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border: 2px solid var(--range-border);
      border-radius: 50%;
      background: var(--range-fill);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      cursor: pointer;
    }
  `,
};
