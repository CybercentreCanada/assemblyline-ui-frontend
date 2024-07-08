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

  // public toCopy(predicate: (value: T) => T) {
  //   const entries = this.formatter.convertObj(predicate(this.formatter.convertParams(this.search)));
  //   return new SearchParams<T>(entries, this.format);
  // }

  // public get<K extends keyof T>(key: K): T[K] {
  //   const t = this.formatter.get(key);
  //   return this.formatter.parseParam(
  //     key,
  //     t === 'string[]' ? this.search.getAll(key as string) : this.search.get(key as string)
  //   );
  // }

  public toString() {
    return this.search.toString();
  }

  public toParams() {
    return this.search;
  }

  public toObject(): T {
    return Object.values(this.params).reduce((prev, param) => param.toObject(prev, this.search), {} as T);
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

  // private defaults: URLSearchParams = new URLSearchParams();

  // private enforced: (keyof T)[] = [];

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
    console.log(this.params);
    const search = new URLSearchParams(input);
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.fromParams(output, search));
    return new SearchParams<T>(output, this.params);
  }

  public fromObject(input: T) {
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.fromObject(output, input));
    return new SearchParams<T>(output, this.params);
  }

  public fromDeltaParams(input: SearchInput) {
    const search = new URLSearchParams(input);
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.fromDeltaParams(output, search));
    return new SearchParams<T>(output, this.params);
  }

  public fromDeltaObject(input: T) {
    const output = new URLSearchParams();
    Object.values(this.params).forEach(param => param.fromDeltaObject(output, input));
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
    Object.values(this.params).forEach(param => param.fromMergeParams(output, left, right, predicate));
    return new SearchParams<T>(output, this.params);
  }

  // public setDefaultParams(value: SearchInput) {
  //   this.defaults = this.formatter.parseParams(value);
  //   return this;
  // }

  // public setDefaultObject(value: T) {
  //   this.defaults = this.formatter.convertObj(value);
  //   return this;
  // }

  // public fromParams(input: SearchInput) {
  //   const search = new URLSearchParams(input);

  //   const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
  //     if (t === 'string[]') {
  //       let next = this.enforced.includes(k) ? [] : search.getAll(k);
  //       next = this.formatter.mergeArray(this.defaults.getAll(k), next);
  //       return [...current, ...next.map(v => [k, v])];
  //     } else {
  //       if (!this.enforced.includes(k) && search.has(k)) return [...current, [k, search.get(k)]];
  //       else if (this.defaults.has(k)) return [...current, [k, this.defaults.get(k)]];
  //     }
  //     return current;
  //   }, []);

  //   return new SearchParams<T>(entries, this.format);
  // }

  // public fromObject(input: T) {
  //   const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
  //     if (t === 'string[]') {
  //       let next = this.enforced.includes(k) ? [] : Array.isArray(input?.[k]) ? (input[k] as string[]) : [];
  //       next = this.formatter.mergeArray(this.defaults.getAll(k), next);
  //       return [...current, ...next.map(v => [k, v])];
  //     } else {
  //       if (!this.enforced.includes(k) && k in input) return [...current, [k, String(input[k])]];
  //       else if (this.defaults.has(k)) return [...current, [k, this.defaults.get(k)]];
  //     }
  //     return current;
  //   }, []);

  //   return new SearchParams<T>(entries, this.format);
  // }

  // public fromDeltaParams(input: SearchInput) {
  //   const search = new URLSearchParams(input);

  //   const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
  //     if (this.enforced.includes(k)) {
  //       return current;
  //     } else if (t === 'string[]') {
  //       const next = this.formatter.diffArray(search.getAll(k), this.defaults.getAll(k));
  //       return [...current, ...next.map(v => [k, v])];
  //     } else {
  //       if (search.has(k) && search.get(k) !== this.defaults.get(k)) return [...current, [k, search.get(k)]];
  //     }
  //     return current;
  //   }, []);

  //   return new SearchParams<T>(entries, this.format);
  // }

  // public mergeParams(
  //   first: SearchInput,
  //   second: SearchInput,
  //   predicate: <K extends keyof T>(key: K, values?: [any, any]) => boolean
  // ) {
  //   const left = new URLSearchParams(first);
  //   const right = new URLSearchParams(second);

  //   const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
  //     if (t === 'string[]') {
  //       const res = predicate(k, [left.getAll(k), right.getAll(k)]);
  //       let next: string[] = [];
  //       next = res === true ? this.formatter.mergeArray(left.getAll(k), next) : next;
  //       next = res === false ? this.formatter.mergeArray(right.getAll(k), next) : next;
  //       next = this.formatter.mergeArray(this.defaults.getAll(k), next);
  //       return [...current, ...next.map(v => [k, v])];
  //     } else {
  //       const enf = this.enforced.includes(k);
  //       const res = predicate(k, [
  //         this.formatter.parseParam(k, left.get(k)),
  //         this.formatter.parseParam(k, right.get(k))
  //       ]);

  //       if (!enf && res === true && left.has(k)) return [...current, [k, left.get(k)]];
  //       else if (!enf && res === false && right.has(k)) return [...current, [k, right.get(k)]];
  //       else if (this.defaults.has(k)) return [...current, [k, this.defaults.get(k)]];
  //       else return current;
  //     }
  //   }, []);

  //   return new SearchParams<T>(entries, this.format);
  // }
}
