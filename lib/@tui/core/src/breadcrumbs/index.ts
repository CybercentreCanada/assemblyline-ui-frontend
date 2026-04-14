import type { ReactElement } from 'react';

// Specification interface describing an application route captured in the breadcrumb provider history tracker.
export type AppHistoryRoute = {
  route: string;
  path: string;
};

// Specification interface describing a element that is rendered in the application breadcrumb list.
export type AppBreadcrumbItem = {
  route: string;
  path: string;
  title?: string;
  i18nKey?: string;
  icon?: ReactElement;
  width?: number;
  missing?: boolean;
  text?: boolean;
  includeRoot?: boolean;
};
