import { Store } from '..';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line  no-unused-vars
/* eslint-disable  @typescript-eslint/no-unused-vars */

// 1. UTILITY TYPES

// All non-object entities
type NonObject = null | Array<any> | Date | Map<any, any>;

// Check if O is an object
type IsObject<O> = O extends NonObject ? never : O extends object ? (keyof O extends never ? never : O) : never;

// Get the property's Value from an object
type Value<O, P> = IsObject<O> extends never ? never : P extends keyof O ? O[P] : never;

// Get the keys from an object
type Keys<O> = IsObject<O> extends never ? never : keyof O;

// Get the values from an object
type Values<O> = IsObject<O> extends never ? never : O[keyof O];

// Get all union members: "a" | "b" | "c" - "a" | "f" = "a"
type MyExtract<T, U> = T extends U ? T : never;

// Get all members that are excluded from the union: "a" | "b" | "c" - "a" | "b" = "c"
type MyExclude<T, U> = T extends U ? never : T;

// Create Object with the chosen specific keys selected
type MyPick<O, K> = IsObject<O> extends never ? never : { [P in keyof O as P extends K ? P : never]: O[P] };

// Create Object with the chosen specific keys omitted
export type MyOmit<O, K> = IsObject<O> extends never
  ? never
  : { [P in Exclude<keyof O, K extends keyof O ? K : never>]: O[P] };

// Create an object with the keys of specified types selected
type Pull<O, T> = IsObject<O> extends never ? never : { [P in keyof O as O[P] extends T ? P : never]: O[P] };

// Create an object with the keys of specified types dropped
type Drop<O, T> = IsObject<O> extends never ? never : { [P in keyof O as O[P] extends T ? never : P]: O[P] };

type HasChildObject<O> = keyof {
  [P in keyof O as IsObject<O[P]> extends never ? never : P]: P;
} extends never
  ? never
  : O;

// Create an object with the keys of specified types selected recursively
type PullR<O, T> = IsObject<O> extends never
  ? never
  : {
      [P in keyof O as O[P] extends T ? P : IsObject<PullR<O[P], T>> extends never ? never : P]: IsObject<
        O[P]
      > extends never
        ? O[P]
        : PullR<O[P], T>;
    };

// Apply partial to every key element recursively
// type PartialR<T> = { [P in keyof T]?: T[P]; }
export type PartialR<T> = {
  [P in keyof T]?: IsObject<T> extends never ? T[P] : PartialR<T[P]>;
};

// Create an object with the keys of specified types dropped recursively
type DropR<O, T> = IsObject<O> extends never
  ? never
  : {
      [P in keyof O as O[P] extends IsObject<DropR<O[P], T>> ? P : O[P] extends T ? never : P]: IsObject<
        O[P]
      > extends never
        ? O[P]
        : DropR<O[P], T>;
    };

export type KeyType<O extends object, T> = keyof {
  [P in keyof O as O[P] extends T
    ? P
    : O[P] extends null | Array<any> | Map<any, any>
    ? never
    : O[P] extends object
    ? KeyType<O[P], T> extends never
      ? never
      : P
    : never];
};

export type PickType<O extends object, T> = {
  [P in keyof O as O[P] extends null | Array<any> | Map<any, any>
    ? never
    : O[P] extends T
    ? P
    : O[P] extends object
    ? PickType<O[P], T> extends never
      ? never
      : P
    : never]: Value<O, P>;
};
export type OmitType<O extends object, T> = {
  [P in keyof O as O[P] extends null | Array<any> | Map<any, any>
    ? never
    : O[P] extends T
    ? never
    : O[P] extends object
    ? OmitType<O[P], T> extends never
      ? P
      : never
    : never]: Value<O, P>;
};

// 2. TYPE CONFIG
type TypeConfig<T extends string | number | symbol> = { [A in T as A]: A };

type TypeReturnConfig<T extends any> = { [A in keyof T as A]: A }[keyof { [A in keyof T as A] }];

export type ItemConfig<T extends string | number | symbol> = {
  value: number;
  type: T;
  label: { en: string; fr: string };
  description?: { en: string; fr: string };
};

type ItemArrayConfig<T extends string | number | symbol> = Array<
  {
    [P in T]: {
      value: number;
      type: T;
      label: { en: string; fr: string };
      description?: { en: string; fr: string };
    };
  }[keyof {
    [P in T];
  }]
>;

export type TypesConfig<O, T extends string | number | symbol> = IsObject<O> extends never
  ? never
  : {
      [K in keyof PullR<O, T>]: Value<O, K> extends T
        ? ItemArrayConfig<Value<O, K>>
        : IsObject<Value<O, K>> extends never
        ? never
        : TypesConfig<Value<O, K>, T>;
    };

export type IsTypeConfig<O, T extends string | number | symbol> = IsObject<O> extends never
  ? never
  : {
      [K in keyof PullR<O, T>]: Value<O, K> extends T
        ? (property?: Value<O, K> | object | number, match?: Value<O, K>) => boolean
        : IsObject<Value<O, K>> extends never
        ? never
        : IsTypeConfig<Value<O, K>, T>;
    };

export type ItemsConfig<O, T extends string | number | symbol> = IsObject<O> extends never
  ? never
  : {
      [K in keyof PullR<O, T>]: Value<O, K> extends T
        ? (store: Store) => Array<{ value: number; label: string }>
        : IsObject<Value<O, K>> extends never
        ? never
        : ItemsConfig<Value<O, K>, T>;
    };

export type GetValueConfig<O, T extends string | number | symbol> = IsObject<O> extends never
  ? never
  : {
      [K in keyof PullR<O, T>]: Value<O, K> extends T
        ? (store: Value<O, K> | Store | number) => number
        : IsObject<Value<O, K>> extends never
        ? never
        : GetValueConfig<Value<O, K>, T>;
    };

export type GetTypeConfig<O, T extends string | number | symbol> = IsObject<O> extends never
  ? never
  : {
      [K in keyof PullR<O, T>]: Value<O, K> extends T
        ? (value: number | Store) => Value<O, K>
        : IsObject<Value<O, K>> extends never
        ? never
        : GetTypeConfig<Value<O, K>, T>;
    };

export type FindTypeConfig<O, T extends string | number | symbol> = IsObject<O> extends never
  ? never
  : {
      [K in keyof PullR<O, T>]: Value<O, K> extends T
        ? (first: Value<O, K> | Store | number, second: Value<O, K> | Store | number) => Value<O, K>
        : IsObject<Value<O, K>> extends never
        ? never
        : FindTypeConfig<Value<O, K>, T>;
    };

// 3. STORE CONFIG
export type SetStoreConfig<O> = {
  [K in keyof O as K extends string ? `${Capitalize<K>}` : K]: (
    first: Store,
    second: PartialR<Value<O, K>>,
    clean?: (data: PartialR<Value<O, K>>) => PartialR<Value<O, K>>
  ) => Store;
} & {
  [K in keyof O as IsObject<O[K]> extends never ? never : K]: SetStoreConfig<O[K]>;
};

export type SetStoreWithKeysConfig<O> = {
  [K in keyof O as K extends string ? `${Capitalize<K>}` : K]: (
    first: Store,
    second: PartialR<Value<O, K>>,
    keys: (keyof PartialR<Value<O, K>>)[]
  ) => Store;
} & {
  [K in keyof O as IsObject<O[K]> extends never ? never : K]: SetStoreWithKeysConfig<O[K]>;
};

export type SetStoreWithoutKeysConfig<O> = {
  [K in keyof O as K extends string ? `${Capitalize<K>}` : K]: (
    first: Store,
    second: PartialR<Value<O, K>>,
    keys: (keyof PartialR<Value<O, K>>)[]
  ) => Store;
} & {
  [K in keyof O as IsObject<O[K]> extends never ? never : K]: SetStoreWithoutKeysConfig<O[K]>;
};

export type RemoveStoreKeysConfig<O> = {
  [K in keyof O as IsObject<Value<O, K>> extends never ? never : K extends string ? `${Capitalize<K>}` : K]: (
    first: Store,
    keys: (keyof PartialR<Value<O, K>>)[]
  ) => Store;
} & {
  [K in keyof O as IsObject<O[K]> extends never
    ? never
    : HasChildObject<O[K]> extends never
    ? never
    : K]: RemoveStoreKeysConfig<O[K]>;
};

export type SetStoreWithPathConfig<O> = {
  [K in keyof O as K extends string ? `${Capitalize<K>}` : K]: (
    store: Store,
    data: any,
    valuePath?: Array<string>
  ) => Store;
} & {
  [K in keyof O as IsObject<O[K]> extends never ? never : K]: SetStoreConfig<O[K]>;
};
