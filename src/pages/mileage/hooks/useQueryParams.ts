import { ALL_SEMESTER } from '@/constants/system';
import { MileageRequest } from '@/pages/mileage/types/mileage';
import useAuthStore from '@/stores/useAuthStore';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSemester = useAuthStore(s => s.currentSemester);

  const getQueryParams = useCallback((): Omit<MileageRequest, 'studentId'> => {
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');
    const semesterParam = searchParams.get('semester');
    const done = searchParams.get('done');

    const defaultSemester =
      currentSemester.trim() !== '' ? currentSemester : ALL_SEMESTER;

    return {
      keyword: keyword || '',
      category: category || '',
      semester: semesterParam || defaultSemester,
      done: done || 'all',
    };
  }, [searchParams, currentSemester]);

  const updateQueryParams = useCallback(
    (updates: Partial<MileageRequest>) => {
      const current = getQueryParams();
      const newParams = { ...current, ...updates };

      const cleanParams = new URLSearchParams();

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          cleanParams.set(key, value.toString());
        } else {
          cleanParams.delete(key);
        }
      });

      setSearchParams(cleanParams);
    },
    [setSearchParams, getQueryParams],
  );

  return { queryParams: getQueryParams(), updateQueryParams };
};

export default useQueryParams;
