import { Avatar, Icon, LinearProgress, StepIcon, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';

const useStyles = makeStyles(theme => ({
  main: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyItems: 'center'
  },
  item: {
    position: 'relative',
    flexDirection: 'column',
    flex: '1',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  label: {
    marginTop: theme.spacing(2)
  },
  icon: {
    height: theme.spacing(4),
    width: theme.spacing(4),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)'
  },
  completed: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  percentageContainer: {
    position: 'absolute',
    top: '14px',
    left: 'calc(-50% + 22px)',
    right: 'calc(50% + 22px)',
    textAlign: 'center'
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}));

type Step = {
  label?: string;
  icon?: React.ReactNode;
};

type Props = {
  steps?: Step[];
  loading?: boolean;
  activeStep?: number;
  percentage?: number;
};

const WrappedSteppedPercentage: React.FC<Props> = ({
  steps = [],
  loading = false,
  activeStep = 0,
  percentage: percentageProp = 0
}) => {
  const theme = useTheme();
  const classes = useStyles();

  const percentage = useMemo(() => Math.min(Math.max(percentageProp, 0), 100), [percentageProp]);

  const StepComponent = useCallback<React.FC<{ step: Step; index: number; loading?: boolean; completed?: boolean }>>(
    (prop = { step: null, index: 0, loading: false, completed: false }) => (
      <span className={classes.labelContainer}>
        {'icon' in prop.step ? (
          <Avatar className={clsx(classes.icon, !prop.loading && prop.completed && classes.completed)}>
            <Icon children={prop.step.icon} />
          </Avatar>
        ) : (
          <StepIcon
            icon={prop.index}
            active
            completed={prop.completed}
            sx={{ height: theme.spacing(4), width: theme.spacing(4) }}
          />
        )}
        {'label' in prop.step ? (
          <Typography className={classes.label} children={prop.step.label} variant="subtitle2" />
        ) : null}
      </span>
    ),
    [classes, theme]
  );

  const PercentageComponent = useCallback<React.FC<{ percentage: number; loading?: boolean }>>(
    (prop = { percentage: 0, loading: false }) => (
      <span className={classes.percentageContainer}>
        <LinearProgress variant={prop.loading ? 'indeterminate' : 'determinate'} value={prop.percentage} />
        {!prop.loading && 0 < prop.percentage && prop.percentage < 100 ? (
          <Typography variant="subtitle2">{`${prop.percentage}%`}</Typography>
        ) : null}
      </span>
    ),
    [classes]
  );

  if (steps && Array.isArray(steps) && steps.length >= 1)
    return (
      <div className={classes.main}>
        <div className={classes.item}>
          <StepComponent step={steps[0]} index={0} loading={loading} completed={0 <= activeStep} />
        </div>
        {steps.slice(1).map((step, i) => (
          <div key={i} className={classes.item}>
            <PercentageComponent
              percentage={i < activeStep ? 100 : activeStep < i ? 0 : percentage}
              loading={loading}
            />
            <StepComponent step={step} index={i + 1} loading={loading} completed={i < activeStep} />
          </div>
        ))}
      </div>
    );
};

export const SteppedPercentage = React.memo(WrappedSteppedPercentage);
export default SteppedPercentage;
