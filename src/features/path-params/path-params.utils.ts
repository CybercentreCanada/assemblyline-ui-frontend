import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamValuesFromBlueprintMap,
  PathPattern,
  PathPatternSegment
} from 'features/path-params';
import type { Location } from 'react-router';

//*****************************************************************************************
// Path Segments
//*****************************************************************************************

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
  string: <const DefaultValue extends string | null = null>(
    defaultValue: DefaultValue = null as DefaultValue
  ): InferPathParamBlueprintFromValue<string | Extract<DefaultValue, null>> => ({
    type: '',
    kind: 'string',
    parse: value => (value == null || value === '' ? defaultValue : value),
    stringify: value => (value == null ? '' : String(value))
  }),
  number: <const DefaultValue extends number | null = null>(
    defaultValue: DefaultValue = null as DefaultValue
  ): InferPathParamBlueprintFromValue<number | Extract<DefaultValue, null>> => ({
    type: 0,
    kind: 'number',
    parse: value => {
      if (value == null || value === '') return defaultValue;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    stringify: value => (value == null ? '' : String(value))
  }),
  boolean: <const DefaultValue extends boolean | null = null>(
    defaultValue: DefaultValue = null as DefaultValue
  ): InferPathParamBlueprintFromValue<boolean | Extract<DefaultValue, null>> => ({
    type: false,
    kind: 'boolean',
    parse: value => {
      if (value == null || value === '') return defaultValue;
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      return defaultValue;
    },
    stringify: value => (value == null ? '' : String(value))
  }),
  enum: <
    const Values extends readonly [string | boolean | number, ...(string | boolean | number)[]],
    const DefaultValue extends Values[number] | null = null
  >(
    values: Values,
    defaultValue: DefaultValue = null as DefaultValue
  ): InferPathParamBlueprintFromValue<Values[number] | Extract<DefaultValue, null>> => {
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
      parse: value => (value == null || value === '' ? defaultValue : (optionByString.get(value) ?? defaultValue)),
      stringify: value => {
        for (const candidate of values) {
          if (Object.is(candidate, value)) return String(candidate);
        }
        return defaultValue == null ? '' : String(defaultValue);
      }
    };
  }
};

//*****************************************************************************************
// Path Pattern
//*****************************************************************************************

/**
 * @name parsePathPattern
 * @description Splits a path definition into static and `:param` segments once, so it is not re-split on every parse or stringify call.
 * @param path - Path definition such as `/alerts/:id/:tab`
 * @returns The parsed pattern; a segment is a parameter when it starts with `:`
 */
export const parsePathPattern = (path: string): PathPattern => {
  const absolute = path.startsWith('/');
  const segments = (absolute ? path.slice(1) : path)
    .split('/')
    .map(
      (raw): PathPatternSegment =>
        raw.startsWith(':') ? { kind: 'param', raw, key: raw.slice(1) } : { kind: 'static', raw }
    );

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
 * @name extractPathParams
 * @description Reads the raw value of every parameter by position. Static segments are not compared with the pathname.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param pathname - Location pathname to read from
 * @returns Decoded values keyed by parameter name; a missing or empty segment is `undefined`
 */
export const extractPathParams = (pattern: PathPattern, pathname: string): Record<string, string | undefined> => {
  const pathParts = splitPathname(pathname);
  const params = Object.create(null) as Record<string, string | undefined>;

  for (const [index, segment] of pattern.segments.entries()) {
    if (segment.kind !== 'param') continue;
    const part = pathParts[index];
    params[segment.key] = part ? decodePathSegment(part) : undefined;
  }

  return params;
};

//*****************************************************************************************
// Path Serialization
//*****************************************************************************************

/**
 * @name serializePathParam
 * @description Serializes one parameter value through its blueprint and URI-encodes it into a single path segment.
 * @param blueprint - Blueprint of the parameter
 * @param value - Typed value to serialize
 * @returns The encoded path segment. Throws a `URIError` for values that cannot be encoded.
 */
export const serializePathParam = (blueprint: InferPathParamBlueprintFromValue, value: unknown): string =>
  encodeURIComponent(blueprint.stringify(value as never));

/**
 * @name serializePathSegments
 * @description Serializes every pattern segment in order. A param without a blueprint keeps its `:param` text.
 * @param pattern - Pattern created by `parsePathPattern`
 * @param values - Parameter values; only own properties are read
 * @param blueprints - Blueprints keyed by parameter name; only own properties are read
 * @returns The encoded segments in pattern order. Throws a `URIError` for values that cannot be encoded.
 */
export const serializePathSegments = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): string[] =>
  pattern.segments.map(segment => {
    if (segment.kind === 'static') return segment.raw;

    const blueprint = getOwnValue(blueprints, segment.key);
    return blueprint ? serializePathParam(blueprint, getOwnValue(values, segment.key)) : segment.raw;
  });

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
 * @returns The encoded pathname. Throws a `URIError` for values that cannot be encoded.
 */
export const stringifyPathPattern = (
  pattern: PathPattern,
  values: Record<string, unknown>,
  blueprints: Record<string, InferPathParamBlueprintFromValue>
): string => joinPathParts(pattern, serializePathSegments(pattern, values, blueprints));

//*****************************************************************************************
// Create Path Param Codec
//*****************************************************************************************

/**
 * @name createPathParamsCodec
 * @description Creates a codec that reads typed parameters from a pathname and writes them back, for one path definition.
 * @param path - Path definition; each `:param` segment is a parameter
 * @returns A function that takes the blueprints of the parameters and returns the codec
 */
export const createPathParamsCodec = <const Path extends string>(path: Path) => {
  const pattern = parsePathPattern(path ?? '');

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
      const raw = extractPathParams(pattern, typeof location?.pathname === 'string' ? location.pathname : '');

      const parsed = Object.create(null) as InferPathParamValuesFromBlueprintMap<Blueprints>;
      for (const key of blueprintKeys) {
        parsed[key as keyof typeof parsed] = blueprintMap[key].parse(raw[key]) as never;
      }
      return parsed;
    };

    const stringify = (params: InferPathParamValuesFromBlueprintMap<Blueprints>): string =>
      stringifyPathPattern(pattern, (params ?? {}) as Record<string, unknown>, blueprintMap);

    return { blueprints, type, parse, stringify };
  };
};
