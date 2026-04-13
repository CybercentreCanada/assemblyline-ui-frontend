import type { Location } from 'react-router';
import {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from '../lib/search-params.blueprint';
import type { ParamRuntime } from '../lib/search-params.runtime';
import { PARAM_RUNTIMES } from '../lib/search-params.runtime';
import { SearchParamSnapshot } from '../lib/search-params.snapshot';
import type { ParamBlueprints, SearchParamRuntimeMap, SearchParamValueMap } from './search-params.model';

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
