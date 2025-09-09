/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from 'components/core/SearchParams2/lib/search_params.blueprint';
import type { PARAM_RUNTIMES } from 'components/core/SearchParams2/lib/search_params.runtime';

export type ParamValues = null | boolean | number | string | string[];

/**
 * Sources from which a param can be resolved.
 */
export type ParamSource = 'search' | 'state' | 'snapshot';

/**
 * Supported blueprint types.
 */
// prettier-ignore
export type ParamBlueprints =
  | BooleanBlueprint
  | NumberBlueprint
  | StringBlueprint
  | FiltersBlueprint
  | EnumBlueprint<readonly string[]>;

/**
 * Infer the runtime value type from a given blueprint.
 */
// prettier-ignore
export type InferValue<B> =
  B extends BooleanBlueprint ? boolean :
  B extends NumberBlueprint ? number :
  B extends StringBlueprint ? string :
  B extends FiltersBlueprint ? string[] :
  B extends EnumBlueprint<infer T> ? T[number] :
  unknown;

/**
 * Infer the runtime class from a given blueprint.
 */
// prettier-ignore
export type InferRuntime<B> =
  B extends BooleanBlueprint ? (typeof PARAM_RUNTIMES)['boolean']["prototype"] & BooleanBlueprint :
  B extends NumberBlueprint ? (typeof PARAM_RUNTIMES)['number']["prototype"] & NumberBlueprint :
  B extends StringBlueprint ? (typeof PARAM_RUNTIMES)['string']["prototype"] & StringBlueprint :
  B extends FiltersBlueprint ? (typeof PARAM_RUNTIMES)['filters']["prototype"] & FiltersBlueprint :
  B extends EnumBlueprint<any> ? (typeof PARAM_RUNTIMES)['enum']["prototype"] & EnumBlueprint<any> :
  unknown;

/**
 * Map of search param names → resolved values.
 */
export type SearchParamValues<Blueprints extends Record<string, ParamBlueprints>> = {
  [K in keyof Blueprints]: InferValue<Blueprints[K]>;
};

/**
 * Map of search param names → runtime handlers.
 */
export type SearchParamRuntimes<Blueprints extends Record<string, ParamBlueprints>> = {
  [K in keyof Blueprints]: InferRuntime<Blueprints[K]>;
};
