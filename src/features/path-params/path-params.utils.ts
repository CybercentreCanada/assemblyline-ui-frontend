import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamStringifyValuesFromBlueprintMap,
  InferPathParamValuesFromBlueprintMap,
  PathPattern,
  PathPatternSegment,
  RoutePath,
  RoutePathWithoutOptionalStaticSegments,
  RoutePathWithTrailingOptionalParamsOnly
} from 'features/path-params';
import type { Location } from 'react-router';

//*****************************************************************************************
// Path Segments
//*****************************************************************************************

/**
 * @name assertValidPathParam
 * @description Throws when a path parameter value is empty or an exact `.` / `..` dot-segment.
 * @param value - Decoded or serialized path parameter value
 * @returns Nothing; throws a `TypeError` for invalid values
 */
export const assertValidPathParam = (value: string): void => {
  if (value === '' || value === '.' || value === '..') {
    throw new TypeError('Path parameter values must not be empty, "." or "..".');
  }
};

/**
 * @name decodePathSegment
 * @description Decodes a URI-encoded path segment, keeping malformed escapes as literal text.
 * @param segment - Raw path segment
 * @returns The decoded segment, or the original segment when it cannot be decoded
 */
export const decodePathSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/**
 * @name getOwnValue
 * @description Reads a value only when it is an own property, so keys like `__proto__` or `constructor` never resolve to inherited values.
 * @param record - Object to read from
 * @param key - Property key
 * @returns The own property value, or `undefined` when the key is not an own property
 */
export const getOwnValue = <Value>(record: Record<string, Value>, key: string): Value | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined;

//*****************************************************************************************
// Path Param Blueprints
//*****************************************************************************************
export const PATH_PARAM_BLUEPRINTS_MAP = {
  string: (defaultValue = ''): InferPathParamBlueprintFromValue<string> => ({
    type: '',
    kind: 'string',
    parse: value => (value == null ? defaultValue : value),
    stringify: value => String(value)
  }),
  number: (defaultValue = 0): InferPathParamBlueprintFromValue<number> => ({
    type: 0,
    kind: 'number',
    parse: value => {
      if (value == null) return defaultValue;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    stringify: value => String(value)
  }),
  boolean: (defaultValue = false): InferPathParamBlueprintFromValue<boolean> => ({
    type: false,
    kind: 'boolean',
    parse: value => {
      if (value == null) return defaultValue;
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      return defaultValue;
    },
    stringify: value => String(value)
  }),
  enum: <const Values extends readonly [string | boolean | number, ...(string | boolean | number)[]]>(
    values: Values,
    defaultValue: Values[number] = values[0]
  ): InferPathParamBlueprintFromValue<Values[number]> => {
    const optionByString = new Map<string, Values[number]>();

    for (const option of values) {
      const serialized = String(option);
      if (optionByString.has(serialized) && !Object.is(optionByString.get(serialized), option)) {
        throw new TypeError('Enum options must have unique string representations.');
      }
      optionByString.set(serialized, option);
    }

    return {
      type: defaultValue,
      kind: 'enum',
      options: values,
      parse: value => (value == null ? defaultValue : (optionByString.get(value) ?? defaultValue)),
      stringify: value => {
        for (const candidate of values) {
          if (Object.is(candidate, value)) return String(candidate);
        }
        return String(defaultValue);
      }
    };
  }
};

//*****************************************************************************************
// Path Pattern
//*****************************************************************************************

/**
 * @name parsePathPattern
 * @description Splits a route pattern into static and `:param` / `:param?` segments once, so it is not re-split on every parse or stringify call.
 * @param path - Route pattern such as `/alerts/:id/:tab?`
 * @returns The parsed pattern; static segments carry their decoded, lower-cased form for matching
 */
export const parsePathPattern = (path: string): PathPattern => {
  const absolute = path.startsWith('/');
  const segments = (absolute ? path.slice(1) : path).split('/').map((raw): PathPatternSegment => {
    if (!raw.startsWith(':')) return { kind: 'static', raw, normalized: decodePathSegment(raw).toLowerCase() };

    const optional = raw.endsWith('?');
    return { kind: 'param', raw, key: raw.slice(1, optional ? -1 : undefined), optional };
  });

  return { absolute, segments };
};

/**
 * @name splitPathname
 * @description Strips one leading slash from a pathname and splits it into segments.
 * @param pathname - Location pathname
 * @returns Raw pathname segments; an empty pathname and `/` both yield a single empty segment
 */
export const splitPathname = (pathname: string): string[] =>
  (pathname.startsWith('/') ? pathname.slice(1) : pathname).split('/');

/**
 * @name assertSupportedPathPattern
 * @description Throws for patterns the codec cannot handle: wildcard segments, optional static segments, param names that are not alphanumeric (underscores allowed) or are repeated, and optional params followed by a required segment. Optional params are only supported at the end of the path.
 * @param pattern - Pattern created by `parsePathPattern`
 * @returns Nothing; throws a `TypeError` for unsupported patterns
 */
export const assertSupportedPathPattern = (pattern: PathPattern): void => {
  const keys = new Set<string>();
  let optionalParamSeen = false;
  for (const segment of pattern.segments) {
    if (segment.kind === 'static') {
      if (segment.raw.includes('*')) throw new TypeError('Wildcard path segments are not supported.');
      if (segment.raw.endsWith('?')) throw new TypeError('Optional static path segments are not supported.');
    } else {
      if (!/^[A-Za-z0-9_]+$/.test(segment.key)) {
        throw new TypeError('Path parameter names may only contain letters, numbers and underscores.');
      }
      if (keys.has(segment.key)) throw new TypeError(`Path parameter names must be unique: "${segment.key}".`);
      keys.add(segment.key);
    }

    if (segment.kind === 'param' && segment.optional) {
      optionalParamSeen = true;
    } else if (optionalParamSeen) {
      throw new TypeError('Optional path parameters are only supported at the end of the path.');
    }
  }
};

/**
 * @name isPathConsumed
 * @description Checks whether a pattern that has no segments left accounts for the whole pathname. A single trailing empty segment, as in `/item/`, is allowed.
 * @param pathParts - Pathname segments
 * @param pathIndex - Index of the next unmatched pathname segment
 * @returns `true` when nothing but an optional trailing empty segment remains
 */
export const isPathConsumed = (pathParts: string[], pathIndex: number): boolean =>
  pathIndex === pathParts.length || (pathIndex === pathParts.length - 1 && pathParts[pathIndex] === '');

/**
 * @name matchPathPattern
 * @description Matches a pathname against a parsed pattern and extracts raw parameter values. Static segments compare decoded and case-insensitively. Missing params are `undefined`; optional params are only allowed at the end. A final slash is ignored unless the pattern itself ends with a slash, and the root pathname `/` or an empty pathname omit an optional param.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param pathname - Location pathname to match
 * @returns Raw values keyed by parameter name, or `null` when the pathname does not match. Throws a `TypeError` for supplied values that are empty or `.` / `..`.
 */
export const matchPathPattern = (pattern: PathPattern, pathname: string): Record<string, string | undefined> | null => {
  const pathParts = splitPathname(pathname);
  if (pathname.endsWith('/') && pattern.segments[pattern.segments.length - 1]?.raw !== '') pathParts.pop();
  const isRoot = pathname === '/' || pathname === '';
  const params = Object.create(null) as Record<string, string | undefined>;
  let pathIndex = 0;

  for (const segment of pattern.segments) {
    const pathPart = pathParts[pathIndex];

    if (segment.kind === 'static') {
      if (pathPart === undefined || segment.normalized !== decodePathSegment(pathPart).toLowerCase()) return null;
      pathIndex += 1;
    } else if (
      pathPart === undefined ||
      (segment.optional && (isRoot || (pathPart === '' && pathIndex === pathParts.length - 1)))
    ) {
      params[segment.key] = undefined;
      if (pathPart === '') pathIndex += 1;
    } else {
      const value = decodePathSegment(pathPart);
      assertValidPathParam(value);
      params[segment.key] = value;
      pathIndex += 1;
    }
  }

  return isPathConsumed(pathParts, pathIndex) ? params : null;
};

/**
 * @name serializePathParam
 * @description Serializes one parameter value through its blueprint and URI-encodes it into a single path segment.
 * @param blueprint - Blueprint of the parameter
 * @param value - Typed value to serialize
 * @returns The encoded path segment. Throws a `TypeError` for empty or `.` / `..` values and a `URIError` for values that cannot be encoded.
 */
export const serializePathParam = (blueprint: InferPathParamBlueprintFromValue, value: unknown): string => {
  const serialized = blueprint.stringify(value as never);
  const encoded = encodeURIComponent(serialized);
  assertValidPathParam(serialized);
  return encoded;
};

/**
 * @name findLastSuppliedParamIndex
 * @description Finds the last optional parameter that has a value. Omitted optionals before it must still be written, or it would shift into an earlier slot.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @returns The segment index, or `-1` when no optional parameter has a value
 */
export const findLastSuppliedParamIndex = (pattern: PathPattern, values: Record<string, unknown>): number =>
  pattern.segments.findLastIndex(
    segment => segment.kind === 'param' && segment.optional && getOwnValue(values, segment.key) != null
  );

/**
 * @name serializePathSegments
 * @description Serializes every pattern segment. Omitted optionals after the last supplied one are dropped; earlier ones are written with their blueprint default. A param without a blueprint keeps its `:param` text.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @param blueprints - Blueprints keyed by parameter name; only own properties are read
 * @returns The encoded segments in pattern order. Throws a `TypeError` for empty or `.` / `..` values, including a default that is not a valid path value, and a `URIError` for values that cannot be encoded.
 */
export const serializePathSegments = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): string[] => {
  const lastSuppliedIndex = findLastSuppliedParamIndex(pattern, values);

  return pattern.segments.flatMap((segment, index) => {
    if (segment.kind === 'static') return [segment.raw];

    const blueprint = getOwnValue(blueprints, segment.key);
    const value = getOwnValue(values, segment.key);
    const omitted = segment.optional && value == null;
    if (omitted && index > lastSuppliedIndex) return [];
    if (!blueprint) return [segment.raw];

    return [serializePathParam(blueprint, omitted ? blueprint.parse(undefined) : value)];
  });
};

/**
 * @name joinPathParts
 * @description Joins serialized segments into a pathname.
 * @param pattern - Pattern created by `parsePathPattern`; decides whether the pathname starts with `/`
 * @param parts - Serialized segments
 * @returns The pathname
 */
export const joinPathParts = (pattern: PathPattern, parts: string[]): string =>
  (pattern.absolute ? '/' : '') + parts.join('/');

/**
 * @name stringifyPathPattern
 * @description Builds a pathname from a parsed pattern and parameter values.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @param blueprints - Blueprints keyed by parameter name; only own properties are read
 * @returns The encoded pathname. Throws a `TypeError` for empty or `.` / `..` values and a `URIError` for values that cannot be encoded.
 */
export const stringifyPathPattern = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): string => joinPathParts(pattern, serializePathSegments(pattern, values, blueprints));

//*****************************************************************************************
// Create Path Param Codec
//*****************************************************************************************
export const createPathParamsCodec = <const Path extends RoutePath>(
  basePath: Path & RoutePathWithoutOptionalStaticSegments<Path> & RoutePathWithTrailingOptionalParamsOnly<Path>
) => {
  const pattern = parsePathPattern(typeof basePath === 'string' ? basePath : '');
  assertSupportedPathPattern(pattern);

  return <
    const Blueprints extends InferPathParamBlueprintMapFromPath<Path> & Record<string, InferPathParamBlueprintFromValue>
  >(
    input: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Blueprints
  ) => {
    const blueprints = input(PATH_PARAM_BLUEPRINTS_MAP);
    const blueprintMap = blueprints as Record<string, InferPathParamBlueprintFromValue>;
    const blueprintKeys = Object.keys(blueprints || {});

    const type = Object.create(null) as InferPathParamValuesFromBlueprintMap<Blueprints>;
    for (const key of blueprintKeys) {
      type[key as keyof typeof type] = blueprintMap[key].type as never;
    }

    const parse = (location: Location): InferPathParamValuesFromBlueprintMap<Blueprints> => {
      const raw = matchPathPattern(pattern, typeof location?.pathname === 'string' ? location.pathname : '');

      const parsed = Object.create(null) as InferPathParamValuesFromBlueprintMap<Blueprints>;
      for (const key of blueprintKeys) {
        parsed[key as keyof typeof parsed] = blueprintMap[key].parse(raw?.[key]) as never;
      }
      return parsed;
    };

    const stringify = (params: InferPathParamStringifyValuesFromBlueprintMap<Path, Blueprints>): string =>
      stringifyPathPattern(pattern, (params ?? {}) as Record<string, unknown>, blueprintMap);

    return { blueprints, type, parse, stringify };
  };
};
