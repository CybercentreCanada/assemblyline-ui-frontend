import {
  AppDrawerActions,
  AppDrawerCloseButton,
  AppDrawerContainer,
  AppDrawerContent,
  AppDrawerMain,
  AppDrawerMaximizeButton
} from 'layout/drawer/drawer.components';
import type { PropsWithChildren, ReactNode } from 'react';
import { memo } from 'react';

/** Props for AppDrawerLayout. */
export type AppDrawerLayoutProps = PropsWithChildren & {
  /** The content to render inside the drawer panel. */
  content?: ReactNode;
};

export const AppDrawerLayout = memo(({ children, content }: AppDrawerLayoutProps) => (
  <AppDrawerMain>
    <AppDrawerContent>{children}</AppDrawerContent>
    <AppDrawerContainer>
      <AppDrawerActions>
        <AppDrawerCloseButton />
        <AppDrawerMaximizeButton />
      </AppDrawerActions>
      {content}
    </AppDrawerContainer>
  </AppDrawerMain>
));

AppDrawerLayout.displayName = 'AppDrawerLayout';
