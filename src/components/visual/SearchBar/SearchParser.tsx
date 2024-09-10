import _ from 'lodash';
import type { Formatters, MIxinFormat, Params } from './SearchParams';
import { BooleanParam, EnumParam, FiltersParam, NumberParam, StringParam, formatters } from './SearchParams';

/**
 * Search Utils
 */
type Input = string | string[][] | Record<string, string> | URLSearchParams;

export type GetParams<P extends Params> = {
  [K in keyof P]: P[K] extends boolean
    ? BooleanParam
    : P[K] extends number
    ? NumberParam
    : P[K] extends string
    ? StringParam
    : unknown;
};

/**
 * Search Result
 */
export class SearchResult<P extends Params> {
  private formats: Formatters = null;

  private values: P = null;

  constructor(formats: Formatters, values: P) {
    this.formats = formats;
    this.values = values;
  }

  public has<K extends keyof P>(key: K): boolean {
    return key in this.values;
  }

  public get<K extends keyof P>(key: K): P[K] {
    return this.has(key) ? this.values[key] : null;
  }

  public pick<K extends keyof P>(keys: K[]) {
    const values = Object.entries(this.values).reduce(
      (prev, [key, value]) => (keys.includes(key as K) ? { ...prev, [key]: value } : prev),
      {} as P
    );
    return new SearchResult<P>(this.formats, values);
  }

  public omit<K extends keyof P>(keys: K[]) {
    const values = Object.entries(this.values).reduce(
      (prev, [key, value]) => (!keys.includes(key as K) ? { ...prev, [key]: value } : prev),
      {} as P
    );
    return new SearchResult<P>(this.formats, values);
  }

  public set(input: P | ((value: P) => P)) {
    const values = _.cloneDeep(typeof input === 'function' ? input(this.values) : input);
    return new SearchResult<P>(this.formats, values);
  }

  public toObject(): P {
    return _.cloneDeep(this.values);
  }

  public toParams(): URLSearchParams {
    return new URLSearchParams(
      Object.values(this.formats).reduce<string[][]>((prev, format) => format.toParams(prev, this.values), [])
    );
  }

  public toString(): string {
    return this.toParams().toString();
  }
}

/**
 * Search Parser
 */
export class SearchParser<P extends Params> {
  private formats: Formatters = null;

  constructor(params: GetParams<P>) {
    this.formats = Object.entries(params).reduce((prev, [key, format]) => {
      if (format instanceof BooleanParam) return { ...prev, [key]: new formatters.boolean(key, format) };
      else if (format instanceof NumberParam) return { ...prev, [key]: new formatters.number(key, format) };
      else if (format instanceof StringParam) return { ...prev, [key]: new formatters.string(key, format) };
      else if (format instanceof FiltersParam) return { ...prev, [key]: new formatters.filters(key, format) };
      else if (format instanceof EnumParam) return { ...prev, [key]: new formatters.enum(key, format) };
      else return { ...prev };
    }, {}) as Formatters;
  }

  private reduce<T>(callbackfn: (previousValue: T, current: [string, MIxinFormat]) => T, init: T): T {
    return Object.entries(this.formats).reduce(callbackfn, init);
  }

  public setDefaults(values: P) {
    if (!values) return this;
    Object.keys(this.formats).forEach(key => this.formats[key].default(values?.[key]));
    return this;
  }

  public getDefaults() {
    return this.reduce((prev, [key, format]) => ({ ...prev, [key]: format.getDefault() }), {});
  }

  public getIgnoredKeys() {
    return this.reduce<Array<keyof P>>((prev, [key, format]) => (format.isIgnored() ? [...prev, key] : prev), []);
  }

  public getHiddenKeys() {
    return this.reduce<Array<keyof P>>((prev, [key, format]) => (format.isHidden() ? [...prev, key] : prev), []);
  }

  public fromParams(input: Input) {
    const search = new URLSearchParams(input);
    const output = this.reduce<P>((prev, [, param]) => param.from(prev, search), {} as P);
    return new SearchResult<P>(this.formats, output);
  }

  public fromObject(input: P) {
    const output = this.reduce<P>((prev, [, param]) => param.from(prev, input), {} as P);
    return new SearchResult<P>(this.formats, output);
  }

  public fullParams(input: Input) {
    const search = new URLSearchParams(input);
    const output = this.reduce<P>((prev, [, param]) => param.full(prev, search), {} as P);
    return new SearchResult<P>(this.formats, output);
  }

  public fullObject(input: P) {
    const output = this.reduce<P>((prev, [, param]) => param.full(prev, input), {} as P);
    return new SearchResult<P>(this.formats, output);
  }

  public deltaParams(input: Input) {
    const search = new URLSearchParams(input);
    const output = this.reduce<P>((prev, [, param]) => param.delta(prev, search), {} as P);
    return new SearchResult<P>(this.formats, output);
  }

  public deltaObject(input: P) {
    const output = this.reduce<P>((prev, [, param]) => param.delta(prev, input), {} as P);
    return new SearchResult<P>(this.formats, output);
  }

  public mergeParams(first: Input, second: Input, keys: Array<keyof P>) {
    const left = new URLSearchParams(first);
    const right = new URLSearchParams(second);
    const output = this.reduce<P>((prev, [, param]) => param.merge(prev, left, right, keys), {} as P);
    return new SearchResult<P>(this.formats, output);
  }
}
