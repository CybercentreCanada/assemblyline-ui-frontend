import { AppRoot } from '@tui/core';
import { i18n as I18N } from 'i18next';
import React, { PropsWithChildren } from 'react';
import { useAppLayoutCookies } from '../hooks/useAppLayoutCookies';
import { useAppLayoutThemes } from '../hooks/useAppLayoutThemes';

export type AppLayoutRootProps = PropsWithChildren & {
  i18n: I18N;
};

export const AppLayoutRoot = React.memo(({ children, i18n }: AppLayoutRootProps) => {
  const cookies = useAppLayoutCookies();
  const themes = useAppLayoutThemes();

  return (
    <AppRoot cookies={cookies} i18n={i18n} themes={themes}>
      {children}
    </AppRoot>
  );
});
