import { useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { Line } from 'react-chartjs-3';

export type Heuristic = {
  attack_id: string[];
  avg: number;
  classification: string;
  count: number;
  description: string;
  filetype: string;
  heur_id: string;
  max: number;
  max_score: number;
  min: number;
  name: string;
  score: number;
  signature_score_map: {
    [key: string]: number;
  };
};

type ScoreStatistic = {
  avg: number;
  min: number;
  max: number;
  count: number;
  sum: number;
};

type ParamProps = {
  id: string;
};

type HistogramProps = {
  data: {
    labels: string[];
    datasets: object[];
  };
  title?: string;
  max?: number;
  height?: number;
  isDate?: boolean;
};

const WrappedHistogram = ({ data, max, height, title, isDate }: HistogramProps) => {
  const theme = useTheme();

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
              ticks: { beginAtZero: true, max, fontColor: theme.palette.text.secondary, precision: 0 }
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
    <Skeleton style={{ height: '150px' }} />
  );
};

WrappedHistogram.defaultProps = {
  max: 5,
  title: null,
  height: null,
  isDate: false
};

const Histogram = React.memo(WrappedHistogram);
export default Histogram;
