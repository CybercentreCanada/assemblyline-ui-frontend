import type { createPathParamsCodec } from 'features/path-params';

//*****************************************************************************************
// Path Params Primitives
//*****************************************************************************************

/** The set of primitive value types a path parameter can hold. */
export type PathParamValue = string | number | boolean;

type PathSegments<Path extends string> = Path extends `${infer Segment}/${infer Rest}`
  ? Segment | PathSegments<Rest>
  : Path;

type PathParamKeyFromSegments<Segments> = Segments extends `:${infer Key}` ? Key : never;

/**
 * Extracts the key of every `:param` segment in a path definition literal.
 * E.g. `'/users/:id/posts/:postId'` → `'id' | 'postId'`.
 */
export type InferPathParamKeyFromPath<Path extends string> = string extends Path
  ? string
  : PathParamKeyFromSegments<PathSegments<Path>>;

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
export type InferPathParamBlueprintFromValue<Value extends PathParamValue | null = PathParamValue | null> = {
  /** Representative value used for type inference at compile time. */
  type: Value;
  /** Identifies the blueprint variant (e.g. distinguishes `enum` from a plain `string`). */
  kind: PathParamBlueprintKind;
  /** Allowed values, present only for the `enum` blueprint. */
  options?: readonly PathParamValue[];
  /** Deserializes a raw URL segment into the typed value; `undefined` means the segment is missing or empty. */
  parse: (value: string | undefined) => Value;
  /** Serializes the typed value back into a URL-safe string. */
  stringify: (value: Value | undefined) => string;
};

/**
 * A keyed record mapping each `:param` key in a path to its blueprint definition.
 * Resolves to `never` when the path contains no parameters.
 */
// prettier-ignore
export type InferPathParamBlueprintMapFromPath<Path extends string = string> =
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

//*****************************************************************************************
// Path Params Codec
//*****************************************************************************************

/** Resolved codec type produced by `createPathParamsCodec`. */
export type InferPathParamCodecFromPath<Path extends string> = ReturnType<
  ReturnType<typeof createPathParamsCodec<Path>>
>;

//*****************************************************************************************
// Path Pattern
//*****************************************************************************************

/** One segment of a parsed path definition. */
export type PathPatternSegment = { kind: 'static'; raw: string } | { kind: 'param'; raw: string; key: string };

/** A path definition split into segments once so parsing and serialization do not re-split it on every call. */
export type PathPattern = {
  /** Whether the definition starts with `/`; the leading slash is not represented in `segments`. */
  absolute: boolean;
  segments: PathPatternSegment[];
};
