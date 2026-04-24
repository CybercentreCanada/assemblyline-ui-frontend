import React, { PropsWithChildren } from 'react';
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
  content?: React.ReactNode;
};

export const AppDrawerLayout = React.memo(({ children, content }: AppDrawerLayoutProps) => (
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
