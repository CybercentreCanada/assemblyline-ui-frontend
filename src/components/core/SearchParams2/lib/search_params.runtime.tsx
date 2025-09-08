/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseBlueprint } from 'components/core/SearchParams2/lib/search_params.blueprint';
import {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from 'components/core/SearchParams2/lib/search_params.blueprint';
import type {
  ParamBlueprints,
  ParamValues,
  SearchParamValues
} from 'components/core/SearchParams2/lib/search_params.model';
import type { SearchParamSnapshot } from 'components/core/SearchParams2/lib/search_params.snapshot';
import type { Location } from 'react-router';

type AnyFunction<A = any> = (...input: unknown[]) => A;

type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;

export type ParamRuntime = Mixin<typeof Runtime>;

export function Runtime<T extends ParamValues, B extends new (...args: any[]) => BaseBlueprint<T>>(Base: B) {
  return class Accessor extends Base {
    public defaultValue = (value: T) => {
      super.defaultValue(value);
      return this;
    };

    public getDefault = () => super.getDefaultValue();

    public fromLocation = <Blueprints extends Record<string, ParamBlueprints>>(
      prev: SearchParamValues<Blueprints>,
      location: Location,
      snapshot: SearchParamSnapshot<Blueprints>
    ) => super.fromLocation(prev, location, snapshot);

    public fromParams = <Blueprints extends Record<string, ParamBlueprints>>(
      prev: SearchParamValues<Blueprints>,
      value: URLSearchParams,
      snapshot: SearchParamSnapshot<Blueprints>
    ) => super.fromParams(prev, value, snapshot);

    public fromObject = <Blueprints extends Record<string, ParamBlueprints>>(
      prev: SearchParamValues<Blueprints>,
      value: SearchParamValues<Blueprints>,
      snapshot: SearchParamSnapshot<Blueprints>
    ) => super.fromObject(prev, value, snapshot);
  };
}

export const PARAM_RUNTIMES = {
  boolean: Runtime(BooleanBlueprint),
  number: Runtime(NumberBlueprint),
  string: Runtime(StringBlueprint),
  filters: Runtime(FiltersBlueprint),
  enum: Runtime(EnumBlueprint)
} as const;
