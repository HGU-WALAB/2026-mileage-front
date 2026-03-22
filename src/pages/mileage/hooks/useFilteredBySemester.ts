import { ALL_SEMESTER } from '@/constants/system';
import { useMemo } from 'react';

import useGetMileageQuery from './useGetMileageQuery';
import useQueryParams from './useQueryParams';

const useFilteredBySemester = () => {
  const { queryParams, updateQueryParams } = useQueryParams();
  const selectedSemester = queryParams.semester;

  const { data: mileageList, isLoading } = useGetMileageQuery({});

  const semesterList = useMemo(
    () => [
      ALL_SEMESTER,
      ...Array.from(new Set(mileageList?.map(item => item.semester))).sort(
        (a, b) => b.localeCompare(a),
      ),
    ],
    [mileageList],
  );

  const setSelectedSemester = (newSemester: string) => {
    updateQueryParams({ semester: newSemester });
  };

  return { semesterList, isLoading, selectedSemester, setSelectedSemester };
};

export default useFilteredBySemester;
