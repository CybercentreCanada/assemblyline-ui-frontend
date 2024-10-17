/**
 * Test Data
 */

const dictionary = {
  someProp: 123,
  nested: {
    moreProps: 333,
    deeper: {
      evenDeeper: {
        deepest: 'string'
      }
    },
    alsoDeeper: {
      randomProp: {
        anotherProp: 'wtf'
      }
    }
  }
} as const;

type MyDict = typeof dictionary;

/**
 * Old Version
 */

// type Length<T> = T extends { length: infer L } ? L : never;

// type PopFront<T extends unknown[]> = T extends [infer U, ...infer R] ? U : never;

// type Shift<T extends unknown[]> = T extends [infer U, ...infer R] ? R : never;

// type Filter<T extends unknown[], U> = T extends []
//   ? []
//   : T extends [infer F, ...infer R]
//   ? F extends U
//     ? Filter<R, T>
//     : [F, ...Filter<R, U>]
//   : never;

// type TupleIncludes<T extends unknown[], U> = Length<Filter<T, U>> extends Length<T> ? false : true;

// type StringIncludes<S extends string, D extends string> = S extends `${infer T}${D}${infer U}` ? true : false;

// type Includes<T extends unknown[] | string, U> = T extends unknown[]
//   ? TupleIncludes<T, U>
//   : T extends string
//   ? U extends string
//     ? StringIncludes<T, U>
//     : never
//   : never;

// type Join<T extends unknown[], D extends string> = T extends string[]
//   ? PopFront<T> extends string
//     ? Length<T> extends 1
//       ? `${PopFront<T>}`
//       : `${PopFront<T>}${D}${Join<Shift<T>, D>}`
//     : never
//   : never;

// type Split<S extends string, D extends string> = string extends S
//   ? string[]
//   : S extends ''
//   ? []
//   : S extends `${infer T}${D}${infer U}`
//   ? [T, ...Split<U, D>]
//   : [S];

// type ValidPaths<T> = keyof T extends never
//   ? never
//   : {
//       [K in keyof T]: T[K] extends never
//         ? never
//         : T[K] extends Record<string | number | symbol, unknown>
//         ? K extends string
//           ? `${K}.${ValidPaths<T[K]>}` | K
//           : never
//         : K;
//     }[keyof T];

// export type ValidPathTuples<T> = keyof T extends never
//   ? never
//   : {
//       [K in keyof T]: T[K] extends never
//         ? never
//         : T[K] extends Record<string | number | symbol, unknown>
//         ? [K, ...ValidPathTuples<T[K]>] | [K]
//         : [K];
//     }[keyof T];

// export type NestedType<T, P extends string> = Includes<P, '.'> extends true
//   ? PopFront<Split<P, '.'>> extends keyof T
//     ? NestedType<T[PopFront<Split<P, '.'>>], Join<Shift<Split<P, '.'>>, '.'>>
//     : never
//   : P extends keyof T
//   ? T[P]
//   : never;

/**
 * New Version
 */

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

// type DemoNested1 = NestedType<MyDict, 'nested.moreProps'>; // 333
// type DemoNested2 = NestedType<MyDict, 'nested.deeper.evenDeeper'>; // { readonly deepest: "string" }
// type DemoNestedNever = NestedType<MyDict, 'nested.randomProp'>; // never

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

// type DemoNestedTuple1 = NestedTypeByTuple<MyDict, ['nested', 'moreProps']>; // 333
// type DemoNestedTuple2 = NestedTypeByTuple<MyDict, ['nested', 'deeper', 'evenDeeper']>; // { readonly deepest: "string" }
// type DemoNestedTupleNever = NestedTypeByTuple<MyDict, ['nested', 'sillyProp']>; // never

// String version internally using tuples
// Bonus: Also errors now
export type NestedTypeUsingTuplesAgain<T, P extends ValidPaths<T>> = NestedTypeByTuple<T, Split<P, '.'>>;

export type NestedTypeUsingTuplesAgain2<T, P extends ValidPathTuples<T>> = NestedType<T, Join<P, '.'>>;

// type Convoluted = NestedTypeUsingTuplesAgain<MyDict, 'nested.alsoDeeper'>;
// type ConvolutedError = NestedTypeUsingTuplesAgain<MyDict, 'nested.nonExistant'>;

// And now we can finally give lodash's `get` function a run for it's money
// function GetByPath<T, P extends ValidPaths<T>>(dict: T, path: P): NestedType<T, P> {
//   // internal impl. must be different. only dominhg types here!
//   return (dict as any)[path];
// }

// const demo1Value = GetByPath(dictionary, 'nested.moreProps');
// type Demo1Type = typeof demo1Value; // 333

// const demo2Value = GetByPath(dictionary, 'nested.alsoDeeper.randomProp.anotherProp');
// type Demo2Type = typeof demo2Value; // wtf

// const demo2Error = GetByPath(dictionary, 'just.some.silly.stuff');

/**
 * My Stuff
 */

// return type deduction from path

// export type NestedKeyOf<T extends object> = {
//   [K in keyof T & (string | number)]: T[K] extends object ? `[${K}]` | `${K}.${NestedKeyOf<T[K]>}` : `$${K}`;
// }[keyof T & (string | number)];

export type NestedKeyOf<T extends object> = ValidPathTuples<T>;

export type NestedKeyOf2<T extends object, P extends unknown[] = []> = {
  [K in keyof T]: T[K] extends object ? [...P, K] | NestedKeyOf2<T[K], [...P, K]> : [...P, K];
}[keyof T];

export type ExtractNestedValue<P extends unknown[] = []> = P extends [infer First, ...infer _Rest] ? [First] : never;

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export const getValueFromPath = <T extends object, P extends ValidPathTuples<T>>(
  store: T,
  path: P
): NestedTypeUsingTuplesAgain2<T, P> => {
  if (path === undefined || path === null) {
    return undefined;
  }
  const paths = path;
  let current = store as any;
  let i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    }
    current = current[paths[i]];
  }
  return current as undefined;
};

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

// Demo

type Test1 = NestedType<MyDict, 'nested.alsoDeeper.randomProp.anotherProp'>; // = yay

const Fn = <T, P extends string>(dict: T, path: P): NestedType<T, P> => {
  // skip impl.
  return undefined as any;
};

const testFromFn = Fn(dictionary, 'nested.moreProps'); // = 333
