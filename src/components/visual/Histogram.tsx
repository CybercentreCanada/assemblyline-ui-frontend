import { useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import 'chartjs-adapter-moment';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

type HistogramProps = {
  dataset: { [s: string]: number };
  datatype: string;
  title?: string;
  height?: string;
  isDate?: boolean;
  titleSize?: number;
  onClick?: (event: any, element: any) => void;
};

const WrappedHistogram = ({ dataset, height, title, isDate, datatype, onClick, titleSize = 14 }: HistogramProps) => {
  const theme = useTheme();
  const [max, setMax] = useState(5);
  const [histData, setHistData] = useState(null);
  const [options, setOptions] = useState({
    datasets: { line: { tension: 0.4, fill: 'origin' } },
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      mode: 'x' as 'x',
      intersect: false
    },
    plugins: {
      title: title
        ? {
            display: true,
            text: title,
            color: theme.palette.text.primary,
            font: { family: 'Roboto', size: titleSize, weight: '500' }
          }
        : null,
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: true },
        ticks: {
          color: theme.palette.text.secondary
        },
        time: isDate
          ? {
              unit: 'day' as 'day',
              tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
              displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'HH'
              }
            }
          : null,
        type: isDate ? ('time' as 'time') : ('linear' as 'linear')
      },
      y: {
        beginAtZero: true,
        suggestedMax: max,
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0
        }
      }
    },
    onClick: onClick
  });

  useEffect(() => {
    if (dataset) {
      const allDays = Object.keys(dataset).every(val => val.indexOf('T00:00:00.000Z') !== -1);
      const labels = allDays
        ? Object.keys(dataset).map((key: string) => key.replace('T00:00:00.000Z', ''))
        : Object.keys(dataset);

      if (allDays && isDate) {
        options.scales.x.time.tooltipFormat = 'YYYY-MM-DD';
        setOptions(options);
      } else {
        options.scales.x.time.tooltipFormat = 'YYYY-MM-DD HH:mm:ss';
        setOptions(options);
      }

      setMax(Math.max(5, ...Object.values<number>(dataset)));
      setHistData({
        labels,
        datasets: [
          {
            label: datatype,
            data: Object.values(dataset),
            backgroundColor: theme.palette.primary.dark,
            borderColor: theme.palette.primary.light,
            borderWidth: 1,
            hoverBackgroundColor: theme.palette.primary.main
          }
        ]
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, theme]);

  return histData ? (
    <div style={{ height: height }}>
      <Line data={histData} options={options} />
    </div>
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
