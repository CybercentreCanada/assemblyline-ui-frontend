import type { createHashParamCodec } from 'features/hash-params';

//*****************************************************************************************
// Hash Params Primitives
//*****************************************************************************************

/** The set of allowed hash fragment values (enum). */
export type HashParamValue = string | number | boolean;

//*****************************************************************************************
// Hash Params Blueprints
//*****************************************************************************************

/**
 * Defines how the hash fragment is parsed from and serialized to the URL.
 * Returns a single enum value representing the hash fragment.
 * The generic `Value` determines the runtime type of the resolved parameter.
 */
export type InferHashParamBlueprintFromValue<Value extends HashParamValue = HashParamValue> = {
  /** Representative value used for type inference at compile time. */
  type: Value;
  /** Deserializes a raw URL hash into the typed value. */
  parse: (value: string | undefined) => Value | undefined;
  /** Serializes the typed value back into a URL-safe hash string. */
  stringify: (value: Value | undefined) => string;
};

/**
 * Infers the resolved runtime value type from a hash parameter blueprint.
 * Returns either the blueprint's value type or undefined.
 */
export type InferHashParamFromBlueprint<
  Blueprint extends InferHashParamBlueprintFromValue = InferHashParamBlueprintFromValue
> = Blueprint extends InferHashParamBlueprintFromValue<infer V> ? V | undefined : never;

//*****************************************************************************************
// Hash Params Codec
//*****************************************************************************************

/** Resolved codec type produced by `createHashParamCodec`. */
export type InferHashParamCodecFromBlueprint<
  Blueprint extends InferHashParamBlueprintFromValue = InferHashParamBlueprintFromValue
> = ReturnType<ReturnType<typeof createHashParamCodec>>;
