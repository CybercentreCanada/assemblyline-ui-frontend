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

export type AppDrawerLayoutProps = PropsWithChildren & {
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
