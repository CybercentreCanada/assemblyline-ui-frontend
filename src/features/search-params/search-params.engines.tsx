import {
  BooleanSearchParamBlueprint,
  EnumSearchParamBlueprint,
  FiltersSearchParamBlueprint,
  NumberSearchParamBlueprint,
  StringSearchParamBlueprint
} from 'features/search-params/search-params.blueprints';
import type {
  InferSearchParamRuntimeMapFromBlueprintMap,
  InferSearchParamValueMapFromBlueprintMap,
  SearchParamBlueprintMap,
  SearchParamRuntime
} from 'features/search-params/search-params.models';
import { SEARCH_PARAM_RUNTIME_MAP } from 'features/search-params/search-params.runtimes';
import { SearchParamSnapshot } from 'features/search-params/search-params.snapshots';
import type { Location } from 'react-router';

export class SearchParamEngine<Blueprints extends SearchParamBlueprintMap> {
  private runtimes: InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>;

  constructor(blueprints: Blueprints) {
    this.runtimes = Object.entries(blueprints).reduce((prev, [key, bp]) => {
      if (bp instanceof BooleanSearchParamBlueprint)
        return { ...prev, [key]: new SEARCH_PARAM_RUNTIME_MAP.boolean(key, bp) };
      if (bp instanceof NumberSearchParamBlueprint)
        return { ...prev, [key]: new SEARCH_PARAM_RUNTIME_MAP.number(key, bp) };
      if (bp instanceof StringSearchParamBlueprint)
        return { ...prev, [key]: new SEARCH_PARAM_RUNTIME_MAP.string(key, bp) };
      if (bp instanceof FiltersSearchParamBlueprint)
        return { ...prev, [key]: new SEARCH_PARAM_RUNTIME_MAP.filters(key, bp) };
      if (bp instanceof EnumSearchParamBlueprint) return { ...prev, [key]: new SEARCH_PARAM_RUNTIME_MAP.enum(key, bp) };
      return prev;
    }, {} as InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>);
  }

  private runtimeEntries() {
    return Object.entries(this.runtimes) as [string, SearchParamRuntime][];
  }

  public getDefaultValues() {
    const values = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.getDefaultValue() }),
      {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public setDefaultValues(values: URLSearchParams = new URLSearchParams()) {
    if (!values) return this;
    this.runtimes = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.setDefaultValue(values) }),
      {} as InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>
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

  public full(value: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<Blueprints>) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.full(prev, value),
      {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public delta(value: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<Blueprints>) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.delta(prev, value),
      {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>
    );

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromLocation(location: Location, snapshot: SearchParamSnapshot<Blueprints> = null) {
    const values = this.runtimeEntries().reduce(
      (prev, [, runtime]) => runtime.fromLocation(prev, location, snapshot),
      {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }
}
