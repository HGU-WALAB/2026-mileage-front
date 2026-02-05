import { Flex, Table } from '@/components';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { THeader } from '@/types/table';
import { styled, useMediaQuery } from '@mui/material';

import { CapabilityDetailResponse } from '@/pages/dashboard/types/capability';

const CapabilityDetailTable = ({
  capabilityList,
}: {
  capabilityList: CapabilityDetailResponse[];
}) => {
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);

  const mobileHiddenHeaders = ['카테고리명', '내용'];
  const visibleHeaders = isMobile
    ? headerItems.filter(item => !mobileHiddenHeaders.includes(item.text))
    : headerItems;

  const bodyItems =
    capabilityList && capabilityList.length > 0
      ? capabilityList
      : [{ subitemName: '등록된 항목이 없어요' }];

  return (
    <S.TableWrapper>
      <Table headItems={visibleHeaders} bodyItems={bodyItems} />
    </S.TableWrapper>
  );
};

export default CapabilityDetailTable;

const headerItems: THeader[] = [
  { text: '학기', value: 'semester', width: '100px' },
  { text: '항목명', value: 'subitemName', width: '300px' },
  { text: '내용', value: 'description1', width: '300px' },
];

const S = {
  TableWrapper: styled('div')`
    position: relative;
    width: 100%;
  `,
  CountBadge: styled(Flex.Row)`
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: 2px solid ${({ theme }) => theme.palette.primary.main};
    border-radius: 1.5rem;
    padding: 0.25rem 0.75rem;
    gap: 0.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
    pointer-events: none;
  `,
  CountNumber: styled('span')`
    color: ${({ theme }) => theme.palette.primary.main};
    font-size: 1rem;
    font-weight: 800;
  `,
  CountText: styled('span')`
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 0.875rem;
    font-weight: 700;
  `,
};











