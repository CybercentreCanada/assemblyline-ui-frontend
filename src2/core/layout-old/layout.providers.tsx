import { useAppConfig } from 'core/config';
import React, { PropsWithChildren } from 'react';
import { AppLeftNav } from './components/left-nav/LeftNav';
import {
  AppContent,
  AppHorizontalLayout,
  AppVerticalLayout,
  AppVerticalLeft,
  AppVerticalRight
} from './components/root/Layouts';
import { AppTopBar } from './components/top-nav/TopBar';
import { useBuildLayout } from './layout.hooks';

export const AppLayoutProvider = React.memo(({ children }: PropsWithChildren) => {
  return children;
});

export const AppLayoutProvider2 = React.memo(({ children }: PropsWithChildren) => {
  const mode = useAppConfig(s => s.layout.mode);

  useBuildLayout();

  switch (mode) {
    case 'side':
      return (
        <AppVerticalLayout>
          <AppVerticalLeft>
            <AppLeftNav />
          </AppVerticalLeft>
          <AppVerticalRight>
            <AppTopBar />
            <AppContent>{children}</AppContent>
          </AppVerticalRight>
        </AppVerticalLayout>
      );
    case 'top':
      return (
        <AppHorizontalLayout>
          <AppTopBar />
          <AppVerticalLayout>
            <AppVerticalLeft>
              <AppLeftNav />
            </AppVerticalLeft>
            <AppVerticalRight>
              {' '}
              <AppContent>{children}</AppContent>
            </AppVerticalRight>
          </AppVerticalLayout>
        </AppHorizontalLayout>
      );
    default:
      return null;
  }
});
