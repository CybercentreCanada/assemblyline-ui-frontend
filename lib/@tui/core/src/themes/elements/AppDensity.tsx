import { createTheme, ThemeProvider, useTheme } from '@mui/material';
import { merge } from 'lodash-es';
import { useMemo, type FC, type PropsWithChildren } from 'react';
import type { AppDensityMode } from '../../app/AppConfigs';
import { getDensityThemeOverrides } from '../density';

export type AppDensityProps = PropsWithChildren<{
  density: AppDensityMode;
}>;

export const AppDensity: FC<AppDensityProps> = ({ density, children }) => {
  const outerTheme = useTheme();

  const theme = useMemo(() => {
    const overrides = getDensityThemeOverrides(density);
    if (!Object.keys(overrides).length) return outerTheme;
    return createTheme(merge({}, outerTheme, overrides));
  }, [outerTheme, density]);

  if (theme === outerTheme) return children;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
