import { Avatar, Icon, LinearProgress, StepIcon as MuiStepIcon, styled, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

const Main = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyItems: 'center'
}));

const Item = styled('div')(({ theme }) => ({
  position: 'relative',
  flexDirection: 'column',
  flex: '1',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1)
}));

const LabelContainer = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const PercentageContainer = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: '14px',
  left: 'calc(-50% + 22px)',
  right: 'calc(50% + 22px)',
  textAlign: 'center'
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

  return (
    <LabelContainer>
      {'icon' in step ? (
        <Avatar
          sx={{
            height: theme.spacing(4),
            width: theme.spacing(4),
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',

            ...(!loading &&
              completed && {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white
              })
          }}
        >
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
      {'label' in step ? <Typography children={step.label} variant="subtitle2" marginTop={theme.spacing(2)} /> : null}
    </LabelContainer>
  );
};

const StepIcon = React.memo(WrappedStepIcon);

type ProgressProps = {
  percentage: number;
  loading?: boolean;
};

const WrappedProgress = ({ percentage = 0, loading = false }: ProgressProps) => {
  return (
    <PercentageContainer>
      <LinearProgress variant={loading ? 'indeterminate' : 'determinate'} value={percentage} />
      {!loading && 0 < percentage && percentage < 100 ? (
        <Typography variant="subtitle2">{`${percentage}%`}</Typography>
      ) : null}
    </PercentageContainer>
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
  percentage: percentageProp = 0
}) => {
  const percentage = useMemo(() => Math.min(Math.max(percentageProp, 0), 100), [percentageProp]);

  if (steps && Array.isArray(steps) && steps.length >= 1)
    return (
      <Main>
        <Item>
          <StepIcon step={steps[0]} index={0} loading={loading} completed={0 <= activeStep} />
        </Item>
        {steps.slice(1).map((step, i) => (
          <Item key={i}>
            <Progress percentage={i < activeStep ? 100 : activeStep < i ? 0 : percentage} loading={loading} />
            <StepIcon step={step} index={i + 1} loading={loading} completed={i < activeStep} />
          </Item>
        ))}
      </Main>
    );
};

export const SteppedPercentage = React.memo(WrappedSteppedPercentage);
export default SteppedPercentage;
