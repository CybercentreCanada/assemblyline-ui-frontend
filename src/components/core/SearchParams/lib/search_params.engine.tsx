import {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from 'components/core/SearchParams/lib/search_params.blueprint';
import type {
  ParamBlueprints,
  SearchParamRuntimes,
  SearchParamValues
} from 'components/core/SearchParams/lib/search_params.model';
import type { ParamRuntime } from 'components/core/SearchParams/lib/search_params.runtime';
import { PARAM_RUNTIMES } from 'components/core/SearchParams/lib/search_params.runtime';
import { SearchParamSnapshot } from 'components/core/SearchParams/lib/search_params.snapshot';
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

  private runtimeEntries() {
    return Object.entries(this.runtimes) as [string, ParamRuntime][];
  }

  public getDefaultValues() {
    const values = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.getDefaultValue() }),
      {} as SearchParamValues<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public setDefaultValues(values: URLSearchParams = new URLSearchParams()) {
    this.runtimes = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.setDefaultValue(values) }),
      {} as SearchParamRuntimes<Blueprints>
    );
    return this;
  }

  public getEphemeralKeys() {
    return this.runtimeEntries().reduce(
      (prev, [key, runtime]) => (runtime.isEphemeral() ? [...prev, key] : prev),
      [] as string[]
    );
  }

  public getIgnoredKeys() {
    return this.runtimeEntries().reduce(
      (prev, [key, runtime]) => (runtime.isIgnored() ? [...prev, key] : prev),
      [] as string[]
    );
  }

  public getLockedKeys() {
    return this.runtimeEntries().reduce(
      (prev, [key, runtime]) => (runtime.isLocked() ? [...prev, key] : prev),
      [] as string[]
    );
  }

  public full(value: URLSearchParams | SearchParamValues<Blueprints>) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.full(prev, value),
      {} as SearchParamValues<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public delta(value: URLSearchParams | SearchParamValues<Blueprints>) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.delta(prev, value),
      {} as SearchParamValues<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromLocation(location: Location, snapshot: SearchParamSnapshot<Blueprints> = null) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.fromLocation(prev, location, snapshot),
      {} as SearchParamValues<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }
}
