import { ReversePortalNode } from 'features/portal';
import { z } from 'zod';

//*****************************************************************************************
// App Router Store
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
// App Router Settings & Config
//*****************************************************************************************

export const AppRouterSettingsSchema = z.object({
  maxPanels: z.number().min(1).optional(),
  maxNodes: z.number().min(0).optional()
});

export type AppRouterSettings = z.infer<typeof AppRouterSettingsSchema>;

export type AppRouterConfig = AppRouterSettings & {};
