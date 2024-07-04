// export type Params = Record<string, boolean | number | string | string[]>;

export type Params = {
  [param: string]: boolean | number | string | string[];
};

type SearchInput = string | string[][] | Record<string, string> | URLSearchParams;

type Options<T extends Params> = {
  enforced?: (keyof T)[];
  prefixes?: {
    not?: string;
    ignore?: string;
  };
};

export type SearchFormat<T extends Params> = {
  [P in keyof T]: T[P] extends Array<string>
    ? 'string[]'
    : T[P] extends number
    ? 'number'
    : T[P] extends boolean
    ? 'boolean'
    : 'string';
};

export class SearchFormatter<T extends Params> {
  private format: SearchFormat<T> = null;

  private prefixes: { not: string; ignore: string } = { not: 'NOT', ignore: '!' };

  constructor(
    format: SearchFormat<T> = null,
    prefixes: { not?: string; ignore?: string } = { not: 'NOT', ignore: '!' }
  ) {
    const { not = 'NOT', ignore = '!' } = prefixes;

    this.format = format;
    this.prefixes = { not, ignore };
  }

  private calcPrefix(value: string): [string, string] {
    if (value.startsWith(`${this.prefixes.ignore}(${this.prefixes.not}(`) && value.endsWith('))')) {
      return [
        this.prefixes.ignore,
        value.substring(this.prefixes.ignore.length + this.prefixes.not.length + 2, value.length - 2)
      ];
    } else if (value.startsWith(`${this.prefixes.ignore}(`) && value.endsWith(')')) {
      return [this.prefixes.ignore, value.substring(this.prefixes.ignore.length + 1, value.length - 1)];
    } else if (value.startsWith(`${this.prefixes.not}(`) && value.endsWith(')')) {
      return [this.prefixes.not, value.substring(this.prefixes.not.length + 1, value.length - 1)];
    } else {
      return ['', value];
    }
  }

  public get(key: keyof T) {
    return key in this.format ? this.format[key] : null;
  }

  public mergeArray(origin: string[], defaults: string[]) {
    let values: [string, string][] = [];
    values = [...defaults, ...origin].reduceRight((prev, current) => {
      const [prefix, value] = this.calcPrefix(current);
      return prev.some(([, value2]) => value === value2) ? prev : [...prev, [prefix, value]];
    }, values);

    return values
      .filter(([prefix]) => prefix !== this.prefixes.ignore)
      .map(([prefix, value]) => (prefix !== '' ? `${prefix}(${value})` : value));
  }

  public diffArray(origin: string[], defaults: string[]) {
    const left = origin.map(v => this.calcPrefix(v));
    const right = defaults.map(v => this.calcPrefix(v));
    let values: [string, string][] = [];

    values = left.reduceRight((prev, [p, v]) => {
      return right.some(([, v2]) => v === v2) ? prev : [...prev, [p, v]];
    }, values);

    values = right.reduceRight((prev, [, v]) => {
      return left.some(([, v2]) => v === v2) ? prev : [...prev, [this.prefixes.ignore, v]];
    }, values);

    return values.map(([prefix, value]) => (prefix !== '' ? `${prefix}(${value})` : value));
  }

  public parseParam(
    key: keyof T,
    value: boolean | number | string | string[],
    base: boolean | number | string | string[] = null
  ) {
    if (value === null || value === undefined || !(key in this.format)) return base;

    switch (this.format[key]) {
      case 'string[]':
        return Array.isArray(value) ? value.map(v => String(v)).toSorted() : String(value);
      case 'boolean':
        return value === 'true' ? true : value === 'false' ? false : base;
      case 'number':
        return Number(value);
      case 'string':
        return String(value);
      default:
        return base;
    }
  }

  public parseObj(input: T): T {
    return null;
  }

  public parseParams(input: SearchInput): URLSearchParams {
    const next = new URLSearchParams();
    new URLSearchParams(input).forEach((value, key) => {
      if (key in this.format) next.append(key, value);
    });
    return next;
  }

  public convertParams(input: URLSearchParams): T {
    return Object.entries(this.format).reduce((current, [k, t]) => {
      const value = t === 'string[]' ? input.getAll(k) : input.has(k) ? input.get(k) : null;

      if (value === null || value === undefined) return current;

      switch (t) {
        case 'string[]':
          return { ...current, [k]: Array.from(value).toSorted() };
        case 'boolean':
          return value === 'true'
            ? { ...current, [k]: true }
            : value === 'false'
            ? { ...current, [k]: false }
            : current;
        case 'number':
          return { ...current, [k]: Number(value) };
        case 'string':
          return { ...current, [k]: String(value) };
        default:
          return current;
      }
    }, {}) as T;
  }

  public convertObj(input: T): URLSearchParams {
    const entries: string[][] = [];

    Object.entries(this.format).forEach(([k, t]) => {
      const value = k in input ? input[k] : null;

      if (value === null || value === undefined) return;

      if (Array.isArray(value)) value.forEach(v => entries.push([k, String(v)]));
      else entries.push([k, String(value)]);
    });

    const search = new URLSearchParams(entries);
    search.sort();
    return search;
  }
}

export class SearchParams<T extends Params> {
  private search: URLSearchParams = new URLSearchParams();

  private format: SearchFormat<T> = null;

  private formatter: SearchFormatter<T> = new SearchFormatter<T>();

  constructor(init: SearchInput = null, format: SearchFormat<T> = null) {
    this.search = new URLSearchParams(init);
    this.format = format;
    this.formatter = new SearchFormatter<T>(format);
  }

  /**
   * Modify the elements in the search parameters that meet the condition specified in a callback function.
   * @param predicate — A function that accepts up to two arguments. The filter method calls the predicate function one time for each element in the search parameters.
   */
  public toFiltered(predicate: (key: keyof T, value: boolean | number | string | string[]) => boolean) {
    const next = new URLSearchParams();

    this.search.forEach((value, key) => {
      if (predicate(key, this.formatter.parseParam(key, value))) next.append(key, value);
    });

    return new SearchParams<T>(next, this.format);
  }

  public toCopy(predicate: (value: T) => T) {
    const entries = this.formatter.convertObj(predicate(this.formatter.convertParams(this.search)));
    return new SearchParams<T>(entries, this.format);
  }

  public get(key: keyof T) {
    const t = this.formatter.get(key);
    return this.formatter.parseParam(
      key,
      t === 'string[]' ? this.search.getAll(key as string) : this.search.get(key as string)
    );
  }

  /**
   * returns the search parameters as a sorted string
   */
  public toString() {
    this.search.sort();
    return this.search.toString();
  }

  /**
   * returns the search parameters as a URLSearchParams class
   */
  public toParams() {
    this.search.sort();
    return this.search;
  }

  /**
   * returns the search parameters as a formatted object
   * @param defaults Define the default values to be returned in the case of nullish values
   */
  public toObject() {
    this.search.sort();
    return this.formatter.convertParams(this.search);
  }

  public toSplitParams(predicate: (key: string, value: unknown) => boolean) {
    const first = new URLSearchParams();
    const second = new URLSearchParams();

    this.search.forEach((value, key) => {
      const res = predicate(key, this.formatter.parseParam(key, value));
      if (res === true) first.append(key, value);
      else if (res === false) second.append(key, value);
    });

    return [first, second];
  }
}

export class SearchParser<T extends Params> {
  private defaults: URLSearchParams = new URLSearchParams();

  private format: SearchFormat<T> = null;

  private formatter: SearchFormatter<T> = new SearchFormatter<T>();

  private enforced: (keyof T)[] = [];

  constructor(format: SearchFormat<T> = null, options?: Options<T>) {
    const { enforced = [], prefixes } = options;

    this.format = format;
    this.formatter = new SearchFormatter<T>(format, prefixes);
    this.enforced = enforced;
  }

  public setDefaultParams(value: SearchInput) {
    this.defaults = this.formatter.parseParams(value);
    return this;
  }

  public setDefaultObject(value: T) {
    this.defaults = this.formatter.convertObj(value);
    return this;
  }

  public fromParams(input: SearchInput) {
    const search = new URLSearchParams(input);

    const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
      if (t === 'string[]') {
        let next = this.enforced.includes(k) ? [] : search.getAll(k);
        next = this.formatter.mergeArray(this.defaults.getAll(k), next);
        return [...current, ...next.map(v => [k, v])];
      } else {
        if (!this.enforced.includes(k) && search.has(k)) return [...current, [k, search.get(k)]];
        else if (this.defaults.has(k)) return [...current, [k, this.defaults.get(k)]];
      }
      return current;
    }, []);

    return new SearchParams<T>(entries, this.format);
  }

  public fromObject(input: T) {
    const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
      if (t === 'string[]') {
        let next = this.enforced.includes(k) ? [] : Array.isArray(input?.[k]) ? (input[k] as string[]) : [];
        next = this.formatter.mergeArray(this.defaults.getAll(k), next);
        return [...current, ...next.map(v => [k, v])];
      } else {
        if (!this.enforced.includes(k) && k in input) return [...current, [k, String(input[k])]];
        else if (this.defaults.has(k)) return [...current, [k, this.defaults.get(k)]];
      }
      return current;
    }, []);

    return new SearchParams<T>(entries, this.format);
  }

  public fromDeltaParams(input: SearchInput) {
    const search = new URLSearchParams(input);

    const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
      if (this.enforced.includes(k)) {
        return current;
      } else if (t === 'string[]') {
        const next = this.formatter.diffArray(search.getAll(k), this.defaults.getAll(k));
        return [...current, ...next.map(v => [k, v])];
      } else {
        if (search.has(k) && search.get(k) !== this.defaults.get(k)) return [...current, [k, search.get(k)]];
      }
      return current;
    }, []);

    return new SearchParams<T>(entries, this.format);
  }

  public mergeParams(
    first: SearchInput,
    second: SearchInput,
    predicate: (key: keyof T, values?: [unknown, unknown]) => boolean
  ) {
    const left = new URLSearchParams(first);
    const right = new URLSearchParams(second);

    const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
      if (t === 'string[]') {
        const res = predicate(k, [left.getAll(k), right.getAll(k)]);
        let next: string[] = [];
        next = res === true ? this.formatter.mergeArray(left.getAll(k), next) : next;
        next = res === false ? this.formatter.mergeArray(right.getAll(k), next) : next;
        next = this.formatter.mergeArray(this.defaults.getAll(k), next);
        return [...current, ...next.map(v => [k, v])];
      } else {
        const enf = this.enforced.includes(k);
        const res = predicate(k, [
          this.formatter.parseParam(k, left.get(k)),
          this.formatter.parseParam(k, right.get(k))
        ]);

        if (!enf && res === true && left.has(k)) return [...current, [k, left.get(k)]];
        else if (!enf && res === false && right.has(k)) return [...current, [k, right.get(k)]];
        else if (this.defaults.has(k)) return [...current, [k, this.defaults.get(k)]];
        else return current;
      }
    }, []);

    return new SearchParams<T>(entries, this.format);
  }
}
