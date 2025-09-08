import {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from 'components/core/SearchParams2/lib/search_params.blueprint';
import type {
  ParamBlueprints,
  SearchParamRuntimes,
  SearchParamValues
} from 'components/core/SearchParams2/lib/search_params.model';
import type { ParamRuntime } from 'components/core/SearchParams2/lib/search_params.runtime';
import { PARAM_RUNTIMES } from 'components/core/SearchParams2/lib/search_params.runtime';
import { SearchParamSnapshot } from 'components/core/SearchParams2/lib/search_params.snapshot';
import type { Location } from 'react-router';

export class SearchParamEngine<Blueprints extends Record<string, ParamBlueprints>> {
  private runtimes: SearchParamRuntimes<Blueprints>;

  constructor(blueprints: Blueprints) {
    this.runtimes = Object.entries(blueprints).reduce((prev, [key, bp]) => {
      if (bp instanceof BooleanBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.boolean(key, bp) };
      if (bp instanceof NumberBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.number(key, bp) };
      if (bp instanceof StringBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.string(key, bp) };
      if (bp instanceof FiltersBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.filters(key, bp) };
      if (bp instanceof EnumBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.enum(key, bp) };
      return prev;
    }, {} as SearchParamRuntimes<Blueprints>);
  }

  private reduce<T>(callbackfn: (acc: T, current: [string, ParamRuntime]) => T, init: T): T {
    return Object.entries(this.runtimes).reduce(callbackfn, init);
  }

  public fromLocation(location: Location, snapshot: SearchParamSnapshot<Blueprints>): SearchParamSnapshot<Blueprints> {
    const values = this.reduce(
      (prev, [, runtime]) => runtime.fromLocation(prev, location, snapshot),
      {} as SearchParamValues<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromParams(
    value: URLSearchParams,
    snapshot: SearchParamSnapshot<Blueprints>
  ): SearchParamSnapshot<Blueprints> {
    const values = this.reduce(
      (prev, [, runtime]) => runtime.fromParams(prev, value, snapshot),
      {} as SearchParamValues<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromObject(
    value: SearchParamValues<Blueprints>,
    snapshot: SearchParamSnapshot<Blueprints>
  ): SearchParamSnapshot<Blueprints> {
    const values = this.reduce(
      (prev, [, runtime]) => runtime.fromObject(prev, value, snapshot),
      {} as SearchParamValues<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }
}
