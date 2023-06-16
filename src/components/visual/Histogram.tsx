import { alpha, Skeleton, useTheme } from '@mui/material';
import { CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement, Title, Tooltip, TimeScale } from 'chart.js';
import 'chartjs-adapter-moment';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, TimeScale);

type TooltipVertLinePluginConfig = {
  color: string;
  display: boolean;
  yAxis: string;
};

type HorizontalLinePluginConfig = {
  color: string;
  display: boolean;
  xAxis: string;
};

const plugins = [
  {
    id: 'vLineTooltip',
    afterDraw: (chart, args, cfg: TooltipVertLinePluginConfig) => {
      // @ts-ignore
      if (cfg.display && chart.tooltip?._active?.length) {
        // @ts-ignore
        let selected = chart.tooltip._active[0].element.x;
        let axis = chart.scales[cfg.yAxis || 'yAxis'];
        if (axis) {
          let ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(selected, axis.top);
          ctx.lineTo(selected, axis.bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = cfg.color || '#AAA';
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  },
  {
    id: 'hLineTooltip',
    afterDraw: (chart, args, cfg: HorizontalLinePluginConfig) => {
      // @ts-ignore
      if (cfg.display && chart.tooltip?._active?.length) {
        // @ts-ignore
        let selected = chart.tooltip._active[0].element.y;
        let axis = chart.scales[cfg.xAxis || 'xAxis'];
        if (axis) {
          let ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(axis.right, selected);
          ctx.lineTo(axis.left, selected);
          ctx.lineWidth = 2;
          ctx.strokeStyle = cfg.color || '#AAA';
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
];

type HistogramProps = {
  dataset: { [s: string]: number };
  datatype: string;
  title?: string;
  height?: string;
  isDate?: boolean;
  titleSize?: number;
  onClick?: (event: any, element: any) => void;
  verticalLine?: boolean;
  horizontalLine?: boolean;
};

const WrappedHistogram = ({
  dataset,
  height,
  title,
  datatype,
  onClick,
  isDate = false,
  titleSize = 14,
  verticalLine = false,
  horizontalLine = false
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
      vLineTooltip: {
        display: verticalLine,
        color: alpha(theme.palette.primary.main, 0.3)
      },
      hLineTooltip: {
        display: horizontalLine,
        color: alpha(theme.palette.primary.main, 0.3)
      }
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
            yAxisID: 'yAxis',
            xAxisID: 'xAxis'
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
    <Skeleton variant="rectangular" height={height} />
  );
};

WrappedHistogram.defaultProps = {
  title: null,
  height: null,
  isDate: false
};

const Histogram = React.memo(WrappedHistogram);
export default Histogram;
