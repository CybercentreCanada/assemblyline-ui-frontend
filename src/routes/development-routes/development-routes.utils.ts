import type { InferHashParamBlueprintFromValue } from 'features/hash-params';
import type { InferPathParamBlueprintFromValue } from 'features/path-params';
import i18next from 'i18next';
import type { ReactNode } from 'react';
import type {
  DevelopmentRoutesHashParamSpec,
  DevelopmentRoutesParamSpec,
  DevelopmentRoutesSearchParamFlag,
  DevelopmentRoutesSearchParamSpec,
  DevelopmentRoutesTableRowData
} from 'routes/development-routes';

//*****************************************************************************************
// Mock Route Location
//*****************************************************************************************

/**
 * @name toSampleRouteParamValue
 * @description Derives a stable, readable sample value for a path param based on its key and blueprint value.
 * @param key - Path param key.
 * @param value - Blueprint representative value used to infer the sample's runtime type.
 * @returns A sample string, number, or boolean value.
 */
const toSampleRouteParamValue = (key: string, value: unknown): string | number | boolean => {
  if (typeof value === 'number') return 42;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string' && value.trim().length > 0) return value;

  const normalized = key.toLowerCase();
  if (normalized.includes('id')) return ':SampleId';
  if (normalized.includes('name')) return ':SampleName';
  if (normalized.includes('svc')) return ':SampleService';
  if (normalized.includes('source')) return ':SampleSource';
  if (normalized.includes('type')) return ':SampleType';
  if (normalized.includes('tab')) return ':Overview';
  if (normalized.includes('page')) return 1;
  if (normalized.includes('user')) return ':SampleUser';
  return ':SampleValue';
};

/**
 * @name createMockRouteLocation
 * @description Builds a synthetic location object with sample path/search/hash values, so route metadata callbacks (`shortname`, `fullname`, `shorticon`, `fullicon`) can be safely invoked outside of real navigation.
 * @param route - Route to build a mock location for.
 * @returns A location-shaped object with `path`, `search`, and `hash` sample values.
 */
export const createMockRouteLocation = (route: AppRoute): Record<string, unknown> => {
  const path = {} as Record<string, unknown>;
  const paramBlueprints = (route?.params?.type ?? {}) as Record<string, unknown>;

  for (const segment of (route?.path ?? '').split('/')) {
    if (!segment.startsWith(':')) continue;
    const key = segment.slice(1);
    path[key] = toSampleRouteParamValue(key, paramBlueprints[key]);
  }

  for (const key of Object.keys(paramBlueprints)) {
    if (!(key in path)) {
      path[key] = toSampleRouteParamValue(key, paramBlueprints[key]);
    }
  }

  const search = route?.search?.getDefaultValues?.().values ?? {};
  const hash = route?.hash?.type ? route.hash.type : null;

  return {
    path,
    search,
    hash
  };
};

//*****************************************************************************************
// Formatting Helpers
//*****************************************************************************************

/**
 * @name formatValue
 * @description Formats an arbitrary value into a short, human-readable string for display in the table.
 * @param value - Value to format.
 * @returns A display string, or `—` when the value is empty, null, or undefined.
 */
export const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(item => formatValue(item)).join(' · ') || '—';
  if (typeof value === 'string') return value || '—';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '—';

  try {
    return JSON.stringify(value) ?? '—';
  } catch {
    if (typeof value === 'object') return String(Object.prototype.toString.call(value));
    return '—';
  }
};

/**
 * @name formatRouteName
 * @description Resolves a route's `shortname`/`fullname` callback result into a translated display string.
 * @param value - Raw callback result, typically an i18next `[key, options]` tuple.
 * @param lng - Language to translate the name into.
 * @returns The translated name, or a fallback display string when the value isn't a translation tuple.
 */
export const formatRouteName = (value: unknown, lng: 'en' | 'fr' = 'en'): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (typeof value[0] === 'string') {
      const key = value[0];
      const options = (value[1] ?? undefined) as Record<string, unknown> | undefined;
      return i18next.t(key, { ...options, lng }) || key;
    }
    return formatValue(value);
  }

  if (typeof value === 'string') return value || '—';
  return formatValue(value);
};

/**
 * @name renderIcon
 * @description Invokes a route's `shorticon`/`fullicon` callback with a mock location so it can be rendered outside of real navigation.
 * @param iconFactory - Route icon callback to invoke.
 * @param configState - Application config state passed to the icon callback.
 * @param route - Route used to build the mock location argument.
 * @returns The rendered icon element, or `—` when no icon factory is provided.
 */
export const renderIcon = (
  iconFactory: ((location: never, config: AppConfigStore) => ReactNode) | undefined,
  configState: AppConfigStore,
  route: AppRoute | null = null
): ReactNode => {
  if (!iconFactory) return '—';
  const location = route ? (createMockRouteLocation(route) as never) : ({ path: {}, search: {}, hash: null } as never);
  return iconFactory(location, configState) ?? '—';
};

/**
 * @name formatFunctionText
 * @description Formats a guard function (`disabled`/`forbidden`) into readable, dedented multi-line source text.
 * @param fn - Value to format, expected to be a function.
 * @returns The dedented function source, or `—` when the value isn't a function.
 */
export const formatFunctionText = (fn: unknown): string => {
  if (typeof fn !== 'function') return '—';

  const lines = fn.toString().split('\n');
  const indents = lines
    .slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => line.match(/^\s*/)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

  const dedented = lines
    .map((line, index) => (index === 0 ? line : line.slice(minIndent)))
    .join('\n')
    .trim();

  return dedented || '—';
};

//*****************************************************************************************
// Param Specs
//*****************************************************************************************

/**
 * @name formatPathParams
 * @description Builds display-ready specs for every `:param` blueprint declared on a route's path.
 * @param route - Route to read path param blueprints from.
 * @returns One spec per path param, in declaration order.
 */
export const formatPathParams = (route: AppRoute): DevelopmentRoutesParamSpec[] => {
  const blueprints = (route?.params?.blueprints ?? {}) as Record<string, InferPathParamBlueprintFromValue>;

  return Object.entries(blueprints).map(([key, blueprint]) => ({
    key,
    kind: blueprint.kind,
    defaultValueLabel: formatValue(blueprint.type),
    options: blueprint.options?.map(option => formatValue(option))
  }));
};

/**
 * @name formatSearchParams
 * @description Builds display-ready specs for every search param blueprint declared on a route.
 * @param route - Route to read search param descriptors from.
 * @returns One spec per search param, in declaration order.
 */
export const formatSearchParams = (route: AppRoute): DevelopmentRoutesSearchParamSpec[] => {
  const descriptors = route?.search?.describeParams?.() ?? {};

  return Object.values(descriptors).map(descriptor => ({
    key: descriptor.key,
    kind: descriptor.kind,
    defaultValueLabel: formatValue(descriptor.defaultValue),
    options: descriptor.options?.map(option => formatValue(option)),
    min: descriptor.min,
    max: descriptor.max,
    source: descriptor.source,
    flags: [
      descriptor.locked && 'locked',
      descriptor.ephemeral && 'ephemeral',
      descriptor.nullable && 'nullable',
      descriptor.ignored && 'ignored'
    ].filter((flag): flag is DevelopmentRoutesSearchParamFlag => Boolean(flag))
  }));
};

/**
 * @name formatHashParam
 * @description Builds a display-ready spec for a route's hash param blueprint. A route without a configured hash
 * falls back to the default no-op blueprint (`kind: 'string'`, empty default); that sentinel is treated as "no hash".
 * @param route - Route to read the hash param blueprint from.
 * @returns The hash param spec, or `null` when the route has no hash configured.
 */
export const formatHashParam = (route: AppRoute): DevelopmentRoutesHashParamSpec | null => {
  const blueprint = route?.hash?.blueprint as InferHashParamBlueprintFromValue | undefined;
  if (!blueprint) return null;

  const defaultValueLabel = formatValue(blueprint.type);
  if (blueprint.kind === 'string' && defaultValueLabel === '—') return null;

  return {
    kind: blueprint.kind,
    defaultValueLabel,
    options: blueprint.options?.map(option => formatValue(option))
  };
};

//*****************************************************************************************
// Table Row
//*****************************************************************************************

/**
 * @name toRouteTableRow
 * @description Flattens a route definition into a display-ready row for the development routes inventory table.
 * @param route - Route to flatten.
 * @param configState - Application config state passed to route metadata callbacks.
 * @returns A fully populated table row.
 */
export const toRouteTableRow = (route: AppRoute, configState: AppConfigStore): DevelopmentRoutesTableRowData => {
  const mockLocation = createMockRouteLocation(route) as never;

  return {
    route,
    path: route.path,
    ancestor: route.ancestor ?? '—',
    shortNameEN: formatRouteName(route.shortname?.(mockLocation, configState), 'en'),
    shortNameFR: formatRouteName(route.shortname?.(mockLocation, configState), 'fr'),
    fullNameEN: formatRouteName(route.fullname?.(mockLocation, configState), 'en'),
    fullNameFR: formatRouteName(route.fullname?.(mockLocation, configState), 'fr'),
    shortIcon: renderIcon(route.shorticon, configState, route),
    fullIcon: renderIcon(route.fullicon, configState, route),
    pathParams: formatPathParams(route),
    searchParams: formatSearchParams(route),
    hashParam: formatHashParam(route),
    disabled: typeof route.disabled === 'function' ? route.disabled.toString().replace(/\s+/g, ' ').trim() : '—',
    forbidden: typeof route.forbidden === 'function' ? route.forbidden.toString().replace(/\s+/g, ' ').trim() : '—'
  };
};
