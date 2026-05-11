import React, { ComponentType, MemoExoticComponent, ReactNode } from 'react';

/**
 * @name generateRandomUUID
 * @description Generates a random base64 id with a configurable character length and retries on collisions.
 * @param existingUUIDs - List of ids that must be avoided
 * @param size - Number of characters to include in the generated id
 * @returns A unique id not found in existingUUIDs
 */
export const generateRandomUUID = (existingUUIDs: string[] = [], size: number = 16) => {
  let uuid = null;

  while (uuid === null || existingUUIDs.findIndex(u => u === uuid) >= 0) {
    const byteLength = Math.max(1, Math.ceil(size * 0.75));
    const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(byteLength))));
    uuid = raw.replace(/=/g, '').slice(0, Math.max(1, Math.trunc(size)));
  }

  return uuid;
};

/**
 * @name shallowObjectCompare
 * @description Compares two root objects shallowly by own keys and top-level values.
 * @param left - First root object to compare
 * @param right - Second root object to compare
 * @returns True when both root objects have the same keys and top-level values by reference/value
 */
export function shallowCompareObject(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object' ||
    Array.isArray(left) ||
    Array.isArray(right)
  ) {
    return false;
  }

  const leftObj = left as Record<string, unknown>;
  const rightObj = right as Record<string, unknown>;
  const keysA = Object.keys(leftObj);
  const keysB = Object.keys(rightObj);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => key in rightObj && Object.is(leftObj[key], rightObj[key]));
}

/**
 * @name deepCompare
 * @description Deeply compares two values by structure and value. Function values are compared by reference.
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns True when values are deeply equal, otherwise false
 */
export const deepCompare = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (typeof left === 'function' || typeof right === 'function') return false;

  if (left == null || right == null) return false;
  if (typeof left !== 'object' || typeof right !== 'object') return false;

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
      if (!deepCompare(left[i], right[i])) return false;
    }
    return true;
  }

  const leftObj = left as Record<string, unknown>;
  const rightObj = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftObj);
  const rightKeys = Object.keys(rightObj);

  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    if (!(key in rightObj)) return false;
    if (!deepCompare(leftObj[key], rightObj[key])) return false;
  }

  return true;
};

/**
 * @name shallowReconcile
 * @description Reconciles root-level fields by prioritizing current values, retaining explicit result-only values,
 * and dropping values removed from current when they already existed in previous.
 * @param current - Latest partial state to apply
 * @param previous - Previous partial state used to detect removals
 * @param result - Current accumulated result state
 * @returns A reconciled object with shallow (root-level) merge semantics
 */
export function shallowReconcile<T extends Record<string, unknown>>(
  current: Partial<T>,
  previous: Partial<T>,
  result: Partial<T>
): T {
  const output: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(result), ...Object.keys(current), ...Object.keys(previous)])) {
    if (key in current) {
      output[key] = current[key];
    } else if (key in result && key in previous) {
      continue;
    } else if (key in result) {
      output[key] = result[key];
    }
  }

  return output as T;
}

/**
 * @name deepReconcile
 * @description Reconciles fields by prioritizing incoming values and restoring initial values for keys present in
 * existing+initial but missing from incoming.
 * @param incoming - Latest partial state to apply
 * @param existing - Current stored state before reconciliation
 * @param initial - Initial baseline state used for restoration
 * @returns A reconciled object following deep-reconcile fallback precedence
 */
export function deepReconcile<T extends Record<string, unknown>>(
  incoming: Partial<T>,
  existing: Partial<T>,
  initial: Partial<T>
): T {
  const result: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(initial), ...Object.keys(existing), ...Object.keys(incoming)])) {
    if (key in incoming) {
      result[key] = incoming[key];
    } else if (key in existing && key in initial) {
      result[key] = initial[key];
    } else {
      result[key] = existing[key] ?? initial[key];
    }
  }

  return result as T;
}

/**
 * @name toElement
 * @description Reconciles fields by prioritizing incoming values and restoring initial values for keys present in
 * existing+initial but missing from incoming.
 * @param incoming - Latest partial state to apply
 * @param existing - Current stored state before reconciliation
 * @param initial - Initial baseline state used for restoration
 * @returns A reconciled object following deep-reconcile fallback precedence
 */
export const toElement = (value: ReactNode | MemoExoticComponent<ComponentType<any>>) => {
  if (React.isValidElement(value)) {
    return value;
  }

  const Component = value as ComponentType<any>;
  return <Component />;
};
