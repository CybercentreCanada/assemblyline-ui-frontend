import { Divider, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
} from 'chart.js';
import 'chartjs-adapter-moment';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
);

const useStyles = makeStyles(theme => ({
  root: {
    width: '160px',
    height: '160px',
    aspectRatio: 1,
    position: 'relative'
  },
  container: {
    display: 'grid',
    placeItems: 'center'
  },
  paper: {
    height: '125px',
    width: '125px',
    position: 'absolute',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50%',
    filter: 'drop-shadow(0px 0px 10px black)'
  },
  canvas: {
    borderRadius: '50%',
    border: `1px solid ${theme.palette.divider}`
  },
  verdictContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    display: 'grid',
    placeItems: 'center'
  },
  verdictItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1fr, 3)',
    gridTemplateRows: 'repeat(1fr, 3)',
    justifyItems: 'center',
    columnGap: theme.spacing(1)
  },
  maliciousText: {
    color: theme.palette.mode === 'light' ? theme.palette.error.light : theme.palette.error.dark
  },
  suspiciousText: {
    color: theme.palette.mode === 'light' ? theme.palette.warning.light : theme.palette.warning.dark
  },
  infoText: {
    color: theme.palette.mode === 'light' ? '#AAA' : '#888'
  },
  chip: {},
  wrapper: {
    display: 'grid',
    justifyItems: 'center',
    alignItems: 'center',
    columnGap: theme.spacing(1)
  },
  divider: {
    width: '100%',
    gridColumn: 'span 3',
    backgroundColor: theme.palette.mode === 'light' ? '#AAA' : '#888'
  }
}));

type Props = {
  verdicts?: {
    malicious?: number;
    highly_suspicious?: number;
    suspicious?: number;
    safe?: number;
    info?: number;
  };
};

const WrappedVerdictDoughnut: React.FC<Props> = ({ verdicts }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const classes = useStyles();

  const isDark = useMemo<boolean>(() => theme.palette.mode === 'dark', [theme]);

  const data = useMemo<ChartData<'doughnut'>>(
    () => ({
      labels: [t('info'), t('suspicious'), t('malicious')],
      datasets: [
        {
          data: !verdicts
            ? [1, 0, 0]
            : ['info', 'suspicious', 'malicious'].map(v => (Object.keys(verdicts).includes(v) ? verdicts[v] : 0)),
          backgroundColor: [
            isDark ? '#616161' : '#999',
            isDark ? '#ed8b00' : '#ff9d12',
            isDark ? theme.palette.error.dark : theme.palette.error.light
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            isDark ? '#616161' : '#999',
            isDark ? '#ed8b00' : '#ff9d12',
            isDark ? theme.palette.error.dark : theme.palette.error.light
          ]
        }
      ]
    }),
    [isDark, t, theme, verdicts]
  );

  const options = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: { enabled: false },
        hover: { mode: null }
      },
      datasets: { doughnut: { borderWidth: 0, spacing: 0 } },
      cutout: '80%'
    }),
    []
  );

  return (
    <div className={classes.root}>
      {verdicts ? (
        <div className={classes.container}>
          <Doughnut className={classes.canvas} data={data} options={options} />
          <div className={classes.paper}>
            <div className={classes.wrapper}>
              <Typography
                className={classes.maliciousText}
                variant="h4"
                fontWeight="bolder"
                children={`${verdicts.malicious}`}
              />
              <Typography className={classes.infoText} variant="h5" fontWeight="bolder" children={'-'} />
              <Typography
                className={classes.suspiciousText}
                variant="h4"
                fontWeight="bolder"
                children={`${verdicts.highly_suspicious + verdicts.suspicious}`}
              />
              <Divider className={classes.divider} />
              <Typography
                className={classes.infoText}
                variant="h5"
                fontWeight="bolder"
                gridColumn="span 3"
                children={`${Object.entries(verdicts)
                  .map(([k, v]) => v)
                  .reduce((a, v) => a + v)}`}
              />
            </div>
          </div>
        </div>
      ) : (
        <Skeleton variant="circular" width="100%" height="100%" />
      )}
    </div>
  );
};

export const VerdictDoughnut = React.memo(WrappedVerdictDoughnut);
export default VerdictDoughnut;
