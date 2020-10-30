import { createMuiTheme, PaletteType } from '@material-ui/core';
import { useMemo } from 'react';

export type AppThemeColorProps = {
  background?: {
    dark?: {
      default: string;
      paper: string;
    };
    light?: {
      default: string;
      paper: string;
    };
  };
  darkPrimary?: string;
  darkSecondary?: string;
  lightPrimary?: string;
  lightSecondary?: string;
};

const useAppTheme = (isDark: boolean, colors: AppThemeColorProps) => {
  const theme = useMemo(() => {
    const { background, darkPrimary, darkSecondary, lightPrimary, lightSecondary } = colors;

    const primaryMain = isDark ? darkPrimary : lightPrimary;
    const secondaryMain = isDark ? darkSecondary : lightSecondary;

    const palette = {
      primary: {
        main: primaryMain
      },
      secondary: {
        main: secondaryMain
      },
      type: isDark ? ('dark' as PaletteType) : ('light' as PaletteType)
    };

    if (background) {
      if (isDark && background.dark) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        palette['background'] = background.dark;
      } else if (!isDark && background.light) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        palette['background'] = background.light;
      }
    }

    return createMuiTheme({
      palette
    });
  }, [colors, isDark]);
  return [theme];
};
export default useAppTheme;
