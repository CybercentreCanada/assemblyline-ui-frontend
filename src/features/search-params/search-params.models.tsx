/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BooleanSearchParamBlueprint,
  EnumSearchParamBlueprint,
  FiltersSearchParamBlueprint,
  NumberSearchParamBlueprint,
  ObjectSearchParamBlueprint,
  SEARCH_PARAM_RUNTIME_MAP,
  SearchParamEngine,
  SearchParamRuntimeFactory,
  SearchParamSnapshot,
  StringSearchParamBlueprint
} from 'features/search-params';

export type SearchParamSource = 'search' | 'state' | 'transient';

export type EnumParamValue = string | number | boolean;

export type ObjectParamPrimitive = string | number | boolean | null;

export type ObjectParamShape = ObjectParamPrimitive | ObjectParamShape[] | { [key: string]: ObjectParamShape };

export type ObjectParamValue = Record<string, ObjectParamShape> | ObjectParamShape[];

//*****************************************************************************************
// Search Param Blueprint Introspection
//*****************************************************************************************

/** Identifies which blueprint variant produced a search parameter. */
export type SearchParamBlueprintKind = 'boolean' | 'number' | 'string' | 'enum' | 'filters' | 'object';

/** Shared fields in a plain-object description of a search param blueprint. */
export type BaseSearchParamBlueprintDescriptor<
  Kind extends SearchParamBlueprintKind,
  DefaultValue extends SearchParamValue
> = {
  /** Configured default value, in the blueprint's own runtime type. */
  defaultValue: DefaultValue | null | undefined;
  /** Whether this param is excluded from persistence mechanisms (e.g. localStorage). */
  ephemeral: boolean;
  /** Whether changes to this param are ignored when detecting snapshot differences. */
  ignored: boolean;
  /** Param key configured on the search param engine. */
  key: string;
  /** Blueprint variant that produced this param. */
  kind: Kind;
  /** Whether this param always resolves to its default value, ignoring external input. */
  locked: boolean;
  /** Whether `null` is considered a valid value for this param. */
  nullable: boolean;
  /** Where this param resolves its value from. */
  source: SearchParamSource;
};

/** Description of a boolean search param blueprint. */
export type BooleanSearchParamBlueprintDescriptor = BaseSearchParamBlueprintDescriptor<'boolean', boolean>;

/** Description of a number search param blueprint. */
export type NumberSearchParamBlueprintDescriptor = BaseSearchParamBlueprintDescriptor<'number', number> & {
  /** Configured maximum value, or `null` when no maximum is set. */
  max: number | null;
  /** Configured minimum value, or `null` when no minimum is set. */
  min: number | null;
};

/** Description of a string search param blueprint. */
export type StringSearchParamBlueprintDescriptor = BaseSearchParamBlueprintDescriptor<'string', string>;

/** Description of an enum search param blueprint. */
export type EnumSearchParamBlueprintDescriptor = BaseSearchParamBlueprintDescriptor<'enum', EnumParamValue> & {
  /** Allowed enum values, or `undefined` when options have not been configured. */
  options: readonly EnumParamValue[] | undefined;
};

/** Description of a filters search param blueprint. */
export type FiltersSearchParamBlueprintDescriptor = BaseSearchParamBlueprintDescriptor<'filters', string[]> & {
  /** Prefix token used to negate a filter value. */
  not: string;
  /** Prefix token used to omit a filter value. */
  omit: string;
};

/** Description of an object search param blueprint. */
export type ObjectSearchParamBlueprintDescriptor = BaseSearchParamBlueprintDescriptor<'object', ObjectParamValue>;

/** Plain-object description of a search param blueprint's configuration, narrowed by its `kind`. */
export type SearchParamBlueprintDescriptor =
  | BooleanSearchParamBlueprintDescriptor
  | NumberSearchParamBlueprintDescriptor
  | StringSearchParamBlueprintDescriptor
  | EnumSearchParamBlueprintDescriptor
  | FiltersSearchParamBlueprintDescriptor
  | ObjectSearchParamBlueprintDescriptor;

//*****************************************************************************************
// Search Param Blueprints
//*****************************************************************************************

// prettier-ignore
type SearchParamBlueprint =
  | BooleanSearchParamBlueprint
  | NumberSearchParamBlueprint
  | StringSearchParamBlueprint
  | FiltersSearchParamBlueprint
  | ObjectSearchParamBlueprint<any>
  | EnumSearchParamBlueprint<readonly [EnumParamValue, ...EnumParamValue[]]>;

export type SearchParamBlueprintMap = Record<string, SearchParamBlueprint>;

//*****************************************************************************************
// Search Param Values
//*****************************************************************************************

export type SearchParamValue = null | boolean | number | string | string[] | ObjectParamValue;

export type SearchParamValueMap = Record<string, SearchParamValue>;

// prettier-ignore
export type InferSearchParamValueFromBlueprint<B extends SearchParamBlueprint> =
  B extends infer Blueprint
    ? Blueprint extends SearchParamBlueprint
      ?
        Blueprint extends BooleanSearchParamBlueprint ? boolean :
        Blueprint extends NumberSearchParamBlueprint ? number :
        Blueprint extends StringSearchParamBlueprint ? string :
        Blueprint extends FiltersSearchParamBlueprint ? string[] :
        Blueprint extends ObjectSearchParamBlueprint<infer O> ? O :
        Blueprint extends EnumSearchParamBlueprint<infer T> ? T[number] :
        never
      : never
    : never;

export type InferSearchParamValueMapFromBlueprintMap<BlueprintMap extends SearchParamBlueprintMap> = {
  [K in keyof BlueprintMap]: InferSearchParamValueFromBlueprint<BlueprintMap[K]>;
};

// Arrays are replaced whole by a delta; only nested records can be partial.
type SearchParamDeltaObject<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: SearchParamDeltaObject<T[K]> }
    : T;

// prettier-ignore
/** Value of one param inside a delta; object params may hold only the keys that differ from the default. */
export type InferSearchParamDeltaValueFromBlueprint<B extends SearchParamBlueprint> =
  B extends ObjectSearchParamBlueprint<infer O> ? SearchParamDeltaObject<O> : InferSearchParamValueFromBlueprint<B>;

/** Sparse value map: params equal to their default are omitted. */
export type InferSearchParamDeltaValueMapFromBlueprintMap<BlueprintMap extends SearchParamBlueprintMap> = {
  [K in keyof BlueprintMap]?: InferSearchParamDeltaValueFromBlueprint<BlueprintMap[K]>;
};

//*****************************************************************************************
// Search Param Runtimes
//*****************************************************************************************

// prettier-ignore
export type InferSearchParamRuntimeFromBlueprint<B extends SearchParamBlueprint> =
  B extends infer Blueprint
    ? Blueprint extends SearchParamBlueprint
      ?
        Blueprint extends BooleanSearchParamBlueprint ? (typeof SEARCH_PARAM_RUNTIME_MAP)['boolean']["prototype"] & BooleanSearchParamBlueprint :
        Blueprint extends NumberSearchParamBlueprint ? (typeof SEARCH_PARAM_RUNTIME_MAP)['number']["prototype"] & NumberSearchParamBlueprint :
        Blueprint extends StringSearchParamBlueprint ? (typeof SEARCH_PARAM_RUNTIME_MAP)['string']["prototype"] & StringSearchParamBlueprint :
        Blueprint extends FiltersSearchParamBlueprint ? (typeof SEARCH_PARAM_RUNTIME_MAP)['filters']["prototype"] & FiltersSearchParamBlueprint :
        Blueprint extends ObjectSearchParamBlueprint<any> ? (typeof SEARCH_PARAM_RUNTIME_MAP)['object']["prototype"] & ObjectSearchParamBlueprint :
        Blueprint extends EnumSearchParamBlueprint<any> ? (typeof SEARCH_PARAM_RUNTIME_MAP)['enum']["prototype"] & EnumSearchParamBlueprint<any> :
        never
      : never
    : never;

export type InferSearchParamRuntimeMapFromBlueprintMap<BlueprintMap extends SearchParamBlueprintMap> = {
  [K in keyof BlueprintMap]: InferSearchParamRuntimeFromBlueprint<BlueprintMap[K]>;
};

//*****************************************************************************************
// Search Param Engine
//*****************************************************************************************

export type InferSearchParamKeysFromEngine<Engine extends SearchParamEngine<SearchParamBlueprintMap>> =
  Engine extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends BlueprintMap
      ? never
      : keyof BlueprintMap
    : never;

export type InferSearchParamValueMapFromEngine<Engine extends SearchParamEngine<SearchParamBlueprintMap>> =
  Engine extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends BlueprintMap
      ? never
      : Partial<InferSearchParamValueMapFromBlueprintMap<BlueprintMap>>
    : never;

export type InferSearchParamSnapshotFromEngine<Engine extends SearchParamEngine<SearchParamBlueprintMap>> =
  Engine extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends BlueprintMap
      ? never
      : SearchParamSnapshot<BlueprintMap>
    : never;

//*****************************************************************************************
// Search Param Snapshots
//*****************************************************************************************

export type SearchParamRuntime = InstanceType<ReturnType<typeof SearchParamRuntimeFactory>>;

export type InferSearchParamKeysFromSnapshot<Snapshot extends SearchParamSnapshot<any>> =
  Snapshot extends SearchParamSnapshot<infer BlueprintMap>
    ? BlueprintMap extends SearchParamBlueprintMap
      ? SearchParamBlueprintMap extends BlueprintMap
        ? never
        : keyof BlueprintMap
      : never
    : never;
