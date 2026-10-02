import type {
  InferSearchParamRuntimeMapFromBlueprintMap,
  InferSearchParamValueMapFromBlueprintMap,
  SearchParamBlueprintMap,
  SearchParamRuntime,
  SearchParamSource,
  SearchParamValue
} from 'features/search-params';
import type { SetStateAction } from 'react';
import type { Location } from 'react-router';

export class SearchParamSnapshot<Blueprints extends SearchParamBlueprintMap> {
  constructor(
    private runtimes: InferSearchParamRuntimeMapFromBlueprintMap<Blueprints> = {} as InferSearchParamRuntimeMapFromBlueprintMap<Blueprints>,
    public values: InferSearchParamValueMapFromBlueprintMap<Blueprints> = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>
  ) {}

  private runtimeEntries() {
    return Object.entries(this.runtimes) as unknown as [
      Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>,
      SearchParamRuntime
    ][];
  }

  private valuesEntries(values: InferSearchParamValueMapFromBlueprintMap<Blueprints>) {
    return Object.entries(values) as [string, SearchParamValue][];
  }

  public defaults() {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [key, runtime] of this.runtimeEntries()) {
      (values as Record<string, unknown>)[key] = runtime.getDefaultValue();
    }

    return new SearchParamSnapshot<Blueprints>(this.runtimes, values);
  }

  public ephemeralKeys(): Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] {
    const keys: Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.isEphemeral()) keys.push(key);
    }
    return keys;
  }

  public ignoredKeys(): Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] {
    const keys: Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.isIgnored()) keys.push(key);
    }
    return keys;
  }

  public lockedKeys(): Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] {
    const keys: Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.isLocked()) keys.push(key);
    }
    return keys;
  }

  public sourceKeys(
    source: SearchParamSource
  ): Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] {
    const keys: Extract<keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>, string>[] = [];
    for (const [key, runtime] of this.runtimeEntries()) {
      if (runtime.getSource() === source) keys.push(key);
    }
    return keys;
  }

  public has<K extends keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>>(
    key: K,
    value: unknown = undefined
  ): boolean {
    const runtime = this.runtimes?.[key];
    if (!runtime) return false;
    return runtime.has(this.values?.[key], value);
  }

  public get<K extends keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>>(
    key: K
  ): InferSearchParamValueMapFromBlueprintMap<Blueprints>[K] | null {
    if (!this.has(key)) return null;
    const value = this.valuesEntries(this.values).find(([k]) => k === key)?.[1];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (value ?? null) as InferSearchParamValueMapFromBlueprintMap<Blueprints>[K] | null;
  }

  public pick<K extends keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>>(keys: K[]) {
    const picked = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [k, v] of this.valuesEntries(this.values)) {
      if (!keys.includes(k as K)) continue;
      (picked as Record<string, SearchParamValue>)[k] = v;
    }

    const values = picked;
    return new SearchParamSnapshot(this.runtimes, values);
  }

  public omit<K extends keyof InferSearchParamValueMapFromBlueprintMap<Blueprints>>(keys: K[]) {
    const omitted = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [k, v] of this.valuesEntries(this.values)) {
      if (keys.includes(k as K)) continue;
      (omitted as Record<string, SearchParamValue>)[k] = v;
    }

    const values = omitted;
    return new SearchParamSnapshot(this.runtimes, values);
  }

  public set(
    input: SetStateAction<InferSearchParamValueMapFromBlueprintMap<Blueprints>>
  ): SearchParamSnapshot<Blueprints> {
    const newValues = typeof input === 'function' ? input(this.values) : input;
    return new SearchParamSnapshot(this.runtimes, structuredClone(newValues));
  }

  public toLocationSearch(): Location['search'] {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      if (runtime.getSource() !== 'search') continue;
      runtime.delta(values, this.values);
    }

    return new SearchParamSnapshot(this.runtimes, values).toString();
  }

  public toLocationState(): InferSearchParamValueMapFromBlueprintMap<Blueprints> {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      if (runtime.getSource() !== 'state') continue;
      runtime.delta(values, this.values);
    }

    return new SearchParamSnapshot(this.runtimes, values).toObject();
  }

  public toLocationTransient(): InferSearchParamValueMapFromBlueprintMap<Blueprints> {
    const values = {} as InferSearchParamValueMapFromBlueprintMap<Blueprints>;
    for (const [, runtime] of this.runtimeEntries()) {
      if (runtime.getSource() !== 'transient') continue;
      runtime.delta(values, this.values);
    }

    return new SearchParamSnapshot(this.runtimes, values).toObject();
  }

  public toObject(): InferSearchParamValueMapFromBlueprintMap<Blueprints> {
    return structuredClone(this.values);
  }

  public toParams(): URLSearchParams {
    const params: string[][] = [];
    for (const [, runtime] of this.runtimeEntries()) {
      runtime.toParams(params, this.values);
    }

    return new URLSearchParams(params);
  }

  public toString(): string {
    const params = this.toParams();
    params.sort();
    return params.toString();
  }
}
