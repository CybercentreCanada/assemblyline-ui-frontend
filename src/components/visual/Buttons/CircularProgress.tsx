import type { CircularProgressProps as MuiCircularProgressProps } from '@mui/material';
import { CircularProgress as MuiCircularProgress, styled } from '@mui/material';

export type CircularProgressProps = MuiCircularProgressProps & {
  progress?: boolean | number;
};

export const CircularProgress = styled(({ progress = false, ...props }: CircularProgressProps) =>
  progress === false ? null : (
    <MuiCircularProgress
      size={24}
      {...(typeof progress === 'number' ? { variant: 'determinate', value: progress } : { variant: 'indeterminate' })}
      {...props}
    />
  )
)<CircularProgressProps>(() => ({
  position: 'absolute'
}));
