import { useQueryParams } from '@/hooks';
import { useCallback } from 'react';

const useFilteredByKeyword = () => {
  const { queryParams, updateQueryParams } = useQueryParams();
  const keyword = queryParams.keyword;

  const setKeyword = useCallback(
    (newKeyword: string) => {
      updateQueryParams({ keyword: newKeyword });
    },
    [updateQueryParams],
  );

  return { keyword, setKeyword };
};

export default useFilteredByKeyword;
