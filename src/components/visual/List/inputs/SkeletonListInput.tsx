import type { SkeletonProps } from '@mui/material';
import { Skeleton, useTheme } from '@mui/material';
import { type FC } from 'react';

interface SkeletonListInputProps extends SkeletonProps {
  visible?: boolean;
}

export const SkeletonListInput: FC<SkeletonListInputProps> = ({ visible = false, sx, ...other }) => {
  const theme = useTheme();
  return !visible ? null : (
    <Skeleton sx={{ height: '2rem', width: '2.5rem', marginRight: theme.spacing(0.5), ...sx }} {...other} />
  );
};
