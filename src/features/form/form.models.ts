/** Returns the length property of a type. */
export type Length<T> = T extends { length: infer L } ? L : never;

type Join<T extends unknown[], D extends string> = T extends string[]
  ? PopFront<T> extends string
    ? Length<T> extends 1
      ? `${PopFront<T>}`
      : `${PopFront<T>}${D}${Join<Shift<T>, D>}`
    : never
  : never;
type Pop<T extends unknown[]> = T extends [...unknown[], infer U] ? U : never;
type PopFront<T extends unknown[]> = T extends [infer U, ...unknown[]] ? U : never;
type Shift<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

/** Filters a tuple by value type. */
type Filter<T extends unknown[], U> = T extends []
  ? []
  : T extends [infer F, ...infer R]
    ? F extends U
      ? Filter<R, U>
      : [F, ...Filter<R, U>]
    : never;

type TupleIncludes<T extends unknown[], U> = Length<Filter<T, U>> extends Length<T> ? false : true;
type StringIncludes<S extends string, D extends string> = S extends `${string}${D}${string}` ? true : false;
type Includes<T extends unknown[] | string, U> = T extends unknown[]
  ? TupleIncludes<T, U>
  : T extends string
    ? U extends string
      ? StringIncludes<T, U>
      : never
    : never;

/** Splits a string literal into a tuple using a delimiter. */
export type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
    ? []
    : S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S];

/** Returns valid dot-separated paths for an object type. */
export type ValidPaths<T> = keyof T extends never
  ? never
  : {
      [K in keyof T]: T[K] extends never
        ? never
        : T[K] extends Record<string | number | symbol, unknown>
          ? K extends string
            ? `${K}.${ValidPaths<T[K]>}` | K
            : never
          : K;
    }[keyof T] &
      string;

/** Returns valid tuple paths for an object type. */
export type ValidPathTuples<T> = keyof T extends never
  ? never
  : {
      [K in keyof T]: T[K] extends never
        ? never
        : T[K] extends Record<string | number | symbol, unknown>
          ? [K, ...ValidPathTuples<T[K]>] | [K]
          : [K];
    }[keyof T];

/** Resolves a nested value from a dot-separated path. */
export type NestedType<T, P extends string> =
  Includes<P, '.'> extends true
    ? PopFront<Split<P, '.'>> extends keyof T
      ? NestedType<T[PopFront<Split<P, '.'>>], Join<Shift<Split<P, '.'>>, '.'>>
      : never
    : P extends keyof T
      ? T[P]
      : never;

/** Resolves a nested value from a tuple path. */
export type NestedTypeByTuple<T, P extends string[]> =
  Length<P> extends 1
    ? Pop<P> extends keyof T
      ? T[Pop<P>]
      : never
    : PopFront<P> extends keyof T
      ? Shift<P> extends string[]
        ? NestedTypeByTuple<T[PopFront<P>], Shift<P>>
        : never
      : never;

/** Resolves a nested value from a validated dot-separated path. */
export type NestedTypeUsingTuplesAgain<T, P extends ValidPaths<T>> = NestedTypeByTuple<T, Split<P, '.'>>;

/** Resolves a nested value from a validated tuple path. */
export type NestedTypeUsingTuplesAgain2<T, P extends ValidPathTuples<T>> = NestedType<T, Join<P, '.'>>;

/** Returns nested object keys as tuples. */
export type NestedKeyOf<T extends object> = ValidPathTuples<T>;

/** Returns nested object keys as tuples with an optional prefix. */
export type NestedKeyOf2<T extends object, P extends unknown[] = []> = {
  [K in keyof T]: T[K] extends object ? [...P, K] | NestedKeyOf2<T[K], [...P, K]> : [...P, K];
}[keyof T];

/** Extracts the first value from a tuple path. */
export type ExtractNestedValue<P extends unknown[] = []> = P extends [infer First, ...unknown[]] ? [First] : never;

/** Makes all properties of an object recursively optional. */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
