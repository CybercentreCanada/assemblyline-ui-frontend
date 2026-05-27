import type { createPathParamsCodec } from 'features/path-params/path-params.codec';

//*****************************************************************************************
// Path Params Primitives
//*****************************************************************************************

/** A route path string, potentially containing `:param` segments. */
export type RoutePath = string;

/** The set of primitive value types a path parameter can hold. */
export type PathParamValue = string | number | boolean;

/**
 * Recursively extracts `:param` keys from a route path literal.
 * E.g. `'/users/:id/posts/:postId'` → `'id' | 'postId'`.
 */
export type InferPathParamKeyFromPath<Path extends RoutePath> = string extends Path
  ? string
  : Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | InferPathParamKeyFromPath<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Param
      : never;

//*****************************************************************************************
// Path Params Blueprints
//*****************************************************************************************

/**
 * Defines how a single path parameter is parsed from and serialized to the URL.
 * The generic `Value` determines the runtime type of the resolved parameter.
 */
export type InferPathParamBlueprintFromValue<Value extends PathParamValue = PathParamValue> = {
  /** Representative value used for type inference at compile time. */
  type: Value;
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

//*****************************************************************************************
// Path Params Codec
//*****************************************************************************************

/** Resolved codec type produced by `createPathParamsCodec`. */
export type InferPathParamCodecFromPath<Path extends RoutePath> = ReturnType<
  ReturnType<typeof createPathParamsCodec<Path>>
>;
