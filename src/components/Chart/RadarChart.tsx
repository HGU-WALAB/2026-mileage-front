import { RadarCapability } from '@/pages/dashboard/types/capability';
import { styled, useTheme } from '@mui/material';
import { ResponsiveRadar } from '@nivo/radar';

const RadarChart = ({
  data,
  keys = ['mileagePercent'],
}: {
  data: RadarCapability[];
  keys?: string[];
}) => {
  const theme = useTheme();
  const colors =
    keys.length >= 2
      ? [theme.palette.primary.main, theme.palette.secondary.main]
      : [theme.palette.primary.main];

  return (
    <S.RadarChartWrapper>
      <ResponsiveRadar
        data={data}
        maxValue="auto"
        keys={keys}
        indexBy="capabilityName"
        margin={{ top: 60, right: 50, bottom: 50, left: 50 }}
        borderColor={{ from: 'color', modifiers: [] }}
        gridLabelOffset={20}
        dotSize={5}
        dotBorderWidth={2}
        colors={colors}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={
          keys.length >= 2
            ? [
                {
                  anchor: 'bottom-left',
                  direction: 'column',
                  translateX: -40,
                  translateY: -60,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: '#999',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000',
                      },
                    },
                  ],
                },
              ]
            : []
        }
        sliceTooltip={point => (
          <div
            style={{
              background: 'white',
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <strong>역량: </strong>
            {point.data.map(d => (
              <p key={String(d.id)}>
                {d.id} : {Number(d.value).toFixed(0)}
              </p>
            ))}
          </div>
        )}
      />
    </S.RadarChartWrapper>
  );
};

export default RadarChart;

const S = {
  RadarChartWrapper: styled('div')`
    height: 120%;
    width: 100%;
  `,
};
