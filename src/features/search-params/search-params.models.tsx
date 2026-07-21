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

export type ObjectParamShape = ObjectParamPrimitive | { [key: string]: ObjectParamPrimitive } | ObjectParamPrimitive[];

export type ObjectParamValue = Record<string, ObjectParamShape>;

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
