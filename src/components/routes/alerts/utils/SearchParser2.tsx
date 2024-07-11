import type { Params, Types } from './SearchSchema';
import { ArrayParam, BaseParam, BooleanParam, NumberParam, StringParam } from './SearchSchema';

type SearchInput = string | string[][] | Record<string, string> | URLSearchParams;

type Options<T extends Params> = {
  enforced?: (keyof T)[];
  prefixes?: {
    not?: string;
    ignore?: string;
  };
};

export class SearchParams<T extends Params> {
  private search: URLSearchParams = new URLSearchParams();

  private params: Record<keyof T, BaseParam<T>> = null;

  constructor(init: SearchInput = null, params: Record<keyof T, BaseParam<T>> = null) {
    this.search = new URLSearchParams(init);
    this.params = params;
  }

  public toFiltered(predicate: (key: keyof T, value: Types) => boolean) {
    const next = new URLSearchParams();

    this.search.forEach((value, key) => {
      if (predicate(key, this.params[key].parse(value))) next.append(key, value);
    });

    return new SearchParams<T>(next, this.params);
  }

  public toCopy(predicate: (value: T) => T) {
    let obj = Object.values(this.params).reduce((prev, param) => param.object(prev, this.search), {} as T);
    obj = predicate(obj);

    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.from(output, obj));
    return new SearchParams<T>(output, this.params);
  }

  public fromParams(input: SearchInput) {
    const search = new URLSearchParams(input);
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.from(output, search));
    return new SearchParams<T>(output, this.params);
  }

  public get<K extends keyof T>(key: K): T[K] {
    return this.params?.[key]?.get(this.search) as T[K];
  }

  public toString() {
    return this.search.toString();
  }

  public toParams() {
    return this.search;
  }

  public toObject(): T {
    return Object.values(this.params).reduce((prev, param) => param.object(prev, this.search), {} as T);
  }

  public toSplitParams(predicate: (key: string, value: unknown) => boolean) {
    const first = new URLSearchParams();
    const second = new URLSearchParams();

    this.search.forEach((value, key) => {
      const res = predicate(key, this.params[key].parse(value));
      if (res === true) first.append(key, value);
      else if (res === false) second.append(key, value);
    });

    return [first, second];
  }
}

export class SearchParser<T extends Params> {
  private params: Record<keyof T, BaseParam<T>> = null;

  constructor(defaults: T = null, options?: Options<T>) {
    this.params = Object.entries(defaults).reduce((prev, [k, v]) => {
      const e = options?.enforced?.includes(k);
      if (ArrayParam.is(v)) return { ...prev, [k]: new ArrayParam<T>(k, v, e, options?.prefixes) };
      else if (BooleanParam.is(v)) return { ...prev, [k]: new BooleanParam<T>(k, v, e) };
      else if (NumberParam.is(v)) return { ...prev, [k]: new NumberParam<T>(k, v, e) };
      else if (StringParam.is(v)) return { ...prev, [k]: new StringParam<T>(k, v, e) };
      else return { ...prev, [k]: new BaseParam<T>(k, v, e) };
    }, {}) as Record<keyof T, BaseParam<T>>;
  }

  public fromParams(input: SearchInput) {
    const search = new URLSearchParams(input);
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.from(output, search));
    return new SearchParams<T>(output, this.params);
  }

  public fromObject(input: T) {
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.from(output, input));
    return new SearchParams<T>(output, this.params);
  }

  public fromDeltaParams(input: SearchInput) {
    const search = new URLSearchParams(input);
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.delta(output, search));
    return new SearchParams<T>(output, this.params);
  }

  public fromDeltaObject(input: T) {
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.delta(output, input));
    return new SearchParams<T>(output, this.params);
  }

  public fromMergeParams(
    first: SearchInput,
    second: SearchInput,
    predicate: <K extends keyof T>(key: K, values?: [Types, Types]) => boolean
  ) {
    const left = new URLSearchParams(first);
    const right = new URLSearchParams(second);
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.merge(output, left, right, predicate));
    return new SearchParams<T>(output, this.params);
  }
}
