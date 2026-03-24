import { useAppConfigStore } from 'core/config';
import React, { PropsWithChildren } from 'react';
import { AppHorizontalLayout, AppVerticalLayout, AppVerticalLeft, AppVerticalRight } from './components/Layouts';
import { LeftNavBar } from './components/LeftNavBar';

export const AppLayoutProvider = React.memo(({ children }: PropsWithChildren) => {
  const mode = useAppConfigStore(s => s.layout.mode);

  switch (mode) {
    case 'side':
      return (
        <AppVerticalLayout>
          <AppVerticalLeft>
            <LeftNavBar />
          </AppVerticalLeft>
          <AppVerticalRight>{children}</AppVerticalRight>
        </AppVerticalLayout>
      );
    case 'top':
      return (
        <AppHorizontalLayout>
          <AppVerticalLayout>
            <AppVerticalLeft>
              <LeftNavBar />
            </AppVerticalLeft>
            <AppVerticalRight>{children}</AppVerticalRight>
          </AppVerticalLayout>
        </AppHorizontalLayout>
      );
    default:
      return null;
  }
});
