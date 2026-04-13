import EmptyBoxImg from '@/assets/imgs/emptyBox.svg?react';
import Flex from '@/components/Flex/Flex';
import Heading from '@/components/Heading/Heading';
import { SemesterCapabilityResponse } from '@/pages/dashboard/types/capability';
import { useTheme } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';

const toFiniteCount = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const LineChart = ({
  data,
  emptyTitle = '학기별 마일리지 데이터가 없습니다',
}: {
  data: SemesterCapabilityResponse[];
  emptyTitle?: string;
}) => {
  const theme = useTheme();
  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (row): row is SemesterCapabilityResponse =>
          typeof row?.semester === 'string' && row.semester.trim().length > 0,
      ),
    [data],
  );

  const formattedData = useMemo(
    () => [
      {
        id: 'Capability Points',
        data: rows.map(capability => ({
          x: capability.semester,
          y: toFiniteCount(capability.userMilestoneCount),
        })),
      },
    ],
    [rows],
  );

  if (rows.length === 0) {
    return (
      <Flex.Column
        width="100%"
        height="100%"
        justify="center"
        align="center"
        gap="0.75rem"
        style={{ minHeight: 180 }}
      >
        <EmptyBoxImg width={72} height={72} />
        <Heading as="h3" style={{ color: theme.palette.grey300 }}>
          {emptyTitle}
        </Heading>
      </Flex.Column>
    );
  }

  const yValues = rows.map(r => toFiniteCount(r.userMilestoneCount));
  const maxY = Math.max(1, ...yValues);

  return (
    <ResponsiveLine
      data={formattedData}
      margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 0,
        max: maxY,
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="linear"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        truncateTickAt: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        truncateTickAt: 0,
      }}
      colors={[theme.palette.primary.main]}
      pointSize={5}
      pointBorderWidth={2}
      pointLabel="data.yFormatted"
      pointLabelYOffset={-12}
      enableArea={true}
      areaBaselineValue={0}
      enableTouchCrosshair={true}
      useMesh={true}
      tooltip={point => {
        return (
          <div
            style={{
              background: 'white',
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <strong>마일리지 건수: </strong>
            {String(point.point.data.y ?? 0)}건
          </div>
        );
      }}
    />
  );
};

export default LineChart;
