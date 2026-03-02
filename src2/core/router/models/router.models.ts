import { z } from 'zod';
import { ReversePortalNode } from '../components/Portals';

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
  lastUsedAt: number;
};

export type RouterRoute<State = any> = {
  href: string;
  state?: State;
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

//*****************************************************************************************
// Path
//*****************************************************************************************

export type PathParamValue = string | number | boolean;

export type PathParamKeys<Path extends string> = string extends Path
  ? string
  : Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | PathParamKeys<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Param
      : never;

export type PathParams<Path extends string> = [PathParamKeys<Path>] extends [never]
  ? never
  : Record<PathParamKeys<Path>, PathParamValue>;

//*****************************************************************************************
// Params
//*****************************************************************************************

// type PathParamKeys<Path extends string> = PathParams<Path> extends never ? never : keyof PathParams<Path> & string;

export type ParamsBlueprint<T extends PathParamValue> = {
  type: string | number | boolean;
  parse: (value: string | undefined) => T;
  stringify: (value: T) => string;
};

export type ParamsBlueprintsForPath<Path extends string> = {
  [K in PathParamKeys<Path>]: ParamsBlueprint<PathParamValue>;
};

export type ParamsBlueprints = Record<string, ParamsBlueprint<PathParamValue>>;

export type ParamsValues<Blueprints extends ParamsBlueprints> = {
  [K in keyof Blueprints]: Blueprints[K] extends ParamsBlueprint<infer V> ? V : never;
};

export type ParamsTypes<Blueprints extends ParamsBlueprints> = ParamsValues<Blueprints>;

export type ParamsTypesFromDefinition<Definition extends (parsers: any) => ParamsBlueprints> = Definition extends (
  parsers: any
) => infer Blueprints
  ? Blueprints extends ParamsBlueprints
    ? ParamsValues<Blueprints>
    : never
  : never;

export type ParamsParser<Blueprints extends ParamsBlueprints = ParamsBlueprints> = {
  blueprints: Blueprints;
  parse: (raw: Record<string, string | undefined>) => ParamsValues<Blueprints>;
  stringify: (params: Partial<ParamsValues<Blueprints>>) => Record<string, string>;
};

//*****************************************************************************************
// Other
//*****************************************************************************************

export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;
