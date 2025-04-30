import type { CircularProgressProps as MuiCircularProgressProps } from '@mui/material';
import { CircularProgress as MuiCircularProgress, styled } from '@mui/material';

export type CircularProgressProps = MuiCircularProgressProps & {
  loading?: boolean;
};

export const CircularProgress = styled(
  ({ loading = false, ...props }: CircularProgressProps) => loading && <MuiCircularProgress size={24} {...props} />
)<CircularProgressProps>(() => ({
  position: 'absolute'
}));
