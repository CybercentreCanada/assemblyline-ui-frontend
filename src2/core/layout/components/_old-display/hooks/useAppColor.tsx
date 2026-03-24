import { colors } from '@mui/material';
import { useMemo } from 'react';
import { useAppTheme } from '../../app/hooks';

export type MuiColorType = keyof typeof colors;

type MuiColor = typeof colors.blue;

type MuiColorVariant = keyof typeof colors.blue;

export const useAppColor = (
  color: MuiColorType = 'grey',
  lightVariant: MuiColorVariant = 100,
  darkVariant: MuiColorVariant = 900
) => {
  const { isDark } = useAppTheme();
  return useMemo(() => {
    return (colors[color] as MuiColor)[isDark ? darkVariant : lightVariant];
  }, [isDark, color, lightVariant, darkVariant]);
};
