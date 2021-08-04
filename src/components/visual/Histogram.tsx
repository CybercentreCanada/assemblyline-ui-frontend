import { useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import 'chartjs-adapter-moment';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

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
  const [histData, setHistData] = useState(null);
  const options = {
    datasets: { line: { tension: 0.4, fill: 'origin' } },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: title
        ? {
            display: true,
            text: title,
            color: theme.palette.text.primary,
            font: { family: 'Roboto', size: 14 }
          }
        : null,
      legend: { display: false }
    },
    scales: {
      xAxis: {
        axis: 'x',
        grid: { display: false, drawBorder: true },
        ticks: {
          color: theme.palette.text.secondary
        },
        time: isDate ? { unit: 'day' } : null,
        type: isDate ? 'time' : null
      },
      yAxis: {
        axis: 'y',
        beginAtZero: true,
        suggestedMax: max,
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0
        }
      }
    }
  };

  useEffect(() => {
    if (data) {
      const tempDatasets = [];
      let maxValue = max;

      data.datasets.forEach(dataset => {
        maxValue = Math.max(maxValue, ...Object.values<number>(dataset.data));
        tempDatasets.push({
          ...dataset,
          backgroundColor: theme.palette.primary.dark,
          borderColor: theme.palette.primary.light,
          borderWidth: 1,
          hoverBackgroundColor: theme.palette.primary.main
        });
      });

      setMax(maxValue);
      setHistData({ ...data, datasets: tempDatasets });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, theme]);

  return histData ? (
    <Line data={histData} height={height} options={options} />
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
