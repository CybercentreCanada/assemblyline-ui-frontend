import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamStringifyValuesFromBlueprintMap,
  InferPathParamValuesFromBlueprintMap,
  PathPattern,
  PathPatternSegment,
  RoutePath,
  RoutePathWithoutOptionalStaticSegments
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

type PathAssignment = { key: string; value: string | undefined; next: PathAssignment | null };
type PathMatch = { missingRequired: number; assignments: PathAssignment | null };

/**
 * @name matchPathPattern
 * @description Matches a pathname against a parsed pattern and extracts raw parameter values. Static segments compare decoded and case-insensitively. Optional parameters may be omitted; when that makes several matches possible, the one supplying the most required parameters wins.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param pathname - Location pathname to match
 * @returns Raw values keyed by parameter name (`undefined` for omitted parameters), or `null` when the pathname does not match. Throws a `TypeError` for supplied values that are empty or `.` / `..`.
 */
export const matchPathPattern = (pattern: PathPattern, pathname: string): Record<string, string | undefined> | null => {
  const { segments } = pattern;
  const pathParts = (pathname.startsWith('/') ? pathname.slice(1) : pathname).split('/');
  const isRoot = pathname === '/';
  const decodedParts: (string | undefined)[] = [];
  const memo = new Map<number, PathMatch | null>();

  const getDecodedPart = (index: number): string => (decodedParts[index] ??= decodePathSegment(pathParts[index]));

  const prepend = (rest: PathMatch | null, key: string, value: string | undefined, missing: number): PathMatch | null =>
    rest && {
      missingRequired: rest.missingRequired + missing,
      assignments: { key, value, next: rest.assignments }
    };

  const match = (segmentIndex: number, pathIndex: number): PathMatch | null => {
    // Memoized on (segment, path) position so consecutive optionals cannot branch exponentially.
    const memoKey = segmentIndex * (pathParts.length + 1) + pathIndex;
    const cached = memo.get(memoKey);
    if (cached !== undefined) return cached;

    const compute = (): PathMatch | null => {
      if (segmentIndex === segments.length) {
        const consumed =
          pathIndex === pathParts.length || (pathIndex === pathParts.length - 1 && pathParts[pathIndex] === '');
        return consumed ? { missingRequired: 0, assignments: null } : null;
      }

      const segment = segments[segmentIndex];
      if (segment.kind === 'static') {
        if (pathIndex >= pathParts.length || segment.normalized !== getDecodedPart(pathIndex).toLowerCase())
          return null;
        return match(segmentIndex + 1, pathIndex + 1);
      }

      const { key, optional } = segment;
      if (pathIndex >= pathParts.length) {
        return prepend(match(segmentIndex + 1, pathIndex), key, undefined, optional ? 0 : 1);
      }
      if (optional && isRoot && pathIndex === 0) {
        return prepend(match(segmentIndex + 1, pathIndex), key, undefined, 0);
      }

      const value = getDecodedPart(pathIndex);
      assertValidPathParam(value);
      const included = prepend(match(segmentIndex + 1, pathIndex + 1), key, value, 0);
      if (!optional) return included;

      const omitted = prepend(match(segmentIndex + 1, pathIndex), key, undefined, 0);
      if (!included) return omitted;
      if (!omitted) return included;
      return omitted.missingRequired < included.missingRequired ? omitted : included;
    };

    const result = compute();
    memo.set(memoKey, result);
    return result;
  };

  const result = match(0, 0);
  if (!result) return null;

  const params = Object.create(null) as Record<string, string | undefined>;
  for (let node = result.assignments; node; node = node.next) {
    params[node.key] = node.value;
  }
  return params;
};

/**
 * @name stringifyPathPattern
 * @description Builds a pathname from a parsed pattern. Omitted optional parameters are dropped, unless a later optional parameter in the same consecutive group is supplied; then their blueprint default is written so the value keeps its position.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @param blueprints - Blueprints keyed by parameter name; only own properties are read
 * @returns The encoded pathname. Throws a `TypeError` for empty or `.` / `..` values and a `URIError` for values that cannot be encoded.
 */
export const stringifyPathPattern = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): string => {
  const { segments } = pattern;

  const serialize = (blueprint: InferPathParamBlueprintFromValue, value: unknown): string => {
    const serialized = blueprint.stringify(value as never);
    const encoded = encodeURIComponent(serialized);
    assertValidPathParam(serialized);
    return encoded;
  };

  // An omitted optional needs its default written when a later optional in the same group is supplied.
  const needsDefault: boolean[] = new Array<boolean>(segments.length).fill(false);
  let laterOptionalSupplied = false;
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    if (segment.kind === 'static') {
      if (segment.raw !== '') laterOptionalSupplied = false;
    } else if (!segment.optional) {
      laterOptionalSupplied = false;
    } else if (getOwnValue(values, segment.key) != null) {
      laterOptionalSupplied = true;
    } else {
      needsDefault[index] = laterOptionalSupplied;
    }
  }

  const parts: string[] = [];
  segments.forEach((segment, index) => {
    if (segment.kind === 'static') {
      parts.push(segment.raw);
      return;
    }

    const blueprint = getOwnValue(blueprints, segment.key);
    const value = getOwnValue(values, segment.key);
    if (segment.optional && value == null) {
      if (needsDefault[index] && blueprint) parts.push(serialize(blueprint, blueprint.parse(undefined)));
      return;
    }

    parts.push(blueprint ? serialize(blueprint, value) : segment.raw);
  });

  return (pattern.absolute ? '/' : '') + parts.join('/');
};

//*****************************************************************************************
// Create Path Param Codec
//*****************************************************************************************
export const createPathParamsCodec = <const Path extends RoutePath>(
  basePath: Path & RoutePathWithoutOptionalStaticSegments<Path>
) => {
  const pattern = parsePathPattern(typeof basePath === 'string' ? basePath : '');
  if (pattern.segments.some(segment => segment.kind === 'static' && segment.raw.endsWith('?'))) {
    throw new TypeError('Optional static path segments are not supported.');
  }

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
