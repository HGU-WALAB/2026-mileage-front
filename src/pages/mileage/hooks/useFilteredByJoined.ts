import { filterJoinedItems } from '@/pages/mileage/constants/filterItems';
import { useQueryParams } from '.';
import { TabItem } from '@/types/tab';

const useFilteredByJoined = () => {
  const { queryParams, updateQueryParams } = useQueryParams();
  const selectedValue = queryParams.done ?? 'Y';

  const selectedJoined =
    filterJoinedItems.find(item => item.value === selectedValue) ||
    filterJoinedItems.find(item => item.value === 'Y') ||
    filterJoinedItems[0];

  const setSelectedJoined = (isJoined: TabItem) => {
    if (isJoined === selectedJoined) {
      resetSelected();

      return;
    }

    updateQueryParams({ done: isJoined.value });
  };

  const resetSelected = () => {
    updateQueryParams({ done: 'all' });
  };

  return { selectedJoined, setSelectedJoined };
};

export default useFilteredByJoined;
