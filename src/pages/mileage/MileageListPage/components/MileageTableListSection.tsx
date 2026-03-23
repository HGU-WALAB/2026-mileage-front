import { Flex, TableListSkeleton, Title } from '@/components';
import { EmptyMileageTable, MileageTable } from '.';
import { useGroupedMileageList } from '@/pages/mileage/hooks';

const MileageTableListSection = () => {
  const { groupedMileageList, isLoading } = useGroupedMileageList();

  if (isLoading) return <TableListSkeleton />;
  if (!groupedMileageList.length) return <EmptyMileageTable />;

  return (
    <>
      {groupedMileageList.map(list => (
        <Flex.Column padding="1rem 0" key={list.categoryId}>
          <Title label={list.categoryName} />
          <MileageTable key={list.categoryId} mileageList={list.items} />
        </Flex.Column>
      ))}
    </>
  );
};

export default MileageTableListSection;
