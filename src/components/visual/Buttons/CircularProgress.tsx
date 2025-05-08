import type { CircularProgressProps as MuiCircularProgressProps } from '@mui/material';
import { CircularProgress as MuiCircularProgress, styled } from '@mui/material';

export type CircularProgressProps = MuiCircularProgressProps & {
  progress?: boolean;
};

export const CircularProgress = styled(
  ({ progress = false, ...props }: CircularProgressProps) => progress && <MuiCircularProgress size={24} {...props} />
)<CircularProgressProps>(() => ({
  position: 'absolute'
}));
