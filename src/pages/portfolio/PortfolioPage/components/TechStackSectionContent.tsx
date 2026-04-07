import { Button, Dropdown, Flex, Input, Text } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { palette } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import {
  Dialog,
  DialogActions,
  DialogContent,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type FunctionComponent,
  type SVGProps,
} from 'react';

import type { TechStackDomain, TechStackSkill } from '../../apis/portfolio';
import { INPUT_MAX_LENGTH } from '../../constants/inputLimits';
import { nextTempDomainId } from '../../utils/techStackDomains';
import {
  collectVisibleProficiencyTiers,
  getProficiencyTierLegend,
  getProficiencyTierTagPair,
  levelToProficiencyTier,
  type ProficiencyTierIndex,
  PROFICIENCY_TIER_LABELS,
  tierToRepresentativeLevel,
} from '../../utils/techStackLevel';
import { TECH_STACK_DOMAIN_PRESETS } from '../../constants/techStackDomainPresets';
import { usePortfolioContext } from '../context/PortfolioContext';

interface TechStackSectionContentProps {
  readOnly?: boolean;
}

export type TechStackSectionContentHandle = {
  openAddDomainDialog: () => void;
};

const AddPlusButtonIcon: FunctionComponent<SVGProps<SVGSVGElement>> = () => (
  <AddIcon sx={{ fontSize: 20 }} />
);

function sortDomains(domains: TechStackDomain[]): TechStackDomain[] {
  return [...domains].sort((a, b) => a.order_index - b.order_index);
}

/** 칼럼별 스택 원본 인덱스 유지 (삭제용) */
function bucketStacksByTier(stacks: TechStackSkill[]) {
  const buckets: { skill: TechStackSkill; stackIndex: number }[][] = Array.from(
    { length: PROFICIENCY_TIER_LABELS.length },
    () => [],
  );
  stacks.forEach((skill, stackIndex) => {
    const tier = levelToProficiencyTier(skill.level);
    buckets[tier].push({ skill, stackIndex });
  });
  buckets.forEach(b =>
    b.sort((a, c) => a.skill.name.localeCompare(c.skill.name, 'ko')),
  );
  return buckets;
}

/** 표에 그리는 칼럼(숙련도 단계)에 맞춰 버킷만 추림 */
function bucketStacksForVisible(
  stacks: TechStackSkill[],
  visibleTiers: ProficiencyTierIndex[],
) {
  const full = bucketStacksByTier(stacks);
  return visibleTiers.map(ti => full[ti]);
}

function NotionTag({
  item,
  stackIndex,
  readOnly,
  onRemove,
  onEdit,
}: {
  item: TechStackSkill;
  stackIndex: number;
  readOnly: boolean;
  onRemove: (stackIndex: number) => void;
  onEdit?: () => void;
}) {
  const tier = levelToProficiencyTier(item.level);
  const pair = getProficiencyTierTagPair(tier);
  const tierLabel = PROFICIENCY_TIER_LABELS[tier];

  return (
    <S.NotionTag
      $readOnly={readOnly}
      style={{
        backgroundColor: pair.bg,
        color: pair.fg,
        border: `1px solid ${pair.border}`,
      }}
      title={tierLabel}
    >
      {!readOnly && onEdit ? (
        <S.TagLabelButton
          type="button"
          onClick={onEdit}
          aria-label={`${item.name} 수정`}
        >
          <S.TagLabel>{item.name}</S.TagLabel>
        </S.TagLabelButton>
      ) : (
        <S.TagLabel>{item.name}</S.TagLabel>
      )}
      {!readOnly && (
        <S.TagRemove
          type="button"
          $fg={pair.fg}
          onClick={e => {
            e.stopPropagation();
            onRemove(stackIndex);
          }}
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
  const { techStackDomains, setTechStackDomains } = usePortfolioContext();

  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [domainNameInput, setDomainNameInput] = useState('');

  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [skillDomainId, setSkillDomainId] = useState<number | null>(null);
  const [skillNameInput, setSkillNameInput] = useState('');
  const [skillTier, setSkillTier] = useState<ProficiencyTierIndex>(2);
  /** null이면 추가, 있으면 해당 위치 기술 수정 */
  const [skillEditOrigin, setSkillEditOrigin] = useState<{
    domainId: number;
    stackIndex: number;
  } | null>(null);

  const sortedDomains = useMemo(
    () => sortDomains(techStackDomains),
    [techStackDomains],
  );

  /** Dropdown은 문자열 목록만 지원 — 동명 도메인은 (id)로 구분 */
  const skillDomainDropdownItems = useMemo(() => {
    const list = sortedDomains.filter(
      (d): d is TechStackDomain & { id: number } => d.id != null,
    );
    const baseNames = list.map(d => d.name.trim() || '이름 없음');
    const counts = baseNames.reduce((m, n) => {
      m.set(n, (m.get(n) ?? 0) + 1);
      return m;
    }, new Map<string, number>());
    return list.map(d => {
      const base = d.name.trim() || '이름 없음';
      const label =
        (counts.get(base) ?? 0) > 1 ? `${base} (${d.id})` : base;
      return { id: d.id, label };
    });
  }, [sortedDomains]);

  const skillDomainSelectedLabel = useMemo(() => {
    return (
      skillDomainDropdownItems.find(o => o.id === skillDomainId)?.label ?? ''
    );
  }, [skillDomainDropdownItems, skillDomainId]);

  const visibleTierIndices = useMemo(
    () => collectVisibleProficiencyTiers(sortedDomains),
    [sortedDomains],
  );

  /** 데이터에 숙련도 열이 없을 때도 중간 1fr 트랙을 두어 도메인·액션만으로 쪼그라들지 않게 함 */
  const hasTierColumns = visibleTierIndices.length > 0;
  const tierTrackCount = hasTierColumns ? visibleTierIndices.length : 1;

  const tableGridColumns = useMemo(() => {
    const domainCol = 'minmax(10.5rem, 12rem)';
    const tierTracks = hasTierColumns
      ? visibleTierIndices.map(() => 'minmax(5.25rem, 1fr)').join(' ')
      : /* 스택 없음: 0 최소폭이면 분할 뷰에서 열이 붕괴됨 */
        'minmax(11rem, 1fr)';
    const actionPart = readOnly ? '' : ' minmax(6.75rem, 7.5rem)';
    return `${domainCol} ${tierTracks}${actionPart}`;
  }, [hasTierColumns, visibleTierIndices, readOnly]);

  /** 단일 그리드에서 행마다 열 너비 통일 (헤더·모든 도메인 행 동일 트랙) */
  const tableColumnCount = useMemo(
    () => 1 + tierTrackCount + (readOnly ? 0 : 1),
    [tierTrackCount, readOnly],
  );

  useEffect(() => {
    if (!addDomainOpen) setDomainNameInput('');
  }, [addDomainOpen]);

  useEffect(() => {
    if (!addSkillOpen) {
      setSkillDomainId(null);
      setSkillNameInput('');
      setSkillTier(2);
      setSkillEditOrigin(null);
    }
  }, [addSkillOpen]);

  const openSkillDialog = useCallback((domainId: number) => {
    if (readOnly) return;
    setSkillEditOrigin(null);
    setSkillDomainId(domainId);
    setSkillNameInput('');
    setSkillTier(2);
    setAddSkillOpen(true);
  }, [readOnly]);

  const openSkillEditDialog = useCallback(
    (domainId: number, stackIndex: number) => {
      if (readOnly) return;
      const d = techStackDomains.find(x => x.id === domainId);
      const skill = d?.tech_stacks[stackIndex];
      if (!skill) return;
      setSkillEditOrigin({ domainId, stackIndex });
      setSkillDomainId(domainId);
      setSkillNameInput(skill.name);
      setSkillTier(levelToProficiencyTier(skill.level));
      setAddSkillOpen(true);
    },
    [readOnly, techStackDomains],
  );

  const handleRemoveSkill = useCallback(
    (domainId: number, stackIndex: number) => {
      setTechStackDomains(prev =>
        prev.map(d =>
          d.id === domainId
            ? {
                ...d,
                tech_stacks: d.tech_stacks.filter((_, i) => i !== stackIndex),
              }
            : d,
        ),
      );
    },
    [setTechStackDomains],
  );

  const handleDeleteDomain = useCallback(
    (domainId: number) => {
      setTechStackDomains(prev => {
        const filtered = prev.filter(d => d.id !== domainId);
        return filtered.map((d, i) => ({ ...d, order_index: i }));
      });
    },
    [setTechStackDomains],
  );

  const handleAddDomainSubmit = useCallback(() => {
    const name = domainNameInput.trim();
    if (name === '') return;
    setTechStackDomains(prev => [
      ...prev.map((d, i) => ({ ...d, order_index: i })),
      {
        id: nextTempDomainId(prev),
        name,
        order_index: prev.length,
        tech_stacks: [],
      },
    ]);
    setAddDomainOpen(false);
  }, [domainNameInput, setTechStackDomains]);

  const handleSkillDialogSubmit = useCallback(() => {
    const name = skillNameInput.trim();
    if (name === '' || skillDomainId == null) return;
    const level = tierToRepresentativeLevel(skillTier);

    if (skillEditOrigin == null) {
      setTechStackDomains(prev =>
        prev.map(d =>
          d.id === skillDomainId
            ? { ...d, tech_stacks: [...d.tech_stacks, { name, level }] }
            : d,
        ),
      );
    } else {
      const { domainId: originDomainId, stackIndex } = skillEditOrigin;
      setTechStackDomains(prev =>
        prev.map(d => {
          if (originDomainId === skillDomainId) {
            if (d.id !== originDomainId) return d;
            const stacks = [...d.tech_stacks];
            stacks[stackIndex] = { name, level };
            return { ...d, tech_stacks: stacks };
          }
          if (d.id === originDomainId) {
            return {
              ...d,
              tech_stacks: d.tech_stacks.filter((_, i) => i !== stackIndex),
            };
          }
          if (d.id === skillDomainId) {
            return {
              ...d,
              tech_stacks: [...d.tech_stacks, { name, level }],
            };
          }
          return d;
        }),
      );
    }
    setAddSkillOpen(false);
  }, [
    skillDomainId,
    skillEditOrigin,
    skillNameInput,
    skillTier,
    setTechStackDomains,
  ]);

  /** 표 칼럼은 데이터 있는 단계만 쓰더라도, 색상 기준 범례는 5단계 전부 표시 */
  const levelLegend = useMemo(() => getProficiencyTierLegend(), []);

  const skillDomainName =
    sortedDomains.find(d => d.id === skillDomainId)?.name?.trim() ?? '';

  const skillDialogIsEdit = skillEditOrigin != null;

  useImperativeHandle(
    ref,
    () => ({
      openAddDomainDialog: () => {
        if (!readOnly) setAddDomainOpen(true);
      },
    }),
    [readOnly],
  );

  const headerIconColor = theme.palette.grey[500];
  const headerLabelColor = theme.palette.grey[600];

  const desktopTable = (
    <S.TableScroll>
      <S.Table
        role="table"
        aria-label="기술 스택"
        style={{ width: '100%', minWidth: '100%' }}
      >
        <S.TableGrid $cols={tableGridColumns} $columnCount={tableColumnCount}>
          <S.GridHeadCell>
            <S.HeadInner>
              <TextFieldsOutlinedIcon
                sx={{ fontSize: 17, color: headerIconColor, flexShrink: 0 }}
              />
              <S.HeadLabel style={{ color: headerLabelColor }}>도메인</S.HeadLabel>
            </S.HeadInner>
          </S.GridHeadCell>
          {hasTierColumns ? (
            visibleTierIndices.map(tierIdx => (
              <S.GridHeadCell key={tierIdx}>
                <S.HeadInner>
                  <ViewWeekOutlinedIcon
                    sx={{ fontSize: 17, color: headerIconColor, flexShrink: 0 }}
                  />
                  <S.HeadLabel $tier style={{ color: headerLabelColor }}>
                    {PROFICIENCY_TIER_LABELS[tierIdx]}
                  </S.HeadLabel>
                </S.HeadInner>
              </S.GridHeadCell>
            ))
          ) : (
            <S.GridHeadCell key="tier-empty-head">
              <S.HeadInner>
                <ViewWeekOutlinedIcon
                  sx={{ fontSize: 17, color: headerIconColor, flexShrink: 0 }}
                />
                <S.HeadLabel $tier style={{ color: headerLabelColor }}>
                  숙련도
                </S.HeadLabel>
              </S.HeadInner>
            </S.GridHeadCell>
          )}
          {!readOnly && (
            <S.GridHeadCell>
              <S.HeadInner>
                <AddIcon
                  sx={{ fontSize: 17, color: headerIconColor, flexShrink: 0 }}
                />
                <S.HeadLabel $tier style={{ color: headerLabelColor }}>
                  기술
                </S.HeadLabel>
              </S.HeadInner>
            </S.GridHeadCell>
          )}
          {sortedDomains.map(domain => {
            const rowBuckets = hasTierColumns
              ? bucketStacksForVisible(domain.tech_stacks, visibleTierIndices)
              : [[]] as ReturnType<typeof bucketStacksForVisible>;
            return (
              <Fragment key={domain.id}>
                <S.GridBodyCell $role="domain">
                  <Flex.Row
                    align="flex-start"
                    justify="space-between"
                    gap="0.5rem"
                    style={{ width: '100%', minWidth: 0 }}
                  >
                    <S.DomainText style={{ flex: '1 1 auto', minWidth: 0 }}>
                      {domain.name}
                    </S.DomainText>
                    {!readOnly && domain.id != null && (
                      <S.IconGhostBtn
                        type="button"
                        onClick={() => handleDeleteDomain(domain.id!)}
                        aria-label={`도메인 ${domain.name} 전체 삭제`}
                      >
                        <CloseIcon sx={{ fontSize: 18 }} />
                      </S.IconGhostBtn>
                    )}
                  </Flex.Row>
                </S.GridBodyCell>
                {rowBuckets.map((entries, colIdx) => (
                  <S.GridBodyCell
                    $role="tier"
                    key={
                      hasTierColumns
                        ? `${domain.id}-tier-${visibleTierIndices[colIdx]}`
                        : `${domain.id}-tier-empty`
                    }
                  >
                    {entries.length === 0 && !readOnly && !hasTierColumns ? (
                      <S.EmptyTierHintScroll>
                        <S.EmptyTierCellHint style={{ color: headerLabelColor }}>
                          기술 추가 시 단계별 열이 나뉩니다
                        </S.EmptyTierCellHint>
                      </S.EmptyTierHintScroll>
                    ) : (
                      <S.TagCloudColumn>
                        {entries.map(({ skill, stackIndex }) => (
                          <NotionTag
                            key={`${domain.id}-${stackIndex}`}
                            item={skill}
                            stackIndex={stackIndex}
                            readOnly={readOnly}
                            onRemove={idx => handleRemoveSkill(domain.id!, idx)}
                            onEdit={
                              readOnly || domain.id == null
                                ? undefined
                                : () =>
                                    openSkillEditDialog(
                                      domain.id!,
                                      stackIndex,
                                    )
                            }
                          />
                        ))}
                      </S.TagCloudColumn>
                    )}
                  </S.GridBodyCell>
                ))}
                {!readOnly && (
                  <S.GridBodyCell $role="skill">
                    {domain.id != null ? (
                      <Button
                        label="기술 추가"
                        variant="outlined"
                        color="blue"
                        size="small"
                        onClick={() => openSkillDialog(domain.id!)}
                      />
                    ) : null}
                  </S.GridBodyCell>
                )}
              </Fragment>
            );
          })}
          {!readOnly && (
            <S.FooterStripe>
              <S.AddDomainFootBtn
                type="button"
                onClick={() => setAddDomainOpen(true)}
              >
                <AddIcon sx={{ fontSize: 20, color: palette.blue500 }} />
                도메인 추가
              </S.AddDomainFootBtn>
            </S.FooterStripe>
          )}
        </S.TableGrid>
      </S.Table>
    </S.TableScroll>
  );

  return (
    <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
      <S.LevelLegend aria-label="숙련도 단계별 색상">
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: 600,
            color: theme.palette.grey[600],
            margin: 0,
          }}
        >
          숙련도 단계 색상 기준
        </Text>
        <S.LegendGrid>
          {levelLegend.map(row => (
            <S.LegendItem key={row.label}>
              <S.LegendDot
                style={{
                  backgroundColor: row.bg,
                  borderColor: row.border,
                }}
              />
              <S.LegendRange>{row.label}</S.LegendRange>
            </S.LegendItem>
          ))}
        </S.LegendGrid>
      </S.LevelLegend>

      {techStackDomains.length === 0 ? (
        <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
          {!readOnly && (
            <Flex.Row justify="flex-start" style={{ width: '100%' }}>
              <Button
                label="도메인 추가"
                variant="outlined"
                color="blue"
                size="medium"
                icon={AddPlusButtonIcon}
                iconPosition="start"
                onClick={() => setAddDomainOpen(true)}
              />
            </Flex.Row>
          )}
          <S.EmptyNote>
            등록된 기술 스택이 없습니다.
            {!readOnly && ' 도메인 추가로 분야를 만든 뒤, 행에서 기술을 넣을 수 있습니다.'}
          </S.EmptyNote>
        </Flex.Column>
      ) : isMobile ? (
        <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
          {sortedDomains.map(domain => {
            const buckets = bucketStacksByTier(domain.tech_stacks);
            return (
              <S.MobileCard key={domain.id}>
                <S.MobileHead>
                  <TextFieldsOutlinedIcon
                    sx={{ fontSize: 16, color: headerIconColor, flexShrink: 0 }}
                  />
                  <S.HeadLabel
                    style={{
                      color: headerLabelColor,
                      flex: '1 1 auto',
                      minWidth: 0,
                    }}
                  >
                    {domain.name}
                  </S.HeadLabel>
                  {!readOnly && domain.id != null && (
                    <S.IconGhostBtn
                      type="button"
                      onClick={() => handleDeleteDomain(domain.id!)}
                      aria-label={`도메인 ${domain.name} 전체 삭제`}
                      style={{ flexShrink: 0 }}
                    >
                      <CloseIcon sx={{ fontSize: 20 }} />
                    </S.IconGhostBtn>
                  )}
                </S.MobileHead>
                <Flex.Column gap="0.75rem" style={{ width: '100%' }}>
                  {visibleTierIndices.map(tierIdx => (
                    <S.MobileTierBlock
                      key={`${domain.id}-${tierIdx}`}
                    >
                      <S.MobileTierTitle>
                        {PROFICIENCY_TIER_LABELS[tierIdx]}
                      </S.MobileTierTitle>
                      <S.TagCloudColumn>
                        {buckets[tierIdx].map(({ skill, stackIndex }) => (
                          <NotionTag
                            key={`${domain.id}-${stackIndex}`}
                            item={skill}
                            stackIndex={stackIndex}
                            readOnly={readOnly}
                            onRemove={idx =>
                              handleRemoveSkill(domain.id!, idx)
                            }
                            onEdit={
                              readOnly || domain.id == null
                                ? undefined
                                : () =>
                                    openSkillEditDialog(
                                      domain.id!,
                                      stackIndex,
                                    )
                            }
                          />
                        ))}
                      </S.TagCloudColumn>
                    </S.MobileTierBlock>
                  ))}
                  {!readOnly && domain.id != null && (
                    <Flex.Row style={{ width: '100%' }}>
                      <Button
                        label="기술 추가"
                        variant="outlined"
                        color="blue"
                        size="small"
                        onClick={() => openSkillDialog(domain.id!)}
                      />
                    </Flex.Row>
                  )}
                </Flex.Column>
              </S.MobileCard>
            );
          })}
          {!readOnly && (
            <S.MobileFooterBtn
              type="button"
              onClick={() => setAddDomainOpen(true)}
            >
              <AddIcon sx={{ fontSize: 20, color: palette.blue500 }} />
              도메인 추가
            </S.MobileFooterBtn>
          )}
        </Flex.Column>
      ) : (
        desktopTable
      )}

      {!readOnly && (
        <>
          <Dialog
            open={addDomainOpen}
            onClose={() => setAddDomainOpen(false)}
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
                    도메인 추가
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body2,
                      color: theme.palette.grey[600],
                      margin: 0,
                    }}
                  >
                    기술 스택을 묶을 도메인(분야) 이름만 입력합니다.
                  </Text>
                </Flex.Column>
                <S.FieldGroup>
                  <Dropdown
                    label="도메인"
                    items={[...TECH_STACK_DOMAIN_PRESETS]}
                    selectedItem={domainNameInput}
                    setSelectedItem={setDomainNameInput}
                    freeSolo
                    freeSoloInputProps={{
                      maxLength: INPUT_MAX_LENGTH.TECH_STACK_DOMAIN,
                      'aria-label': '도메인',
                      onKeyDown: e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDomainSubmit();
                        }
                      },
                    }}
                    size="medium"
                    width="100%"
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
                onClick={() => setAddDomainOpen(false)}
              />
              <Button
                label="추가"
                variant="contained"
                color="blue"
                size="medium"
                onClick={handleAddDomainSubmit}
              />
            </DialogActions>
          </Dialog>

          <Dialog
            open={addSkillOpen}
            onClose={() => setAddSkillOpen(false)}
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
                    {skillDialogIsEdit ? '기술 항목 수정' : '기술 항목 추가'}
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body2,
                      color: theme.palette.grey[600],
                      margin: 0,
                    }}
                  >
                    {skillDialogIsEdit
                      ? '이름·도메인·숙련도 단계를 바꿀 수 있습니다.'
                      : '기술 이름과 숙련도 단계(Beginner~Expert)를 선택합니다.'}
                  </Text>
                </Flex.Column>
                <S.FieldGroup>
                  {skillDialogIsEdit ? (
                    <Dropdown
                      label="도메인"
                      items={skillDomainDropdownItems.map(o => o.label)}
                      selectedItem={skillDomainSelectedLabel}
                      setSelectedItem={label => {
                        const o = skillDomainDropdownItems.find(
                          x => x.label === label,
                        );
                        if (o) setSkillDomainId(o.id);
                      }}
                      width="100%"
                      size="medium"
                    />
                  ) : (
                    <Input
                      label="도메인"
                      value={skillDomainName || '—'}
                      fullWidth
                      size="medium"
                      inputProps={{
                        readOnly: true,
                        id: 'skill-dialog-domain-readonly',
                        'aria-label': '도메인',
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.variant.default,
                        },
                      }}
                    />
                  )}
                </S.FieldGroup>
                <S.FieldGroup>
                  <Input
                    label="기술 이름"
                    value={skillNameInput}
                    onChange={e => setSkillNameInput(e.target.value)}
                    placeholder="예: SpringBoot, Swift, React.js, Git, Notion"
                    inputProps={{
                      maxLength: INPUT_MAX_LENGTH.TECH_STACK_NAME,
                      'aria-label': '기술 이름',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSkillDialogSubmit();
                      }
                    }}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.variant.default,
                      },
                    }}
                  />
                </S.FieldGroup>
                <S.FieldGroup>
                  <S.FieldLabel>숙련도 단계</S.FieldLabel>
                  <Flex.Row gap="0.5rem" wrap="wrap" style={{ width: '100%' }}>
                    {PROFICIENCY_TIER_LABELS.map((label, tier) => {
                      const pair = getProficiencyTierTagPair(
                        tier as ProficiencyTierIndex,
                      );
                      const selected = skillTier === tier;
                      return (
                        <S.TierChoice
                          key={label}
                          type="button"
                          $selected={selected}
                          onClick={() => setSkillTier(tier as ProficiencyTierIndex)}
                          style={{
                            borderColor: pair.border,
                            backgroundColor: selected ? pair.bg : palette.white,
                            color: pair.fg,
                          }}
                        >
                          {label}
                        </S.TierChoice>
                      );
                    })}
                  </Flex.Row>
                </S.FieldGroup>
              </Flex.Column>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Button
                label="취소"
                variant="outlined"
                color="blue"
                size="medium"
                onClick={() => setAddSkillOpen(false)}
              />
              <Button
                label={skillDialogIsEdit ? '저장' : '추가'}
                variant="contained"
                color="blue"
                size="medium"
                onClick={handleSkillDialogSubmit}
              />
            </DialogActions>
          </Dialog>
        </>
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
  TableScroll: styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
  `,
  Table: styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid ${palette.grey200};
    border-radius: 6px;
    overflow: hidden;
    background-color: ${palette.white};
    box-sizing: border-box;
  `,
  TableGrid: styled('div')<{ $cols: string; $columnCount: number }>`
    display: grid;
    grid-template-columns: ${p => p.$cols};
    width: 100%;
    box-sizing: border-box;
    align-items: stretch;
    & > *:nth-of-type(${p => p.$columnCount}n) {
      border-right: none;
    }
  `,
  GridHeadCell: styled('div')`
    padding: 10px 10px;
    border-right: 1px solid ${palette.grey200};
    border-bottom: 1px solid ${palette.grey200};
    background-color: ${palette.grey100};
    min-width: 0;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  `,
  GridBodyCell: styled('div')<{ $role: 'domain' | 'tier' | 'skill' }>`
    padding: 12px 10px;
    border-right: 1px solid ${palette.grey200};
    border-bottom: 1px solid ${palette.grey200};
    min-width: 0;
    display: flex;
    box-sizing: border-box;
    align-items: ${p => (p.$role === 'skill' ? 'center' : 'flex-start')};
  `,
  FooterStripe: styled('div')`
    grid-column: 1 / -1;
    padding: 10px 14px;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: ${palette.white};
    box-sizing: border-box;
    width: 100%;
  `,
  HeadInner: styled('div')`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-width: 0;
  `,
  HeadLabel: styled('span')<{ $tier?: boolean }>`
    font-size: ${p => (p.$tier ? '11px' : '13px')};
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.25;
  `,
  DomainText: styled('span')`
    font-size: 14px;
    font-weight: 700;
    color: ${palette.nearBlack};
    line-height: 1.4;
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  `,
  TagCloudColumn: styled('div')<{ $fitContent?: boolean }>`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    align-content: flex-start;
    box-sizing: border-box;
    width: ${p => (p.$fitContent ? 'max-content' : '100%')};
    max-width: ${p => (p.$fitContent ? '100%' : 'none')};
  `,
  EmptyTierHintScroll: styled('div')`
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
  `,
  EmptyTierCellHint: styled('span')`
    display: inline-block;
    margin: 0;
    max-width: none;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.01em;
    white-space: nowrap;
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
  TagLabelButton: styled('button')`
    display: inline-flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    box-sizing: border-box;
    &:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    &:focus-visible {
      outline: 2px solid ${palette.blue400};
      outline-offset: 1px;
    }
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
  IconGhostBtn: styled('button')`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: ${palette.grey600};
    cursor: pointer;
    &:hover {
      background-color: ${palette.grey100};
      color: ${palette.nearBlack};
    }
  `,
  AddDomainFootBtn: styled('button')`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 6px 4px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: ${palette.grey600};
    &:hover {
      color: ${palette.blue500};
    }
  `,
  MobileFooterBtn: styled('button')`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 14px;
    border: 1px dashed ${palette.grey200};
    border-radius: 6px;
    background: ${palette.white};
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: ${palette.grey600};
    box-sizing: border-box;
    &:hover {
      border-color: ${palette.blue300};
      color: ${palette.blue500};
    }
  `,
  MobileCard: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
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
    flex-wrap: wrap;
  `,
  MobileTierBlock: styled('div')`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `,
  MobileTierTitle: styled('span')`
    font-size: 11px;
    font-weight: 700;
    color: ${palette.grey600};
    letter-spacing: 0.02em;
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
  TierChoice: styled('button')<{ $selected: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border-radius: 8px;
    border-width: ${p => (p.$selected ? '2px' : '1px')};
    border-style: solid;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: -0.01em;
    box-sizing: border-box;
    &:focus-visible {
      outline: 2px solid ${palette.blue300};
      outline-offset: 2px;
    }
  `,
};
