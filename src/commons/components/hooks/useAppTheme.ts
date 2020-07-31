import { useMemo } from "react";
import { createMuiTheme } from "@material-ui/core";

export type AppThemeColorProps = {
  darkPrimary: string,
  darkSecondary: string,
  lightPrimary: string,
  lightSecondary: string,
};

const useAppTheme = (isDark: boolean, colors: AppThemeColorProps) => {
  const theme = useMemo(() => createMuiTheme({
    palette: {
      primary: {
        main: (isDark) ? colors.darkPrimary : colors.lightPrimary,
      },
      secondary: {
        main: (isDark) ? colors.darkSecondary : colors.lightSecondary,
      },
      type: (isDark) ? "dark" : "light",
    },
  }), [colors, isDark]);
  return [theme];
};
export default useAppTheme;
