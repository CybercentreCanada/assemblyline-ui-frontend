import { CssBaseline } from '@mui/material';

import type { i18n } from 'i18next';
import type { FC, PropsWithChildren } from 'react';
import type { TuiCookies } from '../cookies';
import { TUI_THEMES } from '../themes';
import type { AppTheme } from './AppConfigs';
import { AppCookiesProvider } from './providers/AppCookiesProvider';
import { AppThemesProvider } from './providers/AppThemesProvider';

type AppRootProps = PropsWithChildren & { i18n: i18n; cookies: TuiCookies; themes?: AppTheme[] };

export const AppRoot: FC<AppRootProps> = ({ i18n, cookies, themes, children }) => {
  return (
    <AppCookiesProvider cookies={cookies} i18n={i18n}>
      <AppThemesProvider themes={themes ?? TUI_THEMES}>
        <CssBaseline enableColorScheme />
        {children}
      </AppThemesProvider>
    </AppCookiesProvider>
  );
};
