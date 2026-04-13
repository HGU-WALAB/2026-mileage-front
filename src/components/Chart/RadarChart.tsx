import { RadarCapability } from '@/pages/dashboard/types/capability';
import { styled, useTheme } from '@mui/material';
import { ResponsiveRadar } from '@nivo/radar';
import { useMemo } from 'react';

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

  const maxValue = useMemo(() => {
    let max = 0;
    for (const row of data) {
      for (const key of keys) {
        const raw = row[key];
        const n = typeof raw === 'number' ? raw : Number(raw);
        if (Number.isFinite(n)) max = Math.max(max, n);
      }
    }
    return max > 0 ? max * 1.05 : 1;
  }, [data, keys]);

  return (
    <S.RadarChartWrapper>
      <ResponsiveRadar
        data={data}
        maxValue={maxValue}
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
                {d.id} : {Number.isFinite(Number(d.value)) ? Number(d.value).toFixed(0) : '0'}
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
