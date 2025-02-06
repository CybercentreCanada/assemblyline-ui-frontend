import type { SkeletonProps } from '@mui/material';
import { Skeleton, useTheme } from '@mui/material';
import { type FC } from 'react';

interface SkeletonListInputProps extends SkeletonProps {
  visible?: boolean;
}

export const SkeletonListInput: FC<SkeletonListInputProps> = ({ sx, ...other }) => {
  const theme = useTheme();
  return <Skeleton sx={{ height: '2rem', width: '30%', marginRight: theme.spacing(0.5), ...sx }} {...other} />;
};
