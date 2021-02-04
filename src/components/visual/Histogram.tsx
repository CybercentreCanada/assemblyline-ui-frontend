import { useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-3';

type HistogramProps = {
  data: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  title?: string;
  height?: number;
  isDate?: boolean;
};

const WrappedHistogram = ({ data, height, title, isDate }: HistogramProps) => {
  const theme = useTheme();
  const [max, setMax] = useState(5);

  useEffect(() => {
    if (data) {
      let maxValue = max;
      data.datasets.forEach(dataset => {
        maxValue = Math.max(maxValue, ...Object.values<number>(dataset.data));
      });
      setMax(maxValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return data ? (
    <Line
      data={data}
      legend={{ display: false }}
      height={height}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [
            {
              gridLines: { display: false, drawBorder: true },
              ticks: { fontColor: theme.palette.text.secondary },
              time: isDate ? { unit: 'day' } : null,
              type: isDate ? 'time' : null
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                max,
                fontColor: theme.palette.text.secondary,
                precision: 0
              }
            }
          ]
        },
        title: title
          ? {
              display: true,
              text: title,
              fontColor: theme.palette.text.primary,
              fontFamily: 'Roboto',
              fontSize: 14
            }
          : null
      }}
    />
  ) : (
    <Skeleton variant="rect" height={height} />
  );
};

WrappedHistogram.defaultProps = {
  title: null,
  height: null,
  isDate: false
};

const Histogram = React.memo(WrappedHistogram);
export default Histogram;
