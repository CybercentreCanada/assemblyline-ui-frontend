/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BooleanSearchParamBlueprint,
  EnumSearchParamBlueprint,
  FiltersSearchParamBlueprint,
  NumberSearchParamBlueprint,
  StringSearchParamBlueprint
} from 'features/search-params/search-params.blueprints';
import type { SearchParamEngine } from 'features/search-params/search-params.engines';
import type {
  SEARCH_PARAM_RUNTIME_MAP,
  SearchParamRuntimeFactory
} from 'features/search-params/search-params.runtimes';
import type { SearchParamSnapshot } from 'features/search-params/search-params.snapshots';

export type SearchParamSource = 'search' | 'state' | 'snapshot';

//*****************************************************************************************
// Search Param Blueprints
//*****************************************************************************************

// prettier-ignore
type SearchParamBlueprint =
  | BooleanSearchParamBlueprint
  | NumberSearchParamBlueprint
  | StringSearchParamBlueprint
  | FiltersSearchParamBlueprint
  | EnumSearchParamBlueprint<readonly string[]>;

export type SearchParamBlueprintMap = Record<string, SearchParamBlueprint>;

//*****************************************************************************************
// Search Param Values
//*****************************************************************************************

export type SearchParamValue = null | boolean | number | string | string[];

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
