import { RadarChart } from '@/components';
import { useGetUserInfoQuery } from '@/pages/auth/hooks';
import {
  CapabilityResponse,
  CompareCapabilityResponse,
  RadarCapability,
} from '@/pages/dashboard/types/capability';

import {
  useGetCompareCapabilityQuery,
  useGetCapabilityQuery,
} from '@/pages/dashboard/hooks';

export const RadarChartSectionContent = ({
  compareOption,
}: {
  compareOption: string[];
}) => {
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

  const capabilityData: RadarCapability[] = capability.map(
    (cap: CapabilityResponse) => {
      const matchedCompare = compareCapability.find(
        (other: CompareCapabilityResponse) =>
          other.capabilityId === cap.capabilityId,
      );

      return {
        capabilityId: cap.capabilityId,
        capabilityName: cap.capabilityName,
        '나의 마일리지': cap.milestoneCount,
        '비교 대상 평균 마일리지': matchedCompare?.averageMilestoneCount ?? 0,
      };
    },
  );

  const safeData = capabilityData.filter(row =>
    Number.isFinite(row['나의 마일리지'] as number) &&
    Number.isFinite(row['비교 대상 평균 마일리지'] as number),
  );

  if (safeData.length === 0) return null;
  return (
    <RadarChart
      data={safeData}
      keys={['나의 마일리지', '비교 대상 평균 마일리지']}
    />
  );
};

