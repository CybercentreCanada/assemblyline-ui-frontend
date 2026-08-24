import type {
  InferSearchParamRuntimeMapFromBlueprintMap,
  InferSearchParamValueMapFromBlueprintMap,
  SearchParamBlueprintMap,
  SearchParamRuntime
} from 'features/search-params';
import {
  BooleanSearchParamBlueprint,
  EnumSearchParamBlueprint,
  FiltersSearchParamBlueprint,
  NumberSearchParamBlueprint,
  ObjectSearchParamBlueprint,
  SEARCH_PARAM_RUNTIME_MAP,
  SearchParamSnapshot,
  StringSearchParamBlueprint
} from 'features/search-params';
import type { Location } from 'react-router';

export class SearchParamEngine<Blueprints extends SearchParamBlueprintMap> {
  private runtimes: InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>;

  constructor(blueprints: Blueprints) {
    const runtimes = {} as InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>;

    for (const [key, bp] of Object.entries(blueprints || {})) {
      if (bp instanceof BooleanSearchParamBlueprint) {
        (runtimes as Record<string, SearchParamRuntime>)[key] = new SEARCH_PARAM_RUNTIME_MAP.boolean(key, bp);
        continue;
      }

      if (bp instanceof NumberSearchParamBlueprint) {
        (runtimes as Record<string, SearchParamRuntime>)[key] = new SEARCH_PARAM_RUNTIME_MAP.number(key, bp);
        continue;
      }

      if (bp instanceof StringSearchParamBlueprint) {
        (runtimes as Record<string, SearchParamRuntime>)[key] = new SEARCH_PARAM_RUNTIME_MAP.string(key, bp);
        continue;
      }

      if (bp instanceof FiltersSearchParamBlueprint) {
        (runtimes as Record<string, SearchParamRuntime>)[key] = new SEARCH_PARAM_RUNTIME_MAP.filters(key, bp);
        continue;
      }

      if (bp instanceof ObjectSearchParamBlueprint) {
        (runtimes as Record<string, SearchParamRuntime>)[key] = new SEARCH_PARAM_RUNTIME_MAP.object(key, bp);
        continue;
      }

      if (bp instanceof EnumSearchParamBlueprint) {
        (runtimes as Record<string, SearchParamRuntime>)[key] = new SEARCH_PARAM_RUNTIME_MAP.enum(key, bp);
      }
    }

    this.runtimes = runtimes;
  }

  private runtimeEntries() {
    return Object.entries(this.runtimes) as [string, SearchParamRuntime][];
  }

  public getDefaultValues() {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [key, runtime] of this.runtimeEntries()) {
      (values as Record<string, unknown>)[key] = runtime.getDefaultValue();
    }
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public setDefaultValues(values: URLSearchParams = new URLSearchParams()) {
    if (!values) return this;

    const runtimes = {} as InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>;
    for (const [key, runtime] of this.runtimeEntries()) {
      (runtimes as Record<string, SearchParamRuntime>)[key] = runtime.setDefaultValue(values);
    }

    this.runtimes = runtimes;
    return this;
  }

  public getEphemeralKeys() {
    const keys: string[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.isEphemeral()) keys.push(key);
    }
    return keys;
  }

  public getIgnoredKeys() {
    const keys: string[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.isIgnored()) keys.push(key);
    }
    return keys;
  }

  public getLockedKeys() {
    const keys: string[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.isLocked()) keys.push(key);
    }
    return keys;
  }

  public full(value: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<Blueprints>) {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      runtime.full(values, value);
    }

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public delta(value: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<Blueprints>) {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      runtime.delta(values, value);
    }

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromLocation(location: Location, snapshot: SearchParamSnapshot<Blueprints> = null) {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      runtime.fromLocation(values, location, snapshot);
    }

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public fromRoute(href: string, state: unknown = null, transient: unknown = null) {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      runtime.fromRoute(values, href, state, transient);
    }

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }
}
