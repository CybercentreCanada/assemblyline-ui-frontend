import {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from 'features/search-params/search-params.blueprints';
import type {
  ParamBlueprints,
  SearchParamRuntimeMap,
  SearchParamValueMap
} from 'features/search-params/search-params.models';
import type { ParamRuntime } from 'features/search-params/search-params.runtimes';
import { PARAM_RUNTIMES } from 'features/search-params/search-params.runtimes';
import { SearchParamSnapshot } from 'features/search-params/search-params.snapshots';
import type { Location } from 'react-router';

export class SearchParamEngine<Blueprints extends Record<string, ParamBlueprints>> {
  private runtimes: SearchParamRuntimeMap<Blueprints>;

  constructor(blueprints: Blueprints) {
    this.runtimes = Object.entries(blueprints).reduce((prev, [key, bp]) => {
      if (bp instanceof BooleanBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.boolean(key, bp) };
      if (bp instanceof NumberBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.number(key, bp) };
      if (bp instanceof StringBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.string(key, bp) };
      if (bp instanceof FiltersBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.filters(key, bp) };
      if (bp instanceof EnumBlueprint) return { ...prev, [key]: new PARAM_RUNTIMES.enum(key, bp) };
      return prev;
    }, {} as SearchParamRuntimeMap<Blueprints>);
  }

  private runtimeEntries() {
    return Object.entries(this.runtimes) as [string, ParamRuntime][];
  }

  public getDefaultValues() {
    const values = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.getDefaultValue() }),
      {} as SearchParamValueMap<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public setDefaultValues(values: URLSearchParams = new URLSearchParams()) {
    if (!values) return this;
    this.runtimes = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.setDefaultValue(values) }),
      {} as SearchParamRuntimeMap<Blueprints>
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

  public full(value: URLSearchParams | SearchParamValueMap<Blueprints>) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.full(prev, value),
      {} as SearchParamValueMap<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public delta(value: URLSearchParams | SearchParamValueMap<Blueprints>) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.delta(prev, value),
      {} as SearchParamValueMap<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromLocation(location: Location, snapshot: SearchParamSnapshot<Blueprints> = null) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.fromLocation(prev, location, snapshot),
      {} as SearchParamValueMap<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }
}
