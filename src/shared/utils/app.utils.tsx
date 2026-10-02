import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';

/**
 * @name generateRandomUUID
 * @description Generates a random base64 id with a configurable character length and retries on collisions.
 * @param existingUUIDs - List of ids that must be avoided
 * @param size - Number of characters to include in the generated id
 * @returns A unique id not found in existingUUIDs
 */
export const generateRandomUUID = (existingUUIDs: string[] = [], size: number = 16): string => {
  let uuid = null;

  while (uuid === null || existingUUIDs.findIndex(u => u === uuid) >= 0) {
    const byteLength = Math.max(1, Math.ceil(size * 0.75));
    const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(byteLength))));
    uuid = raw.replace(/=/g, '').slice(0, Math.max(1, Math.trunc(size)));
  }

  return uuid as string;
};

/**
 * @name hashObject
 * @description Produces a deterministic 32-bit FNV-1a hash from a JSON-serializable value.
 * @param value - Input value to serialize and hash
 * @returns Lowercase 8-character hexadecimal hash string
 */
export const hashObject = (value: unknown): string => {
  const str = JSON.stringify(value);
  let hash = 0x811c9dc5; // FNV-1a 32-bit offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

const FNV_OFFSET_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

const hashString32 = (value: string): number => {
  let hash = FNV_OFFSET_32;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME_32);
  }

  return hash >>> 0;
};

const mixHash32 = (left: number, right: number): number => {
  const mixed = (left ^ Math.imul(right, 0x9e3779b1)) >>> 0;
  return Math.imul(mixed ^ (mixed >>> 16), 0x85ebca6b) >>> 0;
};

const hashPrimitive32 = (value: unknown): number => {
  if (value === null) return hashString32('null');

  switch (typeof value) {
    case 'undefined':
      return hashString32('undefined');
    case 'boolean':
      return hashString32(value ? 'true' : 'false');
    case 'number': {
      if (Number.isNaN(value)) return hashString32('number:NaN');
      if (!Number.isFinite(value)) return hashString32(`number:${value}`);
      const normalized = Object.is(value, -0) ? '-0' : `${value}`;
      return hashString32(`number:${normalized}`);
    }
    case 'bigint':
      return hashString32(`bigint:${value}`);
    case 'string':
      return hashString32(`string:${value}`);
    case 'symbol':
      return hashString32(`symbol:${String(value)}`);
    case 'function':
      return hashString32('function');
    default:
      return hashString32('unknown');
  }
};

/**
 * @name hashObjectKeyOrderIndependent
 * @description Produces a deterministic 32-bit hash where plain-object key insertion order does not affect the result.
 * Arrays remain order-sensitive.
 * @param value - Input value to hash
 * @returns Lowercase 8-character hexadecimal hash string
 */
export const hashObjectKeyOrderIndependent = (value: unknown): string => {
  const activeNodes = new WeakSet<object>();

  const hashValue = (current: unknown): number => {
    if (current == null || typeof current !== 'object') {
      return hashPrimitive32(current);
    }

    const currentObject = current;

    if (activeNodes.has(currentObject)) {
      throw new TypeError('Cannot hash circular structures.');
    }

    activeNodes.add(currentObject);

    try {
      if (Array.isArray(current)) {
        let acc = hashString32('array:start');
        for (const item of current) {
          acc = mixHash32(acc, hashValue(item));
        }
        return mixHash32(acc, current.length >>> 0);
      }

      const proto = Object.getPrototypeOf(currentObject) as object | null;
      const isPlainObject = proto === Object.prototype || proto === null;

      if (!isPlainObject) {
        return hashString32(`object:${Object.prototype.toString.call(currentObject)}`);
      }

      const objectValue = current as Record<string, unknown>;
      let xorAcc = hashString32('object:xor');
      let sumAcc = hashString32('object:sum');
      let count = 0;

      for (const key of Object.keys(objectValue)) {
        const pairHash = mixHash32(hashString32(`key:${key}`), hashValue(objectValue[key]));

        xorAcc = (xorAcc ^ pairHash) >>> 0;
        sumAcc = (sumAcc + pairHash) >>> 0;
        count++;
      }

      return mixHash32(mixHash32(xorAcc, sumAcc), count >>> 0);
    } finally {
      activeNodes.delete(currentObject);
    }
  };

  return (hashValue(value) >>> 0).toString(16).padStart(8, '0');
};

/**
 * @name sortObjectKeysDeep
 * @description Sorts object keys alphabetically in-place, recursively across nested plain objects and array items.
 * @param value - Value to recursively normalize
 * @returns Same reference with all nested plain-object keys sorted alphabetically
 */
export const sortObjectKeysDeep = <T,>(value: T): T => {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      sortObjectKeysDeep(item);
    }
    return value;
  }

  const proto = Object.getPrototypeOf(value as object) as object | null;
  const isPlainObject = proto === Object.prototype || proto === null;
  if (!isPlainObject) {
    return value;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue);

  for (const key of keys) {
    objectValue[key] = sortObjectKeysDeep(objectValue[key]);
  }

  let isSorted = true;
  for (let i = 1; i < keys.length; i++) {
    if (keys[i - 1] > keys[i]) {
      isSorted = false;
      break;
    }
  }

  if (isSorted) {
    return value;
  }

  const sortedKeys = [...keys].sort((left, right) => {
    if (left > right) return 1;
    if (left < right) return -1;
    return 0;
  });
  const snapshot: Record<string, unknown> = {};

  for (const key of keys) {
    snapshot[key] = objectValue[key];
    delete objectValue[key];
  }

  for (const key of sortedKeys) {
    objectValue[key] = snapshot[key];
  }

  return value;
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
export const toElement = (value: ReactNode | MemoExoticComponent<ComponentType<unknown>>) => {
  if (React.isValidElement(value)) {
    return value;
  }

  const Component = value as ComponentType<unknown>;
  return <Component />;
};
