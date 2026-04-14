import type { ReactElement } from 'react';

export { AppSwitcher } from './elements/AppSwitcher';
export { useAppSwitcher } from './hooks/useAppSwitcher';
export * from './name';
export { AppSwitcherProvider } from './providers/AppSwitcherProvider';

// Specification interface for an item provided to the app switcher.
export type AppSwitcherItem = {
  alt: string;
  name: string;
  img_d: ReactElement<any> | string;
  img_l: ReactElement<any> | string;
  route: string;
  newWindow?: boolean;
};
