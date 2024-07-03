type Params = Record<string, boolean | number | string | string[]>;

type SearchInput = string | string[][] | Record<string, string> | URLSearchParams;

type Input<T extends Params> = string | URLSearchParams | string[][] | T;

type ChangeOptions<T extends Params> = {
  keys?: (keyof T)[];
  strip?: [keyof T, string?][];
  transforms?: ((value: T) => T)[];
};

type Options<T extends Params> = {
  enforced?: (keyof T)[];
  prefixes?: {
    not?: string;
    ignore?: string;
  };
};

export type SearchParamsFormat<T extends Params> = {
  [P in keyof T]: T[P] extends Array<string>
    ? 'string[]'
    : T[P] extends number
    ? 'number'
    : T[P] extends boolean
    ? 'boolean'
    : 'string';
};

type Types<T extends Params> = {
  init: string | URLSearchParams | Record<string, string> | string[][];

  format: SearchParamsFormat<T>;

  options: {
    prefixes?: {
      not?: string;
      ignore?: string;
    };
    enforced?: (keyof T)[];
  };

  predicate: (key: keyof T, value: boolean | number | string) => boolean;

  // parseParams: (input: SearchInput, options?: ChangeOptions<T>) => URLSearchParams;
  // convertParams: (input: T, options?: ChangeOptions<T>) => URLSearchParams;

  // formatParams: (input: SearchInput, options?: ChangeOptions<T>) => URLSearchParams;
  // formatObject: (input: T, options?: ChangeOptions<T>) => T;

  // toParams: (input: Input<T>, options?: ChangeOptions<T>) => URLSearchParams;
  // toObject: (input: Input<T>, options?: ChangeOptions<T>) => T;

  fromParams: (init?: Types<T>['init']) => SearchParams<T>;
};

class SearchParams<T extends Params> {
  private search: URLSearchParams = new URLSearchParams();

  private format: Types<T>['format'] = null;

  constructor(init: Types<T>['init'] = null, format: Types<T>['format'] = null) {
    this.search = new URLSearchParams(init);
    this.format = format;
  }

  private convert(key: string, value: boolean | number | string, base: boolean | number | string = null) {
    if (!value || !(key in this.format)) return base;

    switch (this.format[key]) {
      case 'string[]':
        return String(value);
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

  /**
   * Modify the elements in the search parameters that meet the condition specified in a callback function.
   * @param predicate — A function that accepts up to two arguments. The filter method calls the predicate function one time for each element in the search parameters.
   */
  public filter(predicate: Types<T>['predicate']) {
    const next = new URLSearchParams();

    this.search.forEach((value, key) => {
      if (predicate(key, this.convert(key, value))) next.append(key, value);
    });

    this.search = next;
    return this;
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
  public toObject(defaults: Partial<T> = {}) {
    return Object.entries(this.format).reduce((current, [k, t]) => {
      const value = this.search.has(k) ? this.search.get(k) : null;

      if (!value && k in defaults) {
        return { ...current, [k]: defaults[k] };
      }

      switch (t) {
        case 'string[]':
          return { ...current, [k]: Array.from(this.search.getAll(k)).toSorted() };
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
}

export default class SearchParamsParser<T extends Params> {
  private format: SearchParamsFormat<T> = null;

  private enforced: (keyof T)[] = [];

  private prefixes: { not: string; ignore: string } = { not: 'NOT', ignore: '!' };

  constructor(format: SearchParamsFormat<T>, options?: Options<T>) {
    const { enforced = [], prefixes } = options;
    const { not = 'NOT', ignore = '!' } = prefixes;

    this.format = format;
    this.enforced = enforced;
    this.prefixes = { not, ignore };
  }

  private parseMultipleParams(values: string[], initialValue: string[]) {
    return values.reduceRight((p, v) => {
      if ([undefined, null, ''].includes(v) || (v.startsWith(`${this.prefixes.ignore}(`) && v.endsWith(')'))) return p;
      let value = v;
      if (v.startsWith(`${this.prefixes.not}(`) && v.endsWith(')'))
        value = v.substring(this.prefixes.not.length + 1, v.length - 1);
      return p.some(([, v2]) => value === v2) ? p : [...p, v];
    }, initialValue);
  }

  public fromParams(params: SearchInput, defaults: SearchInput) {
    const search = new URLSearchParams(params);
    const base = new URLSearchParams(defaults);

    const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {
      if (t === 'string[]') {
        let next = this.enforced.includes(k) ? [] : this.parseMultipleParams(search.getAll(k), []);
        next = this.parseMultipleParams(base.getAll(k), next);
        return [...current, ...next.map(v => [k, v])];
      } else {
        if (!this.enforced.includes(k) && search.has(k)) return [...current, [k, base.get(k)]];
        else if (search.has(k)) return [...current, [k, search.get(k)]];
      }
      return current;
    }, []);

    const values = new URLSearchParams(entries);
    return new SearchParams(values, this.format);
  }

  /**
   * TODO
   * @param params
   * @param defaults
   * @returns
   */
  // public fromObject(params: T, defaults: T) {
  //   const entries = Object.entries(this.format).reduce((current: string[][], [k, t]) => {

  //     if (t === 'string[]') {
  //       let next = this.enforced.includes(k) ? [] : this.parseMultipleParams(search.getAll(k), []);
  //       next = this.parseMultipleParams(base.getAll(k), next);
  //       return [...current, ...next.map(v => [k, v])];
  //     } else {
  //       if (!this.enforced.includes(k) && search.has(k)) return [...current, [k, base.get(k)]];
  //       else if (search.has(k)) return [...current, [k, search.get(k)]];
  //     }
  //     return current;
  //   }, []);

  //   const values = new URLSearchParams(entries);
  //   return new SearchParams(values, this.format);
  // }

  // private parseBoolean = (value: unknown): boolean => (value === 'true' ? true : value === 'false' ? false : null);

  // private parseArray = (
  //   values: string[],
  //   strip: [keyof T, string?][] = [],
  //   key: string = '',
  //   initialValue: string[] = []
  // ): string[] => {
  //   if (!Array.isArray(values)) return null;
  //   else
  //     return values.reduceRight((previous, value) => {
  //       if ([undefined, null, ''].includes(value) || (value.startsWith(`${this.ignore}(`) && value.endsWith(')')))
  //         return previous;

  //       const inner =
  //         value.startsWith(`${this.not}(`) && value.endsWith(')')
  //           ? value.substring(this.not.length + 1, value.length - 1)
  //           : value;

  //       const ignore = strip.some(([k, v = null]) => (value === k && v ? String(value).startsWith(v) : true));

  //       return previous.some(filter => inner === filter) ? previous : [...previous, value];
  //     }, initialValue);
  // };

  // private isParams = (input: Input<T>) =>
  //   typeof input === 'string' || Array.isArray(input) || input instanceof URLSearchParams;

  // private isObject = (input: Input<T>) => typeof input === 'object';

  // private formatObject: SearchObjectReturns<T>['formatObject'] = (
  //   input,
  //   options = { keys: null, strip: [], transforms: [] }
  // ) => {
  //   const { keys = null, strip = [], transforms = [] } = options;
  //   let obj = Object.assign({}, input) as T;

  //   transforms.forEach(transform => {
  //     obj = transform(obj);
  //   });

  //   Object.entries(this.format).reduce((current, [param, type]) => {
  //     const value = obj?.[param];
  //     const ignore = Array.isArray(value)
  //       ? false
  //       : strip.some(([k, v = null]) => (param === k && v ? String(value).startsWith(v) : true));

  //     if ((keys && !keys.includes(param)) || ignore || [undefined, null].includes(value)) return current;

  //     switch (type) {
  //       case 'string[]':
  //         return { ...current, [param]: this.parseArray(current, strip) };
  //       case 'boolean':
  //         return value === true || value === false
  //           ? { ...current, [param]: value }
  //           : value === 'true'
  //           ? { ...current, [param]: true }
  //           : value === 'false'
  //           ? { ...current, [param]: false }
  //           : current;
  //       case 'number':
  //         return { ...current, [param]: Number(value) };
  //       case 'string':
  //         return { ...current, [param]: String(value) };

  //       default:
  //         return current;
  //     }

  // else if(t === 'string[]' ) {

  // } else {

  //   if(strip.some(([k2, v2 = null]) => (k === k2 && v2 ? String(value).startsWith(v2) : true)))

  // }

  // if (
  //   (keys && !keys.includes(k)) ||
  //   strip.some(([k2, v2 = null]) => (k === k2 && v2 ? String(value).startsWith(v2) : true)) ||
  //   [undefined, null].includes(value)
  // )
  //   return current;
  // else if (t === 'string[]') return { ...current, [k]: this.parseArray(value) };
  // else if (t === 'boolean') return { ...current, [k]: this.parseBoolean(value) };
  // else if (t === 'number') return { ...current, [k]: Number(value) };
  // else if (t === 'string') return { ...current, [k]: String(value) };
  // else return current;
  //   }, {}) as T;

  //   return input;
  // };

  // public toObject: SearchObjectReturns<T>['toObject'] = (
  //   input,
  //   options = { keys: null, strip: [], transforms: [] }
  // ) => {
  //   const { keys = null, strip = [], transforms = [] } = options;
  //   const q = this.isParams(input)
  //     ? new URLSearchParams(input as string)
  //     : this.isObject(input)
  //     ? this.fromObjectToParams(input as T)
  //     : null;

  //   return q as T;
  // };

  // public toObject: SearchObjectReturns<T>['toObject'] = (
  //   input,
  //   options = { keys: null, strip: [], transforms: [] }
  // ) => {
  //   const { keys = null, strip = [], transforms = [] } = options;
  //   const q = new URLSearchParams(input);

  //   let obj = Object.entries(this.format).reduce((current, [k, t]) => {
  //     const value = q.has(k) && q.get(k);

  //     if (
  //       (keys && !keys.includes(k)) ||
  //       strip.some(([k2, v2 = null]) => (k === k2 && v2 ? `${value}`.startsWith(v2) : true)) ||
  //       [undefined, null].includes(value)
  //     )
  //       return current;
  //     else if (t === 'string[]') return { ...current, [k]: Array.from(q.getAll(k).toSorted()) };
  //     else if (t === 'boolean') return { ...current, [k]: value === 'true' ? true : value === 'false' ? false : null };
  //     else if (t === 'number') return { ...current, [k]: Number(value) };
  //     else if (t === 'string') return { ...current, [k]: String(value) };
  //     else return current;
  //   }, {}) as T;

  //   transforms.forEach(transform => {
  //     obj = transform(obj);
  //   });

  //   return obj;
  // };

  // public toParams: SearchObjectReturns<T>['toParams'] = (
  //   input,
  //   options = { keys: null, strip: [], transforms: [] }
  // ) => {
  //   const { keys = null, strip = [], transforms = [] } = options;
  //   let q = Object.assign({}, input) as T;

  //   transforms.forEach(transform => {
  //     q = transform(q);
  //   });

  //   const value = new URLSearchParams();

  //   Object.entries(q).forEach(([k, v]) => {
  //     if ((!keys || keys.includes(k)) && k in this.format) {
  //       if (Array.isArray(v)) {
  //         v.forEach(f => {
  //           if (!strip.some(([k2, v2 = null]) => (k === k2 && v2 ? String(f).startsWith(v2) : true))) {
  //             value.append(k, String(f));
  //           }
  //         });
  //       } else if (!strip.some(([k2, v2 = null]) => (k === k2 && v2 ? String(v).startsWith(v2) : true))) {
  //         value.append(k, String(v));
  //       }
  //     }
  //   });

  //   return value;
  // };
}
