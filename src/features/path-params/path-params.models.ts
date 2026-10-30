import type { createPathParamsCodec } from 'features/path-params';
import type { RouteProps } from 'react-router';

//*****************************************************************************************
// Path Params Primitives
//*****************************************************************************************

/** A route path string, potentially containing `:param` segments. */
export type RoutePath = RouteProps['path'];

/** The set of primitive value types a path parameter can hold. */
export type PathParamValue = string | number | boolean;

type PathSegments<Path extends string> = Path extends `${infer Segment}/${infer Rest}`
  ? Segment | PathSegments<Rest>
  : Path;

type OptionalStaticPathSegments<Path extends string> = Exclude<
  Extract<PathSegments<Path>, `${string}?`>,
  Extract<PathSegments<Path>, `:${string}?`>
>;

type PathParamKeyFromSegments<Segments> = Segments extends string
  ? Segments extends `:${infer Key}`
    ? Key extends `${string}?`
      ? Key extends `${infer RequiredKey}?`
        ? RequiredKey
        : never
      : Key
    : never
  : never;

type OptionalPathParamKeyFromSegments<Segments> = Segments extends string
  ? Segments extends `:${infer Key}?`
    ? Key
    : never
  : never;

/** Resolves to `never` for literal route paths containing optional static segments. */
export type RoutePathWithoutOptionalStaticSegments<Path extends RoutePath> = Path extends string
  ? string extends Path
    ? Path
    : OptionalStaticPathSegments<Path> extends never
      ? Path
      : never
  : never;

// A `?` segment followed by a segment that is not itself optional.
type HasSegmentAfterOptional<
  Path extends string,
  OptionalSeen extends boolean = false
> = Path extends `${infer Segment}/${infer Rest}`
  ? Segment extends `${string}?`
    ? HasSegmentAfterOptional<Rest, true>
    : OptionalSeen extends true
      ? true
      : HasSegmentAfterOptional<Rest, false>
  : Path extends `${string}?`
    ? false
    : OptionalSeen;

/** Resolves to `never` for literal route paths where an optional segment is followed by a required one. */
export type RoutePathWithTrailingOptionalParamsOnly<Path extends RoutePath> = Path extends string
  ? string extends Path
    ? Path
    : HasSegmentAfterOptional<Path> extends true
      ? never
      : Path
  : never;

/** Resolves to `never` for literal route paths that fail either path validation; otherwise the path itself. */
export type ValidRoutePath<Path extends RoutePath> = Path &
  RoutePathWithoutOptionalStaticSegments<Path> &
  RoutePathWithTrailingOptionalParamsOnly<Path>;

type JoinPathSegments<Prefix extends string, Segment extends string> = Prefix extends ''
  ? Segment
  : `${Prefix}/${Segment}`;

// `Rest` starts at the first optional segment; every optional after it is also optional.
type ExpandOptionalPathForms<Prefix extends string, Rest extends string> = Rest extends `:${infer Key}?/${infer Next}`
  ? Prefix | ExpandOptionalPathForms<JoinPathSegments<Prefix, `:${Key}`>, Next>
  : Rest extends `:${infer Key}?`
    ? Prefix | JoinPathSegments<Prefix, `:${Key}`>
    : never;

type WalkPathForms<Path extends string, Prefix extends string = ''> = Path extends `${infer Segment}/${infer Rest}`
  ? Segment extends `:${string}?`
    ? ExpandOptionalPathForms<Prefix, Path>
    : WalkPathForms<Rest, JoinPathSegments<Prefix, Segment>>
  : Path extends `:${string}?`
    ? ExpandOptionalPathForms<Prefix, Path>
    : JoinPathSegments<Prefix, Path>;

/**
 * Expands the trailing optional params of a route path literal into every form the path can take.
 * E.g. `'/path/:option?/:other?'` → `'/path' | '/path/:option' | '/path/:option/:other'`.
 * Assumes optional params are trailing; see `RoutePathWithTrailingOptionalParamsOnly`.
 */
export type InferRoutePathFormFromPath<Path extends RoutePath> = string extends Path
  ? string
  : Path extends `/${infer Rest}`
    ? `/${WalkPathForms<Rest>}`
    : Path extends string
      ? WalkPathForms<Path>
      : never;

/** Extracts the keys of optional `:param?` segments from a route path literal. */
export type InferOptionalPathParamKeyFromPath<Path extends RoutePath> = string extends Path
  ? never
  : Path extends string
    ? OptionalPathParamKeyFromSegments<PathSegments<Path>>
    : never;

/**
 * Extracts keys only from complete `:param` segments in a route path literal.
 * E.g. `'/users/:id/posts/:postId'` → `'id' | 'postId'`.
 * Optional path segments are unsupported and resolve to `never`.
 */
export type InferPathParamKeyFromPath<Path extends RoutePath> = string extends Path
  ? string
  : Path extends string
    ? OptionalStaticPathSegments<Path> extends never
      ? PathParamKeyFromSegments<PathSegments<Path>>
      : never
    : never;

//*****************************************************************************************
// Path Params Blueprints
//*****************************************************************************************

/**
 * Identifies which blueprint variant produced a parameter, independent of its runtime value type.
 */
export type PathParamBlueprintKind = 'string' | 'number' | 'boolean' | 'enum';

/**
 * Defines how a single path parameter is parsed from and serialized to the URL.
 * The generic `Value` determines the runtime type of the resolved parameter.
 */
export type InferPathParamBlueprintFromValue<Value extends PathParamValue = PathParamValue> = {
  /** Representative value used for type inference at compile time. */
  type: Value;
  /** Identifies the blueprint variant (e.g. distinguishes `enum` from a plain `string`). */
  kind: PathParamBlueprintKind;
  /** Allowed values, present only for the `enum` blueprint. */
  options?: readonly PathParamValue[];
  /** Deserializes a raw URL segment into the typed value. */
  parse: (value: string | undefined) => Value;
  /** Serializes the typed value back into a URL-safe string. */
  stringify: (value: Value) => string;
};

/**
 * A keyed record mapping each `:param` key in a path to its blueprint definition.
 * Resolves to `never` when the path contains no parameters.
 */
// prettier-ignore
export type InferPathParamBlueprintMapFromPath<Path extends RoutePath = RoutePath> =
  [InferPathParamKeyFromPath<Path>] extends [never]
    ? never
    : Record<InferPathParamKeyFromPath<Path>, InferPathParamBlueprintFromValue>;

/**
 * Infers the resolved runtime value types for each parameter in a blueprint map.
 * Maps each key to the concrete type its blueprint produces.
 */
export type InferPathParamValuesFromBlueprintMap<Blueprints extends InferPathParamBlueprintMapFromPath> = {
  -readonly [K in keyof Blueprints]: Blueprints[K] extends InferPathParamBlueprintFromValue<infer V> ? V : never;
};

/** Values accepted by stringify; optional path parameters may be omitted or set to null. */
export type InferPathParamStringifyValuesFromBlueprintMap<
  Path extends RoutePath,
  Blueprints extends InferPathParamBlueprintMapFromPath<Path>
> = Omit<InferPathParamValuesFromBlueprintMap<Blueprints>, InferOptionalPathParamKeyFromPath<Path>> & {
  [Key in Extract<keyof Blueprints, InferOptionalPathParamKeyFromPath<Path>>]?:
    | InferPathParamValuesFromBlueprintMap<Blueprints>[Key]
    | null;
};

//*****************************************************************************************
// Path Params Codec
//*****************************************************************************************

/** Resolved codec type produced by `createPathParamsCodec`. */
export type InferPathParamCodecFromPath<Path extends RoutePath> = ReturnType<
  ReturnType<typeof createPathParamsCodec<Path>>
>;

//*****************************************************************************************
// Path Pattern
//*****************************************************************************************

/** One segment of a parsed route pattern; `normalized` is the decoded, lower-cased form used for matching. */
export type PathPatternSegment =
  | { kind: 'static'; raw: string; normalized: string }
  | { kind: 'param'; raw: string; key: string; optional: boolean };

/** A route pattern split into segments once so parsing and serialization do not re-split it on every call. */
export type PathPattern = {
  /** Whether the pattern starts with `/`; the leading slash is not represented in `segments`. */
  absolute: boolean;
  segments: PathPatternSegment[];
};
