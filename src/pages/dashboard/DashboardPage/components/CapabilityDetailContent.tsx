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

  // 상위 섹션에서 Loading/Error를 처리하긴 하지만, 데이터가 아예 없을 때 방어
  if (isCapabilityLoading || isDetailLoading) return null;
  if (isCapabilityError || isDetailError) return null;
  if (!selectedCapability && capability[0]?.capabilityName) {
    // 첫 로드 시 state가 비어있는 경우 보정
    setSelectedCapability(capability[0].capabilityName);
    return null;
  }

  return (
    <Flex.Column justify="flex-start" gap=".5rem" height="100%" width="100%">
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

      <Flex.Row
        height="85%"
        width="100%"
        style={{ overflow: 'hidden', overflowX: 'scroll' }}
      >
        <CapabilityDetailTable capabilityList={selectedCapabilityDetail} />
      </Flex.Row>
    </Flex.Column>
  );
};

export default CapabilityDetailContent;

const S = {
  CategoryOptions: styled(Flex.Row)`
    height: fit-content;
    overflow: hidden;
    overflow-x: scroll;
    width: 100%;
  `,
};


