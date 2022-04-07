import { useTheme } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles/colorManipulator';
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
  verticalLine?: boolean;
};

const WrappedHistogram = ({
  dataset,
  height,
  title,
  datatype,
  onClick,
  isDate = false,
  titleSize = 14,
  verticalLine = false
}: HistogramProps) => {
  const theme = useTheme();
  const [max, setMax] = useState(5);
  const [histData, setHistData] = useState(null);
  const options = {
    datasets: { line: { tension: 0.4, fill: 'origin' } },
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      mode: 'index' as 'index',
      intersect: !verticalLine
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
      legend: { display: false },
      tooltipVertLine: verticalLine
    },
    scales: {
      xAxis: {
        grid: { display: false, drawBorder: true },
        ticks: {
          color: theme.palette.text.secondary
        },
        time: isDate
          ? {
              unit: 'day' as 'day',
              tooltipFormat:
                dataset && Object.keys(dataset).every(val => val.indexOf('T00:00:00.000Z') !== -1)
                  ? 'YYYY-MM-DD'
                  : 'YYYY-MM-DD HH:mm:ss',
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
      yAxis: {
        beginAtZero: true,
        suggestedMax: max,
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0
        }
      }
    },
    onClick: onClick
  };

  const plugins = [
    {
      id: 'tooltipVertLine',
      afterDraw: chart => {
        // @ts-ignore
        if (chart.tooltip?._active?.length) {
          // @ts-ignore
          let x = chart.tooltip._active[0].element.x;
          let yAxis = chart.scales.yAxis;
          let ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, yAxis.top);
          ctx.lineTo(x, yAxis.bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = alpha(theme.palette.primary.main, 0.3);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  ];

  useEffect(() => {
    if (dataset) {
      const labels = Object.keys(dataset).every(val => val.indexOf('T00:00:00.000Z') !== -1)
        ? Object.keys(dataset).map((key: string) => key.replace('T00:00:00.000Z', ''))
        : Object.keys(dataset);

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
            hoverBackgroundColor: theme.palette.primary.main,
            yAxisID: 'yAxis'
          }
        ]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, theme]);

  return histData ? (
    <div style={{ height: height }}>
      <Line data={histData} options={options} plugins={plugins} />
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
