import { AppRoute, CreatedAppRouteParamsMap } from 'core/routes';
import { ReversePortalNode } from 'features/portal';
import { LinkProps } from 'react-router';

//*****************************************************************************************
// App Router
//*****************************************************************************************

export type AppRouterPanel = {
  routeKey: keyof AppRouterStore['routes'];
  temporaryRouteKey: keyof AppRouterStore['routes'];
  pinnedRouteKeys: (keyof AppRouterStore['routes'])[];
  tabbedRouteKeys: (keyof AppRouterStore['routes'])[];
};

export type AppRouterNode = {
  routeKey: keyof AppRouterStore['routes'];
  portal: ReversePortalNode;
};

export type AppRouterRoute<State = any> = {
  href: string;
  state?: State;
  age: number;
};

export type AppRouterState = {
  panels: AppRouterStore['panels'];
  routes: AppRouterStore['routes'];
};

export type AppRouterStore = {
  maxPanels: number;
  maxNodes: number;

  panels: AppRouterPanel[];
  nodes: Record<string, AppRouterNode>;
  routes: Record<string, AppRouterRoute>;
};

//*****************************************************************************************
// App Router Link
//*****************************************************************************************
export type AppLinkOptions =
  | { variant?: 'open'; panel?: never }
  | { variant?: 'replace'; panel?: never }
  | { variant?: 'to'; panel: number };

export type AppLinkProps<Route extends AppRoute> = Omit<LinkProps, 'to' | 'pathname' | 'search' | 'hash'> &
  AppLinkOptions & {
    to?: CreatedAppRouteParamsMap<Route>;
  };
