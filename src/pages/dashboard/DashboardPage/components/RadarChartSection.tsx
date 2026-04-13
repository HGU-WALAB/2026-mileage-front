import { LoadingIcon } from '@/assets';
import { ErrorBox, Flex, Heading, RadarChart, Text } from '@/components';
import { useGetUserInfoQuery } from '@/pages/auth/hooks';
import { boxShadow } from '@/styles/common';
import { RadarCapability } from '@/pages/dashboard/types/capability';
import { styled, useTheme } from '@mui/material';
import { useState } from 'react';

import CompareOptionButtonSection from './CompareOptionButtonSection';
import { useGetCompareCapabilityQuery, useGetCapabilityQuery } from '@/pages/dashboard/hooks';

const finiteOrZero = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

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
  const theme = useTheme();
  const { data: userInfo } = useGetUserInfoQuery();
  const {
    data: capability,
    isLoading,
    isError,
    error,
  } = useGetCapabilityQuery();

  const selectedTerm =
    compareOption.includes('term') &&
    userInfo?.term != null &&
    Number.isFinite(userInfo.term)
      ? String(userInfo.term)
      : undefined;
  const selectedEntryYear =
    compareOption.includes('entryYear') &&
    typeof userInfo?.studentId === 'string' &&
    /^\d{2}/.test(userInfo.studentId)
      ? userInfo.studentId.slice(0, 2)
      : undefined;
  const selectedMajor =
    compareOption.includes('major') && userInfo?.major1?.trim()
      ? userInfo.major1.trim()
      : undefined;

  const {
    data: compareCapability,
    isLoading: isCompareLoading,
    isError: isCompareError,
    error: compareError,
  } = useGetCompareCapabilityQuery({
    term: selectedTerm,
    entryYear: selectedEntryYear,
    major: selectedMajor,
  });

  const capabilityData: RadarCapability[] = (capability ?? [])
    .filter(cap => typeof cap.capabilityName === 'string' && cap.capabilityName.trim().length > 0)
    .map(cap => {
      const matchedCompare = compareCapability?.find(
        other => other.capabilityId === cap.capabilityId,
      );

      return {
        capabilityId: cap.capabilityId,
        capabilityName: cap.capabilityName,
        '나의 마일리지': finiteOrZero(cap.milestoneCount),
        '비교 대상 평균 마일리지': finiteOrZero(matchedCompare?.averageMilestoneCount),
      };
    });

  if (isLoading || isCompareLoading) return <LoadingIcon width={100} height={100} />;
  if (isError) return <ErrorBox error={error} />;
  if (isCompareError) return <ErrorBox error={compareError} />;
  if (capabilityData.length === 0) {
    return (
      <Text style={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
        표시할 역량 비교 데이터가 없습니다.
      </Text>
    );
  }
  return (
    <RadarChart
      data={capabilityData}
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
