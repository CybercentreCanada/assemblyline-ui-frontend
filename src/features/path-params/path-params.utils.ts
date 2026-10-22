import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamStringifyValuesFromBlueprintMap,
  InferPathParamValuesFromBlueprintMap,
  PathAssignment,
  PathMatch,
  PathMatchContext,
  PathMatchFinder,
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

/**
 * @name splitPathname
 * @description Strips one leading slash from a pathname and splits it into segments.
 * @param pathname - Location pathname
 * @returns Raw pathname segments; an empty pathname and `/` both yield a single empty segment
 */
export const splitPathname = (pathname: string): string[] =>
  (pathname.startsWith('/') ? pathname.slice(1) : pathname).split('/');

/**
 * @name createPathMatchContext
 * @description Creates the state shared by every step of one pathname match.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param pathname - Location pathname to match
 * @returns A fresh match context with an empty memo
 */
export const createPathMatchContext = (pattern: PathPattern, pathname: string): PathMatchContext => ({
  segments: pattern.segments,
  pathParts: splitPathname(pathname),
  isRoot: pathname === '/',
  decodedParts: [],
  memo: new Map()
});

/**
 * @name getDecodedPathPart
 * @description Decodes a pathname segment once and caches it on the context.
 * @param context - Match context
 * @param index - Index into the pathname segments
 * @returns The decoded segment
 */
export const getDecodedPathPart = (context: PathMatchContext, index: number): string =>
  (context.decodedParts[index] ??= decodePathSegment(context.pathParts[index]));

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
 * @name prependPathAssignment
 * @description Adds one parameter assignment in front of an already matched suffix.
 * @param rest - Match of the remaining pattern, or `null` when it did not match
 * @param key - Parameter key
 * @param value - Raw decoded value, or `undefined` when the parameter was omitted
 * @param missing - Number of missing required parameters this assignment adds
 * @returns The extended match, or `null` when `rest` is `null`
 */
export const prependPathAssignment = (
  rest: PathMatch | null,
  key: string,
  value: string | undefined,
  missing: number
): PathMatch | null =>
  rest && {
    missingRequired: rest.missingRequired + missing,
    assignments: { key, value, next: rest.assignments }
  };

/**
 * @name selectPathMatch
 * @description Chooses between consuming a segment as an optional parameter and omitting it. The match with fewer missing required parameters wins; ties go to the consuming match.
 * @param included - Match that consumed the segment, or `null`
 * @param omitted - Match that omitted the parameter, or `null`
 * @returns The preferred match, or `null` when neither matched
 */
export const selectPathMatch = (included: PathMatch | null, omitted: PathMatch | null): PathMatch | null => {
  if (!included) return omitted;
  if (!omitted) return included;
  return omitted.missingRequired < included.missingRequired ? omitted : included;
};

/**
 * @name resolvePathMatch
 * @description Matches the pattern suffix from `segmentIndex` against the pathname suffix from `pathIndex`, without memoization. Recursion goes through `find` so callers can memoize it.
 * @param context - Match context
 * @param segmentIndex - Index of the next pattern segment
 * @param pathIndex - Index of the next pathname segment
 * @param find - Finder used for the remaining suffix
 * @returns The best match, or `null` when the suffixes do not match
 */
export const resolvePathMatch = (
  context: PathMatchContext,
  segmentIndex: number,
  pathIndex: number,
  find: PathMatchFinder
): PathMatch | null => {
  const { segments, pathParts, isRoot } = context;
  if (segmentIndex === segments.length) {
    return isPathConsumed(pathParts, pathIndex) ? { missingRequired: 0, assignments: null } : null;
  }

  const segment = segments[segmentIndex];
  if (segment.kind === 'static') {
    if (pathIndex >= pathParts.length || segment.normalized !== getDecodedPathPart(context, pathIndex).toLowerCase()) {
      return null;
    }
    return find(context, segmentIndex + 1, pathIndex + 1);
  }

  const { key, optional } = segment;
  if (pathIndex >= pathParts.length) {
    return prependPathAssignment(find(context, segmentIndex + 1, pathIndex), key, undefined, optional ? 0 : 1);
  }
  if (optional && isRoot && pathIndex === 0) {
    return prependPathAssignment(find(context, segmentIndex + 1, pathIndex), key, undefined, 0);
  }

  const included = prependPathAssignment(
    find(context, segmentIndex + 1, pathIndex + 1),
    key,
    getDecodedPathPart(context, pathIndex),
    0
  );
  if (!optional) return included;

  const omitted = prependPathAssignment(find(context, segmentIndex + 1, pathIndex), key, undefined, 0);
  return selectPathMatch(included, omitted);
};

/**
 * @name findPathMatch
 * @description Memoized `resolvePathMatch`, so consecutive optional parameters cannot branch exponentially.
 * @param context - Match context; its memo is updated
 * @param segmentIndex - Index of the next pattern segment
 * @param pathIndex - Index of the next pathname segment
 * @returns The best match, or `null` when the suffixes do not match
 */
export const findPathMatch: PathMatchFinder = (context, segmentIndex, pathIndex) => {
  const memoKey = segmentIndex * (context.pathParts.length + 1) + pathIndex;
  const cached = context.memo.get(memoKey);
  if (cached !== undefined) return cached;

  const result = resolvePathMatch(context, segmentIndex, pathIndex, findPathMatch);
  context.memo.set(memoKey, result);
  return result;
};

/**
 * @name collectPathParams
 * @description Converts the assignments of the selected match into a null-prototype record, validating supplied values. Validation happens only here so abandoned branches cannot reject a valid omitted-parameter match.
 * @param assignments - Assignments of the selected match
 * @returns Raw values keyed by parameter name; omitted parameters are `undefined`. Throws a `TypeError` for supplied values that are empty or `.` / `..`.
 */
export const collectPathParams = (assignments: PathAssignment | null): Record<string, string | undefined> => {
  const params = Object.create(null) as Record<string, string | undefined>;
  for (let node = assignments; node; node = node.next) {
    if (node.value !== undefined) assertValidPathParam(node.value);
    params[node.key] = node.value;
  }
  return params;
};

/**
 * @name matchPathPattern
 * @description Matches a pathname against a parsed pattern and extracts raw parameter values. Static segments compare decoded and case-insensitively. Optional parameters may be omitted; when that makes several matches possible, the one supplying the most required parameters wins.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param pathname - Location pathname to match
 * @returns Raw values keyed by parameter name (`undefined` for omitted parameters), or `null` when the pathname does not match. Throws a `TypeError` for supplied values that are empty or `.` / `..`.
 */
export const matchPathPattern = (pattern: PathPattern, pathname: string): Record<string, string | undefined> | null => {
  const result = findPathMatch(createPathMatchContext(pattern, pathname), 0, 0);
  return result && collectPathParams(result.assignments);
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
 * @name getSegmentBlueprints
 * @description Looks up the blueprint of every pattern segment, reading only own properties of `blueprints`.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param blueprints - Blueprints keyed by parameter name
 * @returns One entry per pattern segment; `undefined` for static segments and params without a blueprint
 */
export const getSegmentBlueprints = (
  pattern: PathPattern,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): (InferPathParamBlueprintFromValue | undefined)[] =>
  pattern.segments.map(segment => (segment.kind === 'param' ? getOwnValue(blueprints, segment.key) : undefined));

/**
 * @name serializePathSegments
 * @description Serializes every pattern segment. Static segments are kept as written and a param without a blueprint keeps its `:param` text.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @param segmentBlueprints - Result of `getSegmentBlueprints`
 * @returns One entry per pattern segment; `null` marks an omitted optional parameter. Throws a `TypeError` for empty or `.` / `..` values and a `URIError` for values that cannot be encoded.
 */
export const serializePathSegments = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  segmentBlueprints: (InferPathParamBlueprintFromValue | undefined)[]
): (string | null)[] =>
  pattern.segments.map((segment, index): string | null => {
    if (segment.kind === 'static') return segment.raw;

    const value = getOwnValue(values, segment.key);
    if (segment.optional && value == null) return null;

    const blueprint = segmentBlueprints[index];
    return blueprint ? serializePathParam(blueprint, value) : segment.raw;
  });

/**
 * @name getOmittedParamIndexes
 * @description Finds the omitted optional parameters that have a blueprint, which are the only ones whose default can be written.
 * @param encodedParts - Result of `serializePathSegments`
 * @param segmentBlueprints - Result of `getSegmentBlueprints`
 * @returns Segment indexes in pattern order
 */
export const getOmittedParamIndexes = (
  encodedParts: (string | null)[],
  segmentBlueprints: (InferPathParamBlueprintFromValue | undefined)[]
): number[] => encodedParts.flatMap((part, index) => (part === null && segmentBlueprints[index] ? [index] : []));

/**
 * @name getDefaultPathParam
 * @description Serializes the value a blueprint produces for an omitted parameter.
 * @param blueprint - Blueprint of the parameter
 * @returns The encoded default, or `null` when the default itself is not a valid path value (such as `''`)
 */
export const getDefaultPathParam = (blueprint: InferPathParamBlueprintFromValue): string | null => {
  try {
    return serializePathParam(blueprint, blueprint.parse(undefined));
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
};

/**
 * @name getFillableParamIndexes
 * @description Keeps the omitted parameters whose blueprint default is a valid path value; the others can only stay omitted.
 * @param indexes - Segment indexes of omitted parameters, such as the result of `getOmittedParamIndexes`
 * @param segmentBlueprints - Result of `getSegmentBlueprints`
 * @returns The fillable segment indexes, in the order given
 */
export const getFillableParamIndexes = (
  indexes: number[],
  segmentBlueprints: (InferPathParamBlueprintFromValue | undefined)[]
): number[] => indexes.filter(index => getDefaultPathParam(segmentBlueprints[index]) !== null);

/**
 * @name fillOmittedDefaults
 * @description Returns a copy of the serialized parts in which the listed omitted parameters hold their blueprint default.
 * @param encodedParts - Result of `serializePathSegments`; not modified
 * @param segmentBlueprints - Result of `getSegmentBlueprints`
 * @param indexes - Segment indexes of the omitted parameters to fill
 * @returns The filled parts, or `null` when one of the defaults cannot be serialized
 */
export const fillOmittedDefaults = (
  encodedParts: (string | null)[],
  segmentBlueprints: (InferPathParamBlueprintFromValue | undefined)[],
  indexes: number[]
): (string | null)[] | null => {
  const filled = [...encodedParts];
  for (const index of indexes) {
    const defaultPart = getDefaultPathParam(segmentBlueprints[index]);
    if (defaultPart === null) return null;
    filled[index] = defaultPart;
  }
  return filled;
};

/**
 * @name joinPathParts
 * @description Joins serialized segments into a pathname, skipping omitted (`null`) ones.
 * @param pattern - Pattern created by `parsePathPattern`; decides whether the pathname starts with `/`
 * @param parts - Serialized segments
 * @returns The pathname
 */
export const joinPathParts = (pattern: PathPattern, parts: (string | null)[]): string =>
  (pattern.absolute ? '/' : '') + parts.filter(part => part !== null).join('/');

/**
 * @name pathnameRoundTrips
 * @description Checks that parsing a pathname gives back every value that was serialized into it, so a supplied value is never read as a different parameter.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param pathname - Candidate pathname
 * @param encodedParts - Result of `serializePathSegments` for the supplied values
 * @param segmentBlueprints - Result of `getSegmentBlueprints`
 * @returns `true` when the pathname matches the pattern and every parameter parses to its intended value
 */
export const pathnameRoundTrips = (
  pattern: PathPattern,
  pathname: string,
  encodedParts: (string | null)[],
  segmentBlueprints: (InferPathParamBlueprintFromValue | undefined)[]
): boolean => {
  let params: Record<string, string | undefined> | null;
  try {
    params = matchPathPattern(pattern, pathname);
  } catch (error) {
    if (error instanceof TypeError) return false;
    throw error;
  }
  if (!params) return false;

  return pattern.segments.every((segment, index) => {
    const blueprint = segmentBlueprints[index];
    if (segment.kind === 'static' || !blueprint) return true;

    const encoded = encodedParts[index];
    const expected = encoded === null ? undefined : decodePathSegment(encoded);
    return Object.is(blueprint.parse(params[segment.key]), blueprint.parse(expected));
  });
};

/**
 * @name stringifyPathPattern
 * @description Builds a pathname from a parsed pattern. Omitted optional parameters are dropped when the result still parses back to the same values. Otherwise the blueprint defaults of a growing set of omitted optionals are written, starting with the last one and skipping those whose default is not a valid path value, until it does. A supplied value is therefore never read as a different parameter.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @param blueprints - Blueprints keyed by parameter name; only own properties are read
 * @returns The encoded pathname. Throws a `TypeError` for empty or `.` / `..` values, or when no unambiguous pathname exists, and a `URIError` for values that cannot be encoded.
 */
export const stringifyPathPattern = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): string => {
  const segmentBlueprints = getSegmentBlueprints(pattern, blueprints);
  const encodedParts = serializePathSegments(pattern, values, segmentBlueprints);
  const omitted = getOmittedParamIndexes(encodedParts, segmentBlueprints);
  if (omitted.length === 0) return joinPathParts(pattern, encodedParts);

  const fillable = getFillableParamIndexes(omitted, segmentBlueprints);

  // Filling from the last omission backwards keeps earlier, unrelated omissions out of the path.
  for (let defaultCount = 0; defaultCount <= fillable.length; defaultCount += 1) {
    const candidate = fillOmittedDefaults(
      encodedParts,
      segmentBlueprints,
      fillable.slice(fillable.length - defaultCount)
    );
    if (!candidate) continue;

    const pathname = joinPathParts(pattern, candidate);
    if (pathnameRoundTrips(pattern, pathname, encodedParts, segmentBlueprints)) return pathname;
  }

  throw new TypeError('Optional path parameters cannot be serialized without changing their values.');
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
