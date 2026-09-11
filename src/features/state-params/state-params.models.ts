import type { Location } from 'react-router';

//*****************************************************************************************
// State Params Primitives
//*****************************************************************************************

export type StateParamPrimitive = string | number | boolean | null;

export type StateParamValue = StateParamPrimitive | { [key: string]: StateParamValue } | StateParamValue[];

export type StateParamShape = Record<string, StateParamValue>;

//*****************************************************************************************
// State Params Blueprints
//*****************************************************************************************

export type InferStateParamBlueprintFromValue<Value extends StateParamShape = StateParamShape> = {
  type: Value;
  full: (value: unknown) => Value;
  delta: (value: Partial<StateParamShape> | StateParamShape | undefined) => unknown;
};

export type InferStateParamFromBlueprint<
  Blueprint extends InferStateParamBlueprintFromValue = InferStateParamBlueprintFromValue
> = Blueprint extends InferStateParamBlueprintFromValue<infer Value> ? Value : never;

export type InferStateParamInputFromBlueprint<
  Blueprint extends InferStateParamBlueprintFromValue = InferStateParamBlueprintFromValue
> = Blueprint extends InferStateParamBlueprintFromValue ? Partial<StateParamShape> : never;

//*****************************************************************************************
// State Params Codec
//*****************************************************************************************

export type InferStateParamCodecFromBlueprint<
  Blueprint extends InferStateParamBlueprintFromValue = InferStateParamBlueprintFromValue
> = {
  blueprint: Blueprint;
  type: InferStateParamFromBlueprint<Blueprint>;
  full: (location: Location) => InferStateParamFromBlueprint<Blueprint>;
  delta: (value: InferStateParamInputFromBlueprint<Blueprint> | undefined) => unknown;
};
