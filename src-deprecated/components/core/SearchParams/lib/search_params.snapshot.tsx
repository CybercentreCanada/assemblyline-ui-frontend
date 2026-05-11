import type {
  ParamBlueprints,
  ParamValues,
  SearchParamRuntimes,
  SearchParamValues
} from 'components/core/SearchParams/lib/search_params.model';
import type { ParamRuntime } from 'components/core/SearchParams/lib/search_params.runtime';
import type { Location } from 'react-router';

export class SearchParamSnapshot<Blueprints extends Record<string, ParamBlueprints>> {
  constructor(
    private runtimes: SearchParamRuntimes<Blueprints> = {} as SearchParamRuntimes<Blueprints>,
    public values: SearchParamValues<Blueprints> = {} as SearchParamValues<Blueprints>
  ) {}

  private runtimeEntries() {
    return Object.entries(this.runtimes) as [string, ParamRuntime][];
  }

  private valuesEntries(values: SearchParamValues<Blueprints>) {
    return Object.entries(values) as [string, ParamValues][];
  }

  public defaults() {
    const values = this.runtimeEntries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.getDefaultValue() }),
      {} as SearchParamValues<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public has<K extends keyof SearchParamValues<Blueprints>>(key: K, value: unknown = undefined): boolean {
    const runtime = this.runtimes[key];
    if (!runtime) return false;
    return runtime.has(this.values?.[key], value);
  }

  public get<K extends keyof SearchParamValues<Blueprints>>(key: K): SearchParamValues<Blueprints>[K] | null {
    return this.has(key) ? this.values[key] : null;
  }

  public pick<K extends keyof SearchParamValues<Blueprints>>(keys: K[]) {
    const values = this.valuesEntries(this.values).reduce(
      (prev, [k, v]) => (keys.includes(k as K) ? { ...prev, [k]: v } : prev),
      {} as SearchParamValues<Blueprints>
    );
    return new SearchParamSnapshot(this.runtimes, values);
  }

  public omit<K extends keyof SearchParamValues<Blueprints>>(keys: K[]) {
    const values = this.valuesEntries(this.values).reduce(
      (prev, [k, v]) => (!keys.includes(k as K) ? { ...prev, [k as K]: v } : prev),
      {} as SearchParamValues<Blueprints>
    );
    return new SearchParamSnapshot(this.runtimes, values);
  }

  public set(
    input: SearchParamValues<Blueprints> | ((value: SearchParamValues<Blueprints>) => SearchParamValues<Blueprints>)
  ): SearchParamSnapshot<Blueprints> {
    const newValues = typeof input === 'function' ? input(this.values) : input;
    return new SearchParamSnapshot(this.runtimes, structuredClone(newValues));
  }

  public toLocationSearch(): Location['search'] {
    const values = this.runtimeEntries().reduce((prev, [, runtime]) => {
      if (runtime.getOrigin() !== 'search') return prev;
      return runtime.delta(prev, this.values);
    }, {} as SearchParamValues<Blueprints>);

    return new SearchParamSnapshot(this.runtimes, values).toString();
  }

  public toLocationState(): Location['state'] {
    const values = this.runtimeEntries().reduce((prev, [, runtime]) => {
      if (runtime.getOrigin() !== 'state') return prev;
      return runtime.delta(prev, this.values);
    }, {} as SearchParamValues<Blueprints>);

    return new SearchParamSnapshot(this.runtimes, values).toObject();
  }

  public toObject(): SearchParamValues<Blueprints> {
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
