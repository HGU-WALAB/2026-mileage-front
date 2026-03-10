import { useCallback } from 'react';

import { useQueryParams } from '../hooks/useQueryParams';

export const useFilteredByKeyword = () => {
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
