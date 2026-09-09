import type { NestedTypeUsingTuplesAgain2, ValidPathTuples } from 'features/form';

/** Represents a recursively addressable form value with a path resolver. */
export type FieldPath<Data> = Data extends unknown[]
  ? { [K in keyof Data]: FieldPath<Data[K]> }
  : Data extends object
    ? { [K in keyof Data]: FieldPath<Data[K]> } & { toPath: () => string }
    : { toPath: () => string };

/**
 * @name isObject
 * @description Determines whether a value is a non-array object.
 * @param data - Value to inspect.
 * @param empty - Whether empty objects should be treated as objects.
 * @returns True when the value is a matching object.
 */
export const isObject = function <Data extends Record<string, unknown>>(
  data: unknown,
  empty: boolean = true
): data is Data {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
  return empty || Object.keys(data).length > 0;
};

/**
 * @name buildPath
 * @description Builds a recursively typed path object for a form value.
 * @param data - Form value to represent.
 * @param path - Current path prefix.
 * @returns A typed path object for the provided value.
 */
export const buildPath = function <const Data>(data: Data, path: string = '$'): FieldPath<Data> {
  if (isObject(data)) {
    return {
      ...Object.fromEntries(Object.keys(data).map(key => [key, buildPath(data[key], `${path}.${key}`)])),
      toPath: () => path
    } as unknown as FieldPath<Data>;
  } else if (Array.isArray(data)) {
    return data.map((value, index) => buildPath(value, `${path}.${index}`)) as unknown as FieldPath<Data>;
  }
  return { toPath: () => path } as FieldPath<Data>;
};

/**
 * @name getValueFromPath
 * @description Reads a nested value from a dot-separated path.
 * @param data - Object to read.
 * @param path - Dot-separated path, optionally prefixed with `$`.
 * @returns The nested value, undefined when a segment is missing, or null for nullish input.
 */
export const getValueFromPath = function <Data extends object>(data: Data, path: string): unknown {
  if (data === undefined || data === null) return null;
  let current: unknown = data;

  let paths: string[] = path.split('.');
  if (paths[0] === '$') paths = paths.slice(1);

  for (const key of paths) {
    if (typeof current !== 'object' || current === null || !(key in current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

/**
 * @name setValue
 * @description Creates an object with a nested value replaced at the provided path.
 * @param obj - Object to update.
 * @param path - Tuple path to update.
 * @param value - Replacement value.
 * @returns The updated object or value at the path terminus.
 */
export const setValue = function <T extends object, P extends string[], V>(obj: T, path: P, value: V): T | V {
  if (!path?.length) return value;
  return {
    ...obj,
    [path[0]]: setValue((obj as Record<string, unknown>)[path[0]] as object, path.slice(1), value)
  } as T;
};

/**
 * @name setValueFromPath
 * @description Creates an object with a type-safe nested value replaced at the provided path.
 * @param store - Object to update.
 * @param path - Valid tuple path to update.
 * @param value - Replacement value compatible with the path.
 * @returns The updated object.
 */
export const setValueFromPath = function <
  T extends object,
  P extends ValidPathTuples<T>,
  V extends NestedTypeUsingTuplesAgain2<T, P>
>(store: T, path: P, value: V): T {
  return setValue(store, path as string[], value) as T;
};
