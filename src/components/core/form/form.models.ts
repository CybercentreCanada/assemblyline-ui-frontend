export type Length<T> = T extends { length: infer L } ? L : never;
type Join<T extends unknown[], D extends string> = T extends string[]
  ? PopFront<T> extends string
    ? Length<T> extends 1
      ? `${PopFront<T>}`
      : `${PopFront<T>}${D}${Join<Shift<T>, D>}`
    : never
  : never;
type Pop<T extends unknown[]> = T extends [...infer R, infer U] ? U : never;
type PopFront<T extends unknown[]> = T extends [infer U, ...infer R] ? U : never;
type Shift<T extends unknown[]> = T extends [infer U, ...infer R] ? R : never;

type Filter<T extends unknown[], U> = T extends []
  ? []
  : T extends [infer F, ...infer R]
  ? F extends U
    ? Filter<R, T>
    : [F, ...Filter<R, U>]
  : never;
type TupleIncludes<T extends unknown[], U> = Length<Filter<T, U>> extends Length<T> ? false : true;
type StringIncludes<S extends string, D extends string> = S extends `${infer T}${D}${infer U}` ? true : false;
type Includes<T extends unknown[] | string, U> = T extends unknown[]
  ? TupleIncludes<T, U>
  : T extends string
  ? U extends string
    ? StringIncludes<T, U>
    : never
  : never;

export type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S];

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

export type ValidPathTuples<T> = keyof T extends never
  ? never
  : {
      [K in keyof T]: T[K] extends never
        ? never
        : T[K] extends Record<string | number | symbol, unknown>
        ? [K, ...ValidPathTuples<T[K]>] | [K]
        : [K];
    }[keyof T];

// string version
export type NestedType<T, P extends string> = Includes<P, '.'> extends true
  ? PopFront<Split<P, '.'>> extends keyof T
    ? NestedType<T[PopFront<Split<P, '.'>>], Join<Shift<Split<P, '.'>>, '.'>>
    : never
  : P extends keyof T
  ? T[P]
  : never;

// tuple version
export type NestedTypeByTuple<T, P extends string[]> = Length<P> extends 1
  ? Pop<P> extends keyof T
    ? T[Pop<P>]
    : never
  : PopFront<P> extends keyof T
  ? Shift<P> extends string[]
    ? NestedTypeByTuple<T[PopFront<P>], Shift<P>>
    : never
  : never;

// String version internally using tuples
// Bonus: Also errors now
export type NestedTypeUsingTuplesAgain<T, P extends ValidPaths<T>> = NestedTypeByTuple<T, Split<P, '.'>>;

export type NestedTypeUsingTuplesAgain2<T, P extends ValidPathTuples<T>> = NestedType<T, Join<P, '.'>>;

export type NestedKeyOf<T extends object> = ValidPathTuples<T>;

export type NestedKeyOf2<T extends object, P extends unknown[] = []> = {
  [K in keyof T]: T[K] extends object ? [...P, K] | NestedKeyOf2<T[K], [...P, K]> : [...P, K];
}[keyof T];

export type ExtractNestedValue<P extends unknown[] = []> = P extends [infer First, ...infer _Rest] ? [First] : never;

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
