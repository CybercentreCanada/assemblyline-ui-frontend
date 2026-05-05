import type { PropsWithChildren, ReactNode } from 'react';
import { memo } from 'react';
import {
  AppDrawerActions,
  AppDrawerCloseButton,
  AppDrawerContainer,
  AppDrawerContent,
  AppDrawerInner,
  AppDrawerMain,
  AppDrawerMaximizeButton
} from './drawer.components';

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
      <AppDrawerInner>{content}</AppDrawerInner>
    </AppDrawerContainer>
  </AppDrawerMain>
));

AppDrawerLayout.displayName = 'AppDrawerLayout';
