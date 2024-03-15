import { Avatar, Icon, LinearProgress, StepIcon as MuiStepIcon, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useMemo } from 'react';

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

type StepIconProps = {
  step: Step;
  index: number;
  loading?: boolean;
  completed?: boolean;
};

const WrappedStepIcon = ({ step = null, index = 0, loading = false, completed = false }: StepIconProps) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <span className={classes.labelContainer}>
      {'icon' in step ? (
        <Avatar className={clsx(classes.icon, !loading && completed && classes.completed)}>
          <Icon children={step.icon} />
        </Avatar>
      ) : (
        <MuiStepIcon
          icon={index}
          active
          completed={completed}
          sx={{ height: theme.spacing(4), width: theme.spacing(4) }}
        />
      )}
      {'label' in step ? <Typography className={classes.label} children={step.label} variant="subtitle2" /> : null}
    </span>
  );
};

const StepIcon = React.memo(WrappedStepIcon);

type ProgressProps = {
  percentage: number;
  loading?: boolean;
  show100?: boolean;
};

const WrappedProgress = ({ percentage = 0, loading = false, show100 = false }: ProgressProps) => {
  const classes = useStyles();

  return (
    <span className={classes.percentageContainer}>
      <LinearProgress variant={loading ? 'indeterminate' : 'determinate'} value={percentage} />
      {!loading && 0 < percentage && (show100 || percentage < 100) ? (
        <Typography variant="subtitle2">{`${percentage}%`}</Typography>
      ) : null}
    </span>
  );
};

const Progress = React.memo(WrappedProgress);

type Props = {
  steps?: Step[];
  loading?: boolean;
  activeStep?: number;
  percentage?: number;
  show100?: boolean;
};

const WrappedSteppedPercentage: React.FC<Props> = ({
  steps = [],
  loading = false,
  activeStep = 0,
  percentage: percentageProp = 0,
  show100 = false
}) => {
  const classes = useStyles();

  const percentage = useMemo(() => Math.min(Math.max(percentageProp, 0), 100), [percentageProp]);

  if (steps && Array.isArray(steps) && steps.length >= 1)
    return (
      <div className={classes.main}>
        <div className={classes.item}>
          <StepIcon step={steps[0]} index={0} loading={loading} completed={0 <= activeStep} />
        </div>
        {steps.slice(1).map((step, i) => (
          <div key={i} className={classes.item}>
            <Progress
              percentage={i < activeStep ? 100 : activeStep < i ? 0 : percentage}
              loading={loading}
              show100={show100}
            />
            <StepIcon step={step} index={i + 1} loading={loading} completed={i < activeStep} />
          </div>
        ))}
      </div>
    );
};

export const SteppedPercentage = React.memo(WrappedSteppedPercentage);
export default SteppedPercentage;
