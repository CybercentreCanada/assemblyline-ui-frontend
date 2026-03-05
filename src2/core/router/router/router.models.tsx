import { ReversePortalNode } from 'core/portal';
import { z } from 'zod';

//*****************************************************************************************
// Location
//*****************************************************************************************
// export type RouterStatePanel = {
//   route: string;
//   pinnedRoutes: string[];
//   tabbedRoutes: string[];
// };

// export type RouterStateRoute = {
//   href: string;
//   state: any;
// };

export const RouterStatePanelSchema = z.object({
  route: z.string(),
  pinnedRoutes: z.array(z.string()),
  tabbedRoutes: z.array(z.string())
});

export const RouterStateRouteSchema = z.object({
  href: z.string(),
  state: z.unknown()
});

export const RouterStateSchema = z.object({
  panels: z.array(RouterStatePanelSchema),
  routes: z.record(z.string(), RouterStateRouteSchema)
});

export type RouterState2 = z.infer<typeof RouterStateSchema>;

//*****************************************************************************************
// Router Store
//*****************************************************************************************

export type RouterPanel = {
  routeKey: keyof RouterStore['routes'];
  temporaryRouteKey: keyof RouterStore['routes'];
  pinnedRouteKeys: (keyof RouterStore['routes'])[];
  tabbedRouteKeys: (keyof RouterStore['routes'])[];
};

export type RouterNode = {
  routeKey: keyof RouterStore['routes'];
  portal: ReversePortalNode;
};

export type RouterRoute<State = any> = {
  href: string;
  state?: State;
  age: number;
};

export type RouterState = {
  panels: RouterStore['panels'];
  routes: RouterStore['routes'];
};

export type RouterStore = {
  maxPanels: number;
  maxNodes: number;

  panels: RouterPanel[];
  nodes: Record<string, RouterNode>;
  routes: Record<string, RouterRoute>;
};

export const RouterPanelSchema = z.object({
  route: z.string(),
  pinnedRoutes: z.array(z.string()),
  tabbedRoutes: z.array(z.string())
});

export const RouterNodeSchema = z.object({
  panelKey: z.number(),
  routeKey: z.string(),
  portal: z.custom<ReversePortalNode>(value => value != null, { message: 'Invalid portal node' }),
  lastUsedAt: z.number()
});

export const RouterRouteSchema = z.object({
  href: z.string(),
  state: z.unknown().optional()
});

export const RouterStoreSchema = z.object({
  maxPanels: z.number(),
  maxNodes: z.number(),
  panels: z.array(RouterPanelSchema),
  nodes: z.array(RouterNodeSchema),
  routes: z.record(z.string(), RouterRouteSchema)
});
