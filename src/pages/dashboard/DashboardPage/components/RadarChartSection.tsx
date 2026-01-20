import { LoadingIcon } from '@/assets';
import { ErrorBox, Flex, Heading, RadarChart } from '@/components';
import { useGetUserInfoQuery } from '@/hooks/queries';
import { boxShadow } from '@/styles/common';
import { RadarCapability } from '@/pages/dashboard/types/capability';
import { styled } from '@mui/material';
import { useState } from 'react';

import CompareOptionButtonSection from './CompareOptionButtonSection';
import { useGetCompareCapabilityQuery, useGetCapabilityQuery } from '@/pages/dashboard/hooks';

const RadarChartSection = () => {
  const [compareOption, setCompareOption] = useState<string[]>([]);

  return (
    <S.Container height="300px" width="100%" padding="1rem" gap="1rem">
      <Flex width="100%" justify="space-between" align="center" wrap="wrap">
        <Heading as="h3">나의 역량 비교 그래프</Heading>

        <CompareOptionButtonSection
          compareOption={compareOption}
          setCompareOption={setCompareOption}
        />
      </Flex>
      {/* ver2처럼 차트 영역을 70%로 제한해서 legend/차트가 카드 밖으로 튀지 않게 유지 */}
      <Flex height="70%" width="100%" justify="center" align="center">
        <ChartSection compareOption={compareOption} />
      </Flex>
    </S.Container>
  );
};

export default RadarChartSection;

const ChartSection = ({ compareOption }: { compareOption: string[] }) => {
  const { data: userInfo } = useGetUserInfoQuery();
  const {
    data: capability,
    isLoading,
    isError,
    error,
  } = useGetCapabilityQuery();

  const {
    data: compareCapability,
    isLoading: isCompareLoading,
    isError: isCompareError,
    error: compareError,
  } = useGetCompareCapabilityQuery({
    term: compareOption.includes('term') ? `${userInfo?.term}` : undefined,
    entryYear: compareOption.includes('entryYear')
      ? userInfo?.studentId?.slice(1, 3)
      : undefined,
    major: compareOption.includes('major') ? userInfo?.major1 : undefined,
  });

  const capabilityData: RadarCapability[] = (capability ?? []).map(cap => {
    const matchedCompare = compareCapability?.find(
      other => other.capabilityId === cap.capabilityId,
    );

    const denominator =
      typeof cap.totalMilestoneCount === 'number' && cap.totalMilestoneCount > 0
        ? cap.totalMilestoneCount
        : 1;

    const myMileagePercent = (cap.milestoneCount / denominator) * 100;
    const otherMileagePercent = matchedCompare
      ? (matchedCompare.averageMilestoneCount / denominator) * 100
      : 0;

    return {
      capabilityId: cap.capabilityId,
      capabilityName: cap.capabilityName,
      '나의 마일리지':
        cap.capabilityId === 1 ? myMileagePercent : myMileagePercent * 1.5,
      '비교 대상 평균 마일리지':
        cap.capabilityId === 1
          ? otherMileagePercent
          : otherMileagePercent * 1.5,
    };
  });

  const safeData = capabilityData.filter(row =>
    Number.isFinite(row['나의 마일리지'] as number) &&
    Number.isFinite(row['비교 대상 평균 마일리지'] as number),
  );

  if (isLoading || isCompareLoading) return <LoadingIcon width={100} height={100} />;
  if (isError) return <ErrorBox error={error} />;
  if (isCompareError) return <ErrorBox error={compareError} />;
  if (safeData.length === 0) return null;
  return (
    <RadarChart
      data={safeData}
      keys={['나의 마일리지', '비교 대상 평균 마일리지']}
    />
  );
};

const S = {
  Container: styled(Flex.Column)`
    background-color: ${({ theme }) => theme.palette.variant.default};
    border-radius: 1rem;
    ${boxShadow}
  `,
};
