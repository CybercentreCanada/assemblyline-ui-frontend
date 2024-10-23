import type { NestedTypeUsingTuplesAgain2, ValidPathTuples } from './models';

export type FieldPath<Data> = Data extends any[]
  ? { [K in keyof Data]: FieldPath<Data[K]> }
  : Data extends object
  ? { [K in keyof Data]: FieldPath<Data[K]> } & { toPath: () => string }
  : { toPath: () => string };

export function isObject(data: unknown, empty: boolean = true): data is object {
  if (typeof data !== 'object') return false;
  else if ([null, undefined].includes(data)) return false;
  else if (Object.is({}, data)) return empty;
  else if (Array.isArray(data)) return false;
  else if (Object.keys(data).length === 0) return empty;
  else return true;
}

export function buildPath<Data>(data: Data, path: string = '$'): FieldPath<Data> {
  if (isObject(data)) {
    return {
      ...Object.fromEntries(Object.keys(data).map(k => [k, buildPath(data[k], `${path}.${k}`)])),
      toPath: () => path
    } as any;
  } else if (Array.isArray(data)) {
    return data.map((v, i) => buildPath(v, `${path}.${i}`)) as any;
  } else return { toPath: () => path } as any;
}

export function getValueFromPath<Data extends object>(data: Data, path: string): unknown {
  let current = data;
  if (data === undefined || data === null) return null;

  let paths = path.split('.');
  if (paths[0] === '$') paths = paths.slice(1);

  for (let i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) return undefined;
    current = current[paths[i]];
  }
  return current;
}

export const setValue = <T extends object, P extends string[], V>(obj: T, path: P, value: V) => {
  if (!path?.length) return value;
  else return { ...obj, [path[0]]: setValue(obj[path[0]], path.slice(1), value) };
};

export const setValueFromPath = <
  T extends object,
  P extends ValidPathTuples<T>,
  V extends NestedTypeUsingTuplesAgain2<T, P>
>(
  store: T,
  path: P,
  value: V
): T => setValue(store, path as string[], value) as T;
