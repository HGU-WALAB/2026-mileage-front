import { SearchIcon } from '@/assets';
import { Button, Flex, Input, Modal, Text } from '@/components';
import { palette } from '@/styles/palette';
import { getOpacityColor } from '@/utils/getOpacityColor';
import { getMileageList } from '@/pages/mileage/apis/mileage';
import { MileageResponse } from '@/pages/mileage/types/mileage';
import { ALL_CATEGORY, ALL_SEMESTER, MILEAGE_CATEGORY_OPTIONS } from '@/constants/system';
import {
  getPortfolioMileage,
  putPortfolioMileage,
  type PortfolioMileageItem,
} from '../../apis/portfolio';
import {
  portfolioMileageToItem,
  usePortfolioContext,
} from '../context/PortfolioContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import { Dropdown } from '@/components';

interface MileageSelectModalProps {
  open: boolean;
  onClose: () => void;
}

const LIST_AREA_HEIGHT = '28rem';

/** 검색 목록 한 행의 고유 ID. GET /api/mileage/search 의 recordId = PUT 시 mileage_id */
function getMileageRowId(m: MileageResponse, index: number): number {
  if (m.recordId != null) return m.recordId;
  if (m.mileage_id != null) return m.mileage_id;
  return m.subitemId * 10000 + index;
}

/** 포트폴리오 마일리지 선택 모달. 참여 마일리지 목록 + 기존 선택 비교 후 확인 시 PUT */
const MileageSelectModal = ({ open, onClose }: MileageSelectModalProps) => {
  const theme = useTheme();
  const { setMileageItems } = usePortfolioContext();
  const [searchList, setSearchList] = useState<MileageResponse[]>([]);
  const [portfolioMileage, setPortfolioMileage] = useState<PortfolioMileageItem[]>([]);
  const [selectedMileageIds, setSelectedMileageIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState(ALL_SEMESTER);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const portfolioByMileageId = useMemo(
    () => new Map(portfolioMileage.map(p => [p.mileage_id, p])),
    [portfolioMileage],
  );

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      getMileageList({ category: 'all', semester: 'all', done: 'Y' }),
      getPortfolioMileage(),
    ])
      .then(([list, portfolioRes]) => {
        setSearchList(Array.isArray(list) ? list : []);
        const mileage = portfolioRes.mileage ?? [];
        setPortfolioMileage(mileage);
        setSelectedMileageIds(new Set(mileage.map(m => m.mileage_id)));
      })
      .catch(() => {
        toast.error('마일리지 목록을 불러오지 못했습니다.');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [open, onClose]);

  const semesterOptions = useMemo(() => {
    const semesters = Array.from(
      new Set(searchList.map(m => m.semester).filter(Boolean)),
    ).sort();
    return [ALL_SEMESTER, ...semesters];
  }, [searchList]);

  const toggleMileage = useCallback((mileageId: number) => {
    setSelectedMileageIds(prev => {
      const next = new Set(prev);
      if (next.has(mileageId)) next.delete(mileageId);
      else next.add(mileageId);
      return next;
    });
  }, []);

  const filteredList = useMemo(() => {
    let list = searchList;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        m =>
          m.subitemName?.toLowerCase().includes(q) ||
          m.categoryName?.toLowerCase().includes(q) ||
          m.description1?.toLowerCase().includes(q),
      );
    }
    if (semesterFilter !== ALL_SEMESTER) {
      list = list.filter(m => m.semester === semesterFilter);
    }
    if (categoryFilter !== ALL_CATEGORY) {
      list = list.filter(m => m.categoryName === categoryFilter);
    }
    return list;
  }, [searchList, searchQuery, semesterFilter, categoryFilter]);

  const allFilteredSelected =
    filteredList.length > 0 &&
    filteredList.every((m, i) => selectedMileageIds.has(getMileageRowId(m, i)));
  const handleToggleAllFiltered = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedMileageIds(prev => {
        const next = new Set(prev);
        filteredList.forEach((m, i) => next.delete(getMileageRowId(m, i)));
        return next;
      });
    } else {
      setSelectedMileageIds(prev => {
        const next = new Set(prev);
        filteredList.forEach((m, i) => next.add(getMileageRowId(m, i)));
        return next;
      });
    }
  }, [allFilteredSelected, filteredList]);

  const selectedList = useMemo(
    () =>
      searchList
        .map((m, index) => ({
          mileage: m,
          rowId: getMileageRowId(m, index),
        }))
        .filter(({ rowId }) => selectedMileageIds.has(rowId)),
    [searchList, selectedMileageIds],
  );

  const handleConfirm = useCallback(async () => {
    const putBody = Array.from(selectedMileageIds).map(mileageId => {
      const p = portfolioByMileageId.get(mileageId);
      return {
        mileage_id: mileageId,
        additional_info: p?.additional_info ?? '',
      };
    });
    setSubmitting(true);
    try {
      const res = await putPortfolioMileage(putBody);
      const sorted = (res.mileage ?? []).sort(
        (a, b) => a.display_order - b.display_order,
      );
      setMileageItems(sorted.map(portfolioMileageToItem));
      toast.success('변경사항이 저장되었습니다.', {
        position: 'top-center',
      });
      onClose();
    } catch {
      toast.error('마일리지 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedMileageIds, portfolioByMileageId, setMileageItems, onClose]);

  const selectedCount = selectedMileageIds.size;

  return (
    <Modal
      open={open}
      toggleModal={onClose}
      size="large"
      hasCloseButton
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Modal.Header position="start">마일리지 선택</Modal.Header>
      <Modal.Body position="start" style={{ gap: '1rem', marginTop: '0.5rem' }}>
        <Text
          style={{
            ...theme.typography.body2,
            color: theme.palette.grey[600],
            margin: 0,
          }}
        >
          포트폴리오에 추가할 마일리지를 선택하세요.
        </Text>
        {!loading && (
          <S.FilterBar>
            <Flex.Row gap="0.5rem" align="center">
              <Input
                placeholder="항목명을 입력하세요"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '14rem',
                  backgroundColor:
                    theme.palette.variant?.default ?? theme.palette.grey[50],
                }}
                inputProps={{ 'aria-label': '항목명 검색' }}
              />
              <S.SearchButton type="button" aria-label="검색">
                <SearchIcon />
              </S.SearchButton>
            </Flex.Row>
            <S.FilterRight>
              <Text
                style={{
                  ...theme.typography.body2,
                  color: theme.palette.grey[600],
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                학기 선택
              </Text>
              <Dropdown
                label="학기"
                items={semesterOptions}
                selectedItem={semesterFilter}
                setSelectedItem={setSemesterFilter}
                width="8rem"
              />
              <Text
                style={{
                  ...theme.typography.body2,
                  color: theme.palette.grey[600],
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                카테고리 선택
              </Text>
              <Dropdown
                label="카테고리"
                items={MILEAGE_CATEGORY_OPTIONS}
                selectedItem={categoryFilter}
                setSelectedItem={setCategoryFilter}
                width="10rem"
              />
            </S.FilterRight>
          </S.FilterBar>
        )}
        <S.ListWrap>
          {loading ? (
            <S.LoadingWrap>
              <LinearProgress
                sx={{
                  width: '12rem',
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: palette.blue300,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: palette.blue500,
                  },
                }}
              />
            </S.LoadingWrap>
          ) : (
            <S.ListColumns>
              <S.ListColumn>
                <S.ColumnTitle>
                  <Text
                    style={{
                      ...theme.typography.body2,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    전체 마일리지
                  </Text>
                </S.ColumnTitle>
                <S.TableScroll>
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <MuiTable
                      sx={{ minWidth: 800 }}
                      aria-label="마일리지 선택 테이블"
                    >
                      <S.TableHead>
                        <TableRow>
                          <S.HeadCell align="center" sx={{ width: '56px' }}>
                            <Checkbox
                              checked={allFilteredSelected}
                              indeterminate={
                                !allFilteredSelected &&
                                filteredList.some((m, i) =>
                                  selectedMileageIds.has(getMileageRowId(m, i)),
                                )
                              }
                              onChange={handleToggleAllFiltered}
                              disabled={filteredList.length === 0}
                              sx={{
                                color: palette.grey400,
                                '&.Mui-checked': { color: palette.blue500 },
                                '&.MuiCheckbox-indeterminate': {
                                  color: palette.blue400,
                                },
                              }}
                            />
                          </S.HeadCell>
                          <S.HeadCell align="right" sx={{ width: '100px' }}>
                            학기
                          </S.HeadCell>
                          <S.HeadCell align="left" sx={{ width: '140px' }}>
                            카테고리명
                          </S.HeadCell>
                          <S.HeadCell align="left" sx={{ minWidth: '160px' }}>
                            항목명
                          </S.HeadCell>
                          <S.HeadCell align="left">
                            내용
                          </S.HeadCell>
                        </TableRow>
                      </S.TableHead>
                      <TableBody>
                        {filteredList.map((m, index) => {
                          const rowId = getMileageRowId(m, index);
                          const isSelected = selectedMileageIds.has(rowId);
                          return (
                            <TableRow
                              key={rowId}
                              hover
                              onClick={() => toggleMileage(rowId)}
                              sx={{
                                cursor: 'pointer',
                                '&:last-child td': { border: 0 },
                              }}
                            >
                              <S.BodyCell
                                component="td"
                                align="center"
                                onClick={e => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => toggleMileage(rowId)}
                                  onClick={e => e.stopPropagation()}
                                  sx={{
                                    color: palette.grey400,
                                    '&.Mui-checked': { color: palette.blue500 },
                                  }}
                                />
                              </S.BodyCell>
                              <S.BodyCell component="td" align="right">
                                {m.semester}
                              </S.BodyCell>
                              <S.BodyCell component="td" align="left">
                                {m.categoryName}
                              </S.BodyCell>
                              <S.BodyCell component="td" align="left">
                                {m.subitemName}
                              </S.BodyCell>
                              <S.BodyCell component="td" align="left">
                                {m.description1 || '—'}
                              </S.BodyCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </MuiTable>
                  </TableContainer>
                </S.TableScroll>
              </S.ListColumn>
              <S.ListColumn>
                <S.ColumnTitle>
                  <Text
                    style={{
                      ...theme.typography.body2,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    선택된 마일리지
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.grey[600],
                      margin: 0,
                    }}
                  >
                    {selectedCount}개 선택됨
                  </Text>
                </S.ColumnTitle>
                <S.SelectedScroll>
                  {selectedList.length === 0 ? (
                    <S.SelectedEmpty>
                      <Text
                        style={{
                          ...theme.typography.body2,
                          color: theme.palette.grey[500],
                          margin: 0,
                        }}
                      >
                        선택된 마일리지가 없습니다.
                      </Text>
                    </S.SelectedEmpty>
                  ) : (
                    <S.SelectedList>
                      {selectedList.map(({ mileage, rowId }) => (
                        <S.SelectedRow
                          key={rowId}
                          align="center"
                          gap="0.5rem"
                          onClick={() => toggleMileage(rowId)}
                        >
                          <Checkbox
                            checked
                            onChange={() => toggleMileage(rowId)}
                            onClick={e => e.stopPropagation()}
                            sx={{
                              color: palette.blue500,
                              '&.Mui-checked': { color: palette.blue500 },
                            }}
                          />
                          <Flex.Column
                            gap="0.125rem"
                            style={{ flex: 1, minWidth: 0 }}
                          >
                            <Flex.Row
                              align="center"
                              justify="space-between"
                              style={{ width: '100%' }}
                            >
                              <Text
                                style={{
                                  ...theme.typography.body2,
                                  fontWeight: 600,
                                  margin: 0,
                                }}
                              >
                                {mileage.subitemName}
                              </Text>
                              <Text
                                style={{
                                  ...theme.typography.caption,
                                  color: theme.palette.grey[600],
                                  margin: 0,
                                  flexShrink: 0,
                                }}
                              >
                                {mileage.semester}
                              </Text>
                            </Flex.Row>
                            <Text
                              style={{
                                ...theme.typography.caption,
                                color: theme.palette.grey[600],
                                margin: 0,
                              }}
                            >
                              {mileage.categoryName}
                            </Text>
                          </Flex.Column>
                        </S.SelectedRow>
                      ))}
                    </S.SelectedList>
                  )}
                </S.SelectedScroll>
              </S.ListColumn>
            </S.ListColumns>
          )}
        </S.ListWrap>
      </Modal.Body>
      <Modal.Footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Flex.Row gap="0.5rem">
          <Button label="취소" variant="outlined" size="large" onClick={onClose} />
          <Button
            label="확인"
            variant="contained"
            color="blue"
            size="large"
            disabled={loading || submitting}
            onClick={handleConfirm}
          />
        </Flex.Row>
      </Modal.Footer>
    </Modal>
  );
};

export default MileageSelectModal;

const S = {
  FilterBar: styled('div')`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
  `,
  FilterRight: styled('div')`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  `,
  SearchButton: styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.palette.primary.main};
    border: none;
    border-radius: 0.4rem;
    padding: 0.8rem 1rem;
    cursor: pointer;
    color: ${palette.white};
    &:hover,
    &:active {
      background-color: ${palette.blue600};
    }
  `,
  ListWrap: styled('div')`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: ${LIST_AREA_HEIGHT};
    min-height: ${LIST_AREA_HEIGHT};
    flex-shrink: 0;
    gap: 1rem;
    @media (max-width: 900px) {
      flex-direction: column;
      height: auto;
      min-height: 18rem;
    }
  `,
  LoadingWrap: styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: ${LIST_AREA_HEIGHT};
  `,
  ListColumns: styled('div')`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    gap: 1rem;
    @media (max-width: 900px) {
      flex-direction: column;
    }
  `,
  ListColumn: styled(Flex.Column)`
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    &:first-of-type {
      @media (max-width: 900px) {
        height: 16rem;
      }
    }
  `,
  ColumnTitle: styled(Flex.Row)`
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
  `,
  TableScroll: styled('div')`
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: auto;
  `,
  TableHead: styled(TableHead)`
    background-color: ${({ theme }) => theme.palette.primary.light};
    height: 40px;
  `,
  HeadCell: styled(TableCell)`
    border-bottom: none;
    padding: 0 1rem;
    font-weight: 600;
  `,
  BodyCell: styled(TableCell)`
    border-bottom: 1px solid
      ${({ theme }) => getOpacityColor(theme.palette.grey200, 0.4)};
    padding: 0.75rem 1rem;
  `,
  SelectedScroll: styled('div')`
    width: 100%;
    height: 100%;
    overflow: auto;
    border-radius: 0.75rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid ${({ theme }) => theme.palette.grey[200]};
    @media (max-width: 900px) {
      margin-bottom: 0.75rem;
    }
  `,
  SelectedEmpty: styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 1rem;
  `,
  SelectedList: styled(Flex.Column)`
    width: 100%;
    padding: 0.5rem 0.75rem;
    gap: 0.25rem;
  `,
  SelectedRow: styled(Flex.Row)`
    padding: 0.5rem 0.25rem;
    border-radius: 0.5rem;
    cursor: pointer;
    border-bottom: 1px solid
      ${({ theme }) => getOpacityColor(theme.palette.grey200, 0.6)};
    &:hover {
      background-color: ${({ theme }) => theme.palette.grey[100]};
    }
    &:last-of-type {
      border-bottom: none;
    }
  `,
};
