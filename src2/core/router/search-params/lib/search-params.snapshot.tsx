import type { Location } from 'react-router';
import type {
  ParamBlueprints,
  ParamValues,
  SearchParamRuntimeMap,
  SearchParamValueMap
} from '../lib/search-params.model';
import type { ParamRuntime } from '../lib/search-params.runtime';

export class SearchParamSnapshot<Blueprints extends Record<string, ParamBlueprints>> {
  constructor(
    private runtimes: SearchParamRuntimeMap<Blueprints> = {} as SearchParamRuntimeMap<Blueprints>,
    public values: SearchParamValueMap<Blueprints> = {} as SearchParamValueMap<Blueprints>
  ) {}

  private runtimeEntries() {
    return Object.entries(this.runtimes) as [string, ParamRuntime][];
  }

  private valuesEntries(values: SearchParamValueMap<Blueprints>) {
    return Object.entries(values) as [string, ParamValues][];
  }

  public defaults() {
    const values = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.getDefaultValue() }),
      {} as SearchParamValueMap<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public has<K extends keyof SearchParamValueMap<Blueprints>>(key: K, value: unknown = undefined): boolean {
    const runtime = this.runtimes[key];
    if (!runtime) return false;
    return runtime.has(this.values?.[key], value);
  }

  public get<K extends keyof SearchParamValueMap<Blueprints>>(key: K): SearchParamValueMap<Blueprints>[K] | null {
    return this.has(key) ? this.values[key] : null;
  }

  public pick<K extends keyof SearchParamValueMap<Blueprints>>(keys: K[]) {
    const values = this.valuesEntries(this.values).reduce(
      (prev, [k, v]) => (keys.includes(k as K) ? { ...prev, [k]: v } : prev),
      {} as SearchParamValueMap<Blueprints>
    );
    return new SearchParamSnapshot(this.runtimes, values);
  }

  public omit<K extends keyof SearchParamValueMap<Blueprints>>(keys: K[]) {
    const values = this.valuesEntries(this.values).reduce(
      (prev, [k, v]) => (!keys.includes(k as K) ? { ...prev, [k as K]: v } : prev),
      {} as SearchParamValueMap<Blueprints>
    );
    return new SearchParamSnapshot(this.runtimes, values);
  }

  public set(
    input:
      | SearchParamValueMap<Blueprints>
      | ((value: SearchParamValueMap<Blueprints>) => SearchParamValueMap<Blueprints>)
  ): SearchParamSnapshot<Blueprints> {
    const newValues = typeof input === 'function' ? input(this.values) : input;
    return new SearchParamSnapshot(this.runtimes, structuredClone(newValues));
  }

  public toLocationSearch(): Location['search'] {
    const values = this.runtimeEntries().reduce((prev, [, runtime]) => {
      if (runtime.getOrigin() !== 'search') return prev;
      return runtime.delta(prev, this.values);
    }, {} as SearchParamValueMap<Blueprints>);

    return new SearchParamSnapshot(this.runtimes, values).toString();
  }

  public toLocationState(): Location['state'] {
    const values = this.runtimeEntries().reduce((prev, [, runtime]) => {
      if (runtime.getOrigin() !== 'state') return prev;
      return runtime.delta(prev, this.values);
    }, {} as SearchParamValueMap<Blueprints>);

    return new SearchParamSnapshot(this.runtimes, values).toObject();
  }

  public toObject(): SearchParamValueMap<Blueprints> {
    return structuredClone(this.values);
  }

  public toParams(): URLSearchParams {
    return new URLSearchParams(
      this.runtimeEntries().reduce((prev, [, runtime]) => runtime.toParams(prev, this.values), [] as string[][])
    );
  }

  public toString(): string {
    const params = this.toParams();
    params.sort();
    return params.toString();
  }
}
