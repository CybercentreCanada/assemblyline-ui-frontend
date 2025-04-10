import type { CircularProgressProps as MuiCircularProgressProps } from '@mui/material';
import { CircularProgress as MuiCircularProgress, styled } from '@mui/material';

export type CircularProgressProps = MuiCircularProgressProps & {
  loading?: boolean;
};

export const CircularProgress = styled(
  ({ loading = false, ...props }: CircularProgressProps) => loading && <MuiCircularProgress size={24} {...props} />
)<CircularProgressProps>(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12
}));
