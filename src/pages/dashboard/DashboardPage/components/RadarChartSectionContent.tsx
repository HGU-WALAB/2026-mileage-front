import { RadarChart, Text } from '@/components';
import { useGetUserInfoQuery } from '@/pages/auth/hooks';
import { useTheme } from '@mui/material';
import {
  CapabilityResponse,
  CompareCapabilityResponse,
  RadarCapability,
} from '@/pages/dashboard/types/capability';

import {
  useGetCompareCapabilityQuery,
  useGetCapabilityQuery,
} from '@/pages/dashboard/hooks';

const finiteOrZero = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

export const RadarChartSectionContent = ({
  compareOption,
}: {
  compareOption: string[];
}) => {
  const theme = useTheme();
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: capability = [] as CapabilityResponse[] } =
    useGetCapabilityQuery();

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
    data: compareCapability = [] as CompareCapabilityResponse[],
  } = useGetCompareCapabilityQuery({
    term: selectedTerm,
    entryYear: selectedEntryYear,
    major: selectedMajor,
  });

  const capabilityData: RadarCapability[] = capability
    .filter(
      (cap: CapabilityResponse) =>
        typeof cap.capabilityName === 'string' && cap.capabilityName.trim().length > 0,
    )
    .map((cap: CapabilityResponse) => {
      const matchedCompare = compareCapability.find(
        (other: CompareCapabilityResponse) =>
          other.capabilityId === cap.capabilityId,
      );

      return {
        capabilityId: cap.capabilityId,
        capabilityName: cap.capabilityName,
        '나의 마일리지': finiteOrZero(cap.milestoneCount),
        '비교 대상 평균 마일리지': finiteOrZero(matchedCompare?.averageMilestoneCount),
      };
    });

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

