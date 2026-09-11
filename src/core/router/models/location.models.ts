import type { InferAppRouteFromPath, InferAppRouteHashFromPath } from 'core/router';
import type { HashParamValue } from 'features/hash-params';
import type {
  InferPathParamBlueprintMapFromPath,
  InferPathParamKeyFromPath,
  InferPathParamValuesFromBlueprintMap,
  RoutePath
} from 'features/path-params';
import type {
  InferSearchParamKeysFromEngine,
  InferSearchParamValueMapFromBlueprintMap,
  InferSearchParamValueMapFromEngine,
  SearchParamBlueprintMap
} from 'features/search-params';

//*****************************************************************************************
// App Route Param
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferAppLocationFromPath<Origin extends AppRoute['path']> = {
  /** router route digest value */
  digest: string;
  /** Route path */
  route: Origin;
  /** Parsed path params derived from the current location. */
  path: [InferPathParamKeyFromPath<Origin>] extends [never]
            ? null
            : NonNullable<InferAppRouteFromPath<Origin>['params']>['type'];
  /** Parsed search params derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteFromPath<Origin>['search']>] extends [never]
            ? null
            : InferSearchParamValueMapFromEngine<InferAppRouteFromPath<Origin>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: InferAppRouteHashFromPath<Origin>;
};

// prettier-ignore
export type InferAppLocationFromParams<
  Path extends RoutePath,
  Params extends InferPathParamBlueprintMapFromPath<Path>,
  Search extends SearchParamBlueprintMap,
  Hash extends HashParamValue = never
> = {
  /** router route digest value */
  digest: string;
  /** Route path */
  route: Path;
  /** Parsed path params derived from the current location. */
  path: [InferPathParamKeyFromPath<Path>] extends [never]
            ? null
            : [Params] extends [never]
              ? null
              : InferPathParamValuesFromBlueprintMap<Params>;
  /** Parsed search params derived from the current location. */
  search: SearchParamBlueprintMap extends Search
            ? null
            : Partial<InferSearchParamValueMapFromBlueprintMap<Search>>;
  /** Parsed hash value derived from the current location. */
  hash: [Hash] extends [never] ? null : Hash | null;
};

//*****************************************************************************************
// Location Store
//*****************************************************************************************

/** Store containing route-keyed location snapshots for all open routes. */
export type AppLocationParamStore = {
  /** Full application route registry keyed by route path (canonical known routes, not only active ones). */
  routes: Record<AppRoute['path'], AppRoute>;
  /** Parsed snapshots keyed by router page key for currently active pages (latest params/search/hash). */
  locations: Record<string, InferAppLocationFromPath<AppRoute['path']>>;
};
