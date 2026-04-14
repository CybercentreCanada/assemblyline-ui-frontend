import { useContext, useMemo } from 'react';
import { TuiThemesContext, type TuiThemesContextType } from '../providers/AppThemesProvider';

export type UseAppThemeType = TuiThemesContextType & {
  isDark: boolean;
  isLight: boolean;
};

export const useAppTheme = (): UseAppThemeType => {
  const context = useContext(TuiThemesContext);

  return useMemo(
    () => ({
      ...context,
      isDark: context.mode === 'dark',
      isLight: context.mode === 'light'
    }),
    [context]
  );
};
