import type {
  ParamBlueprints,
  SearchParamRuntimes,
  SearchParamValues
} from 'components/core/SearchParams2/lib/search_params.model';
import type { Location } from 'react-router';

export class SearchParamSnapshot<Blueprints extends Record<string, ParamBlueprints>> {
  constructor(
    private runtimes: SearchParamRuntimes<Blueprints>,
    public values: SearchParamValues<Blueprints>
  ) {}

  private entries<K extends keyof SearchParamRuntimes<Blueprints>>(): [string, SearchParamRuntimes<Blueprints>[K]][] {
    return Object.entries(this.runtimes) as [string, SearchParamRuntimes<Blueprints>[K]][];
  }

  public defaults() {
    const values = this.entries().reduce(
      (prev, [key, runtime]) => ({ ...prev, [key]: runtime.getDefault() }),
      {} as SearchParamValues<Blueprints>
    );
    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public has<K extends keyof SearchParamValues<Blueprints>>(key: K, value: unknown = undefined): boolean {
    const runtime = this.runtimes[key as string];
    if (!runtime) return false;
    return runtime.has(this.values?.[key], value);
  }

  public get<K extends keyof SearchParamValues<Blueprints>>(key: K): SearchParamValues<Blueprints>[K] | null {
    return this.has(key) ? this.values[key] : null;
  }

  public pick<K extends keyof SearchParamValues<Blueprints>>(
    keys: K[]
  ): SearchParamSnapshot<Pick<Blueprints, K & string>> {
    const runtimes = this.entries().reduce(
      (prev, [k, runtime]) => (keys.includes(k as K) ? { ...prev, [k]: runtime } : prev),
      {} as SearchParamRuntimes<Pick<Blueprints, K & string>>
    );
    const values = Object.entries(this.values).reduce(
      (prev, [k, v]) => (keys.includes(k as K) ? { ...prev, [k]: v } : prev),
      {} as SearchParamValues<Pick<Blueprints, K & string>>
    );
    return new SearchParamSnapshot(runtimes, values);
  }

  public omit<K extends keyof SearchParamValues<Blueprints>>(
    keys: K[]
  ): SearchParamSnapshot<Omit<Blueprints, K & string>> {
    const runtimes = this.entries().reduce(
      (prev, [k, runtime]) => (!keys.includes(k as K) ? { ...prev, [k]: runtime } : prev),
      {} as SearchParamRuntimes<Omit<Blueprints, K & string>>
    );
    const values = Object.entries(this.values).reduce(
      (prev, [k, v]) => (!keys.includes(k as K) ? { ...prev, [k]: v } : prev),
      {} as SearchParamValues<Omit<Blueprints, K & string>>
    );
    return new SearchParamSnapshot(runtimes, values);
  }

  public set(
    input: SearchParamValues<Blueprints> | ((value: SearchParamValues<Blueprints>) => SearchParamValues<Blueprints>)
  ): SearchParamSnapshot<Blueprints> {
    const newValues = typeof input === 'function' ? input(this.values) : input;
    return new SearchParamSnapshot(this.runtimes, structuredClone(newValues));
  }

  public getSearch(): Location['search'] {
    const params = new URLSearchParams();

    this.entries().forEach(([key, runtime]) => {
      if (runtime.getSource() !== 'search' || runtime.getIgnored()) return;

      const value = this.values[key as keyof typeof this.values];
      runtime.toParams([[key, value as any]], this.values).forEach(([k, v]) => {
        if (v != null) params.set(k, v);
      });
    });

    const searchString = params.toString();
    return searchString ? `?${searchString}` : '';
  }

  public getState(): Location['state'] {
    const state: Record<string, unknown> = {};

    this.entries().forEach(([key, runtime]) => {
      if (runtime.getSource() !== 'state') return;

      const value = this.values[key as keyof typeof this.values];
      if (value !== undefined) {
        state[key] = value;
      }
    });

    return Object.keys(state).length > 0 ? state : null;
  }

  public toObject(): SearchParamValues<Blueprints> {
    return structuredClone(this.values);
  }

  public toParams(): URLSearchParams {
    return new URLSearchParams(
      Object.values(this.runtimes).reduce<string[][]>((prev, format) => format.toParams(prev, this.values), [])
    );
  }

  public toString(): string {
    return this.toParams().toString();
  }
}
