import { Skeleton, useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import 'chart.js/auto';
import { memo, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type LineGraphProps = {
  dataset: Record<string, number>;
  datatype: string;
  title?: string;
  height?: string;
  titleSize?: number;
  onClick?: (event: unknown, element: unknown) => void;
  sorter?: (a: string, b: string) => number;
};

function WrappedLineGraph({ dataset, height, title, datatype, onClick, sorter, titleSize = 14 }: LineGraphProps) {
  const theme = useTheme();
  const [max, setMax] = useState(5);
  const [barData, setBarData] = useState(null);
  const options = {
    datasets: { line: { tension: 0.4, fill: 'origin' } },
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      mode: 'x' as const,
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
        }
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
  };

  useEffect(() => {
    if (dataset) {
      const labels = Object.keys(dataset);
      let data = Object.values(dataset);

      if (sorter) {
        labels.sort(sorter);
        data = labels.map(k => dataset[k]);
      }

      setMax(Math.max(5, ...Object.values<number>(dataset)));
      setBarData({
        labels,
        datasets: [
          {
            label: datatype,
            data,
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

  return barData ? (
    <div style={{ height: height }}>
      <Bar data={barData} options={options as unknown} />
    </div>
  ) : (
    <Skeleton variant="rectangular" height={height} />
  );
}

export const LineGraph = memo(WrappedLineGraph);

LineGraph.displayName = 'LineGraph';
