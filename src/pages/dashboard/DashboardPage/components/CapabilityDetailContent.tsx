import { Flex, ToggleButton } from '@/components';
import { useGetCapabilityQuery, useGetCapabilityDetailQuery } from '@/pages/dashboard/hooks';
import { styled } from '@mui/material';
import { useMemo, useState } from 'react';

import CapabilityDetailTable from './CapabilityDetailTable';

const CapabilityDetailContent = () => {
  const {
    data: capability = [],
    isLoading: isCapabilityLoading,
    isError: isCapabilityError,
  } = useGetCapabilityQuery();
  const {
    data: capabilityDetail = [],
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetCapabilityDetailQuery();

  const initialName = capability[0]?.capabilityName ?? '';
  const [selectedCapability, setSelectedCapability] = useState<string>(initialName);

  const selectedCapabilityDetail = useMemo(
    () =>
      capabilityDetail.filter(
        detail => detail.capabilityName === selectedCapability,
      ),
    [selectedCapability, capabilityDetail],
  );

  // 표에 실제로 표시되는 항목의 개수 계산
  const actualDisplayCount = useMemo(() => {
    return selectedCapabilityDetail && selectedCapabilityDetail.length > 0
      ? selectedCapabilityDetail.length
      : 0;
  }, [selectedCapabilityDetail]);

  // 상위 섹션에서 Loading/Error를 처리하긴 하지만, 데이터가 아예 없을 때 방어
  if (isCapabilityLoading || isDetailLoading) return null;
  if (isCapabilityError || isDetailError) return null;
  if (!selectedCapability && capability[0]?.capabilityName) {
    // 첫 로드 시 state가 비어있는 경우 보정
    setSelectedCapability(capability[0].capabilityName);
    return null;
  }

  return (
    <S.ContentContainer>
      <S.CategoryOptions gap=".5rem">
        {capability.map(capa => (
          <ToggleButton
            key={capa.capabilityName}
            size="small"
            label={capa.capabilityName}
            selected={capa.capabilityName === selectedCapability}
            onClick={() => setSelectedCapability(capa.capabilityName)}
          />
        ))}
      </S.CategoryOptions>

      <S.TableWrapper>
        <S.TableContainer>
          <CapabilityDetailTable capabilityList={selectedCapabilityDetail} />
        </S.TableContainer>
      </S.TableWrapper>

      {actualDisplayCount > 0 && (
        <S.CountBadge>
          <S.CountNumber>{actualDisplayCount}</S.CountNumber>
          <S.CountText>건</S.CountText>
        </S.CountBadge>
      )}
    </S.ContentContainer>
  );
};

export default CapabilityDetailContent;

const S = {
  ContentContainer: styled(Flex.Column)`
    justify-content: flex-start;
    gap: 0.5rem;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: visible;
  `,
  CategoryOptions: styled(Flex.Row)`
    height: fit-content;
    min-height: fit-content;
    overflow-x: auto;
    overflow-y: visible;
    width: 100%;
    padding-bottom: 0.5rem;
    align-items: flex-start;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.palette.grey[300]};
      border-radius: 2px;
    }
  `,
  TableWrapper: styled('div')`
    height: 85%;
    width: 100%;
    position: relative;
  `,
  TableContainer: styled('div')`
    height: 100%;
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
  `,
  CountBadge: styled(Flex.Row)`
    position: absolute;
    bottom: 1rem;
    right: 1rem;
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











