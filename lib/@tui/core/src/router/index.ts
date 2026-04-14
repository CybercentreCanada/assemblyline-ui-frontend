import type { ComponentType, CSSProperties, MouseEvent, ReactNode, Ref } from 'react';
import type { AppBreadcrumbItem } from '../breadcrumbs';

export type AppRouterLocation = {
  pathname: string;
  search: string;
  hash: string;
};

export type AppRouterAdapter = {
  Link: ComponentType<{
    to: string;
    children?: ReactNode;
    className?: string;
    target?: string;
    style?: CSSProperties;
    ref?: Ref<HTMLAnchorElement>;
    onClick?: (event: MouseEvent) => void;
  }>;
  location: AppRouterLocation;
  navigate: (to: string) => void;
  matchPath: (pattern: { path: string; end?: boolean }, pathname: string) => boolean;
  breadcrumbs: (location?: AppRouterLocation) => AppBreadcrumbItem[];
};
