import { useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

type LineGraphProps = {
  dataset: { [s: string]: number };
  datatype: string;
  title?: string;
  height?: string;
  titleSize?: number;
  onClick?: (event: any, element: any) => void;
  sorter?: (a: any, b: any) => number;
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
      let labels = Object.keys(dataset);
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
      <Bar data={barData} options={options} />
    </div>
  ) : (
    <Skeleton variant="rect" height={height} />
  );
}

const LineGraph = React.memo(WrappedLineGraph);
export default LineGraph;
