import type { StateParamShape, StateParamValue } from 'features/state-params/state-params.models';

//*****************************************************************************************
// Type Guards
//*****************************************************************************************

/**
 * @name isStateParamRecord
 * @description Narrows unknown values to object records allowed by state params.
 * @param value - Candidate value.
 * @returns True when value is a non-null object and not an array.
 */
export const isStateParamRecord = function (value: unknown): value is Record<string, StateParamValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

//*****************************************************************************************
// Cloning / Equality
//*****************************************************************************************

/**
 * @name cloneStateParamValue
 * @description Clones objects and arrays while returning primitives as-is.
 * @param value - State param value to clone.
 * @returns Cloned state param value.
 */
export const cloneStateParamValue = function <const Value extends StateParamValue>(value: Value): Value {
  if (value === null || typeof value !== 'object') return value;
  return structuredClone(value);
};

/**
 * @name areStateParamValuesEqual
 * @description Performs deep equality for allowed state param values.
 * @param left - Left value.
 * @param right - Right value.
 * @returns True when both values are deeply equal.
 */
export const areStateParamValuesEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;

    for (let i = 0; i < left.length; i++) {
      if (!areStateParamValuesEqual(left[i], right[i])) return false;
    }

    return true;
  }

  if (isStateParamRecord(left) || isStateParamRecord(right)) {
    if (!isStateParamRecord(left) || !isStateParamRecord(right)) return false;

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;

    for (const key of leftKeys) {
      if (!(key in right)) return false;
      if (!areStateParamValuesEqual(left[key], right[key])) return false;
    }

    return true;
  }

  return false;
};

//*****************************************************************************************
// Delta
//*****************************************************************************************

/**
 * @name getStateParamDeltaValue
 * @description Computes a nested delta value between default and next values.
 * @param defaultValue - Default baseline value.
 * @param nextValue - Candidate next value.
 * @returns Delta value or undefined when unchanged.
 */
export const getStateParamDeltaValue = function (
  defaultValue: unknown,
  nextValue: unknown
): StateParamValue | undefined {
  if (nextValue === undefined) return undefined;

  if (isStateParamRecord(nextValue)) {
    if (!isStateParamRecord(defaultValue)) {
      return cloneStateParamValue(nextValue as StateParamValue);
    }

    const delta: StateParamShape = {};
    let hasDelta = false;

    for (const [key, value] of Object.entries(nextValue)) {
      const nestedDelta = getStateParamDeltaValue(defaultValue[key], value);
      if (nestedDelta !== undefined) {
        delta[key] = nestedDelta;
        hasDelta = true;
      }
    }

    return hasDelta ? delta : undefined;
  }

  if (Array.isArray(nextValue)) {
    if (Array.isArray(defaultValue) && areStateParamValuesEqual(defaultValue, nextValue)) {
      return undefined;
    }

    return cloneStateParamValue(nextValue as StateParamValue[]);
  }

  if (Object.is(defaultValue, nextValue)) {
    return undefined;
  }

  return cloneStateParamValue(nextValue as StateParamValue);
};

/**
 * @name getStateParamDeltaValues
 * @description Computes top-level delta values against a default state shape.
 * @param defaultValue - Default baseline state.
 * @param nextValue - Candidate partial or full state.
 * @returns Delta object or undefined when unchanged.
 */
export const getStateParamDeltaValues = function <const Value extends StateParamShape>(
  defaultValue: Value,
  nextValue: Partial<StateParamShape> | StateParamShape | undefined
): unknown {
  if (!isStateParamRecord(nextValue)) return undefined;

  const delta: StateParamShape = {};
  let hasDelta = false;

  for (const [key, value] of Object.entries(nextValue)) {
    const nextDelta = getStateParamDeltaValue(defaultValue[key], value);
    if (nextDelta !== undefined) {
      delta[key] = nextDelta;
      hasDelta = true;
    }
  }

  return hasDelta ? delta : undefined;
};

//*****************************************************************************************
// Merge
//*****************************************************************************************

/**
 * @name mergeStateParamValues
 * @description Merges unknown route state into a cloned default state shape.
 * @param defaultValue - Default baseline state.
 * @param nextValue - Unknown route state payload.
 * @returns Merged state value.
 */
export const mergeStateParamValues = function <const Value extends StateParamShape>(
  defaultValue: Value,
  nextValue: unknown
): Value {
  const merged = cloneStateParamValue(defaultValue) as StateParamShape;
  if (!isStateParamRecord(nextValue)) return merged as Value;

  for (const [key, value] of Object.entries(nextValue)) {
    if (!(key in merged)) {
      merged[key] = cloneStateParamValue(value);
      continue;
    }

    const baseValue = merged[key];

    if (Array.isArray(baseValue)) {
      merged[key] = Array.isArray(value)
        ? cloneStateParamValue(value as StateParamValue[])
        : cloneStateParamValue(baseValue);
      continue;
    }

    if (isStateParamRecord(baseValue)) {
      merged[key] = mergeStateParamValues(baseValue, value);
      continue;
    }

    merged[key] = value === undefined ? cloneStateParamValue(baseValue) : cloneStateParamValue(value);
  }

  return merged as Value;
};
