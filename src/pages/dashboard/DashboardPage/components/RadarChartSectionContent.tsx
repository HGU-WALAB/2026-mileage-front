import { RadarChart } from '@/components';
import { useGetUserInfoQuery } from '@/hooks/queries';
import { RadarCapability } from '@/pages/dashboard/types/capability';

import { useGetCompareCapabilityQuery, useGetCapabilityQuery } from '@/pages/dashboard/hooks';

export const RadarChartSectionContent = ({
  compareOption,
}: {
  compareOption: string[];
}) => {
  const { data: userInfo } = useGetUserInfoQuery();
  const { capability = [] } = useGetCapabilityQuery();

  const { compareCapability = [] } = useGetCompareCapabilityQuery({
    term: compareOption.includes('term') ? `${userInfo?.term}` : '',
    entryYear: compareOption.includes('entryYear')
      ? userInfo?.studentId?.slice(1, 3) || ''
      : '',
    major: compareOption.includes('major') ? userInfo?.major1 || '' : '',
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
      // ver1에서는 퍼센트 스케일링(예: * 1.5) 없이 "그대로" 표시
      '나의 마일리지': myMileagePercent,
      '비교 대상 평균 마일리지': otherMileagePercent,
    };
  });

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

