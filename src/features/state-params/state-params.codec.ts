import type {
  InferStateParamBlueprintFromValue,
  InferStateParamFromBlueprint,
  InferStateParamInputFromBlueprint,
  StateParamShape
} from 'features/state-params';
import {
  cloneStateParamValue,
  createDefaultStateParamBlueprint,
  getStateParamDeltaValues,
  mergeStateParamValues
} from 'features/state-params';
import type { Location } from 'react-router';

export const createStateParamBlueprint = function <const Value extends StateParamShape>(
  defaultValue: Value
): InferStateParamBlueprintFromValue<Value> {
  return {
    type: cloneStateParamValue(defaultValue),
    full: (value: unknown) => mergeStateParamValues(defaultValue, value),
    delta: (value: Partial<StateParamShape> | StateParamShape | undefined) =>
      getStateParamDeltaValues(defaultValue, value)
  };
};

export function createStateParamCodec<const Blueprint extends InferStateParamBlueprintFromValue>(
  input: (blueprint: typeof createStateParamBlueprint) => Blueprint
) {
  const blueprint =
    input(createStateParamBlueprint) ?? (createDefaultStateParamBlueprint() as InferStateParamBlueprintFromValue);

  const type: InferStateParamFromBlueprint<Blueprint> = cloneStateParamValue(blueprint.type) as never;

  const full = (location: Location): InferStateParamFromBlueprint<Blueprint> =>
    blueprint.full(location?.state) as InferStateParamFromBlueprint<Blueprint>;

  const delta = (value: InferStateParamInputFromBlueprint<Blueprint> | undefined): unknown => blueprint.delta(value);

  return { blueprint, type, full, delta };
}
