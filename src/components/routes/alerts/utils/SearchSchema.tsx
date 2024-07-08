export type SearchInput = string | string[][] | Record<string, string> | URLSearchParams;

export type Types = boolean | number | string | string[];

export type Params = { [param: string]: Types };

export type Infer<T extends Params> = {
  -readonly [K in keyof T]: T[K] extends boolean
    ? boolean
    : T[K] extends number
    ? number
    : T[K] extends string
    ? string
    : T[K] extends Array<string>
    ? string[]
    : unknown;
};

/**
 * Base Parameter
 */
export class BaseParam<T extends Params> {
  protected key: string = '';

  protected defaults: Types = null;

  protected enforced: boolean = false;

  constructor(key: string, defaults: Types = null, enforced: boolean = false) {
    this.key = key;
    this.defaults = this.is(defaults) ? defaults : this.defaults;
    this.enforced = enforced;
  }

  public static is(value: Types): boolean {
    return value !== null && value !== undefined && value !== 'null' && value !== 'undefined';
  }

  protected is(value: Types): boolean {
    return BaseParam.is(value);
  }

  protected valid(value: Types): boolean {
    return BaseParam.is(value);
  }

  public parse(value: string | string[]): Types {
    return value;
  }

  public fromParams(prev: URLSearchParams, base: URLSearchParams): void {
    const value = base.get(this.key);
    if (!this.enforced && this.valid(value)) prev.set(this.key, value);
    else if (this.is(this.defaults)) prev.set(this.key, String(this.defaults));
  }

  public fromObject(prev: URLSearchParams, base: T): void {
    const value = base?.[this.key];
    if (!this.enforced && this.is(value)) prev.set(this.key, String(value));
    else if (this.is(this.defaults)) prev.set(this.key, String(this.defaults));
  }

  public fromDeltaParams(prev: URLSearchParams, base: URLSearchParams): void {
    const value = base.get(this.key);
    if (!this.enforced && this.valid(value) && value !== String(this.defaults)) prev.set(this.key, value);
  }

  public fromDeltaObject(prev: URLSearchParams, base: T): void {
    const value = base?.[this.key];
    if (!this.enforced && this.is(value) && value !== this.defaults) prev.set(this.key, String(value));
  }

  public fromMergeParams(
    prev: URLSearchParams,
    left: URLSearchParams,
    right: URLSearchParams,
    predicate: <K extends keyof T>(key: K, values?: [Types, Types]) => boolean
  ): void {
    const value1 = left.get(this.key);
    const value2 = right.get(this.key);
    const res = predicate(this.key, [this.parse(value1), this.parse(value2)]);

    if (!this.enforced && res === true && this.valid(value1)) prev.set(this.key, value1);
    else if (!this.enforced && res === false && this.valid(value2)) prev.set(this.key, value2);
    else if (this.is(this.defaults)) prev.set(this.key, String(this.defaults));
  }

  public toObject(prev: T, current: URLSearchParams): T {
    const value = current.get(this.key);
    return this.valid(value) ? { ...prev, [this.key]: this.parse(value) } : prev;
  }

  // OTHER

  // public coerce(value: Types, defaults: Types = null): Types {
  //   return this.valid(value) ? value : this.valid(defaults) ? defaults : this.defaults;
  // }

  // public join(current: URLSearchParams, data: Types) {
  //   const value = String(!this.enforced && this.valid(data) ? data : this.defaults);
  //   current.set(this.key, value);
  // }

  // public delta(current: URLSearchParams, data: Types) {
  //   if (!this.enforced && this.valid(data) && data !== String(this.defaults)) {
  //     current.set(this.key, String(data));
  //   }
  // }

  // public object(prev: T, current: URLSearchParams): T {
  //   const value = current.get(this.key);
  //   return this.valid(value) ? { ...prev, [this.key]: this.coerce(value) } : prev;
  // }
}

/**
 * Boolean Parameter
 */
export class BooleanParam<T extends Params> extends BaseParam<T> {
  // protected override defaults: boolean = null;

  public static override is(value: Types): value is boolean {
    return typeof value === 'boolean';
  }

  protected override is(value: Types): boolean {
    return BooleanParam.is(value);
  }

  protected override valid(value: Types): boolean {
    return super.valid(value) && (value === 'true' || value === 'false');
  }

  public override parse(value: string | string[]) {
    return this.valid(value) ? Boolean(value) : value;
  }

  // protected override valid2(value: Types): boolean {
  //   return super.valid(value) && (BooleanParam.check(value) || value === 'true' || value === 'false');
  // }

  // public override coerce(value: Types, defaults: Types = null): boolean {
  //   return this.valid(value) ? Boolean(value) : this.valid(defaults) ? Boolean(defaults) : this.defaults;
  // }
}

/**
 * Number Parameter
 */
export class NumberParam<T extends Params> extends BaseParam<T> {
  // protected override defaults: number = null;

  public static override is(value: Types): boolean {
    return typeof value === 'number';
  }

  protected override is(value: Types): boolean {
    return NumberParam.is(value);
  }

  protected override valid(value: Types): boolean {
    return super.valid(value) && !isNaN(Number(value));
  }

  public override parse(value: Types) {
    return this.valid(value) ? Number(value) : value;
  }

  // public static override check(value: Types): boolean {
  //   return typeof value === 'number';
  // }

  // protected override valid(value: Types): boolean {
  //   return super.valid(value) && (NumberParam.check(value) || !isNaN(Number(value)));
  // }

  // public override coerce(value: Types, defaults: Types = null): number {
  //   return this.valid(value) ? Number(value) : this.valid(defaults) ? Number(defaults) : this.defaults;
  // }
}

/**
 * String Parameter
 */
export class StringParam<T extends Params> extends BaseParam<T> {
  // protected override defaults: string = null;

  public static override is(value: Types): boolean {
    return typeof value === 'string';
  }

  protected override is(value: Types): boolean {
    return StringParam.is(value);
  }

  protected override valid(value: Types): boolean {
    return super.valid(value) && typeof value === 'string';
  }

  public override parse(value: Types) {
    return this.valid(value) ? String(value) : value;
  }

  // public static override check(value: Types): boolean {
  //   return typeof value === 'string';
  // }

  // protected override valid(value: Types): boolean {
  //   return super.valid(value) && StringParam.check(value);
  // }

  // public override coerce(value: Types, defaults: Types = null): string {
  //   return this.valid(value) ? String(value) : this.valid(defaults) ? String(defaults) : this.defaults;
  // }
}

/**
 * Array Parameter
 */
export class ArrayParam<T extends Params> extends BaseParam<T> {
  // protected override defaults: string[] = [];

  private not = 'NOT';

  private ignore = '!';

  constructor(
    key: string,
    defaultValue: Types,
    enforced: boolean = false,
    prefixes: { not?: string; ignore?: string } = { not: 'NOT', ignore: '!' }
  ) {
    super(key, defaultValue, enforced);
    const { not = 'NOT', ignore = '!' } = prefixes;
    this.not = not;
    this.ignore = ignore;
  }

  public static override is(value): value is string[] {
    return Array.isArray(value);
  }

  protected override is(value: Types): value is string[] {
    return ArrayParam.is(value);
  }

  protected override valid(value: Types): boolean {
    return super.valid(value) && this.is(value);
  }

  public override parse(value: Types) {
    return this.valid(value) ? value : super.valid(value) ? String(value) : value;
  }

  // public static override check(value): boolean {
  //   return Array.isArray(value);
  // }

  private toPrefix(value: string, current: string[] = []): string[] {
    if (value.startsWith(`${this.ignore}(`) && value.endsWith(')')) {
      return this.toPrefix(value.substring(this.ignore.length + 1, value.length - 1), [...current, this.ignore]);
    } else if (value.startsWith(`${this.not}(`) && value.endsWith(')')) {
      return this.toPrefix(value.substring(this.not.length + 1, value.length - 1), [...current, this.not]);
    } else {
      return [...current, value];
    }
  }

  private fromPrefix(value: string[]): string {
    return value.slice(0, -1).reduceRight((prev, current) => `${current}(${prev})`, value.at(-1));
  }

  private uniques(values: string[]): string[][] {
    return values
      .reduceRight((prev, cur) => {
        const v = this.toPrefix(cur);
        return prev.some(p => v.at(-1) === p.at(-1)) ? prev : [...prev, v];
      }, [] as string[][])
      .toSorted((a, b) => a.at(-1).localeCompare(b.at(-1)));
  }

  private join(prev: URLSearchParams, data: Types): void {
    const values =
      !this.enforced && this.is(data) ? [...(this.defaults as string[]), ...data] : (this.defaults as string[]);
    this.uniques(values)
      .filter(value => !value.some(v => v === this.ignore))
      .map(value => this.fromPrefix(value))
      .forEach(v => {
        prev.append(this.key, v);
      });
  }

  private delta(prev: URLSearchParams, data: Types): void {
    if (this.enforced || !this.valid(data)) return;

    const left = this.uniques(data as string[]);
    const right = this.uniques(this.defaults as string[]);
    let values: string[][] = [];

    values = left.reduceRight((p, l) => {
      return right.some(r => l.at(-1) === r.at(-1)) ? p : [...p, l];
    }, values);

    values = right.reduceRight((p, r) => {
      return left.some(l => l.at(-1) === r.at(-1)) ? p : [...p, [this.ignore, ...r]];
    }, values);

    return values
      .map(value => this.fromPrefix(value))
      .forEach(v => {
        prev.append(this.key, v);
      });
  }

  public override fromParams(prev: URLSearchParams, base: URLSearchParams): void {
    this.join(prev, base.getAll(this.key));
  }

  public override fromObject(prev: URLSearchParams, base: T): void {
    this.join(prev, base?.[this.key]);
  }

  public fromDeltaParams(prev: URLSearchParams, base: URLSearchParams): void {
    this.delta(prev, base.getAll(this.key));
  }

  public fromDeltaObject(prev: URLSearchParams, base: T): void {
    this.delta(prev, base?.[this.key]);
  }

  public fromMergeParams(
    prev: URLSearchParams,
    left: URLSearchParams,
    right: URLSearchParams,
    predicate: <K extends keyof T>(key: K, values?: [Types, Types]) => boolean
  ): void {
    const value1 = left.getAll(this.key);
    const value2 = right.getAll(this.key);
    const res = predicate(this.key, [this.parse(value1), this.parse(value2)]);
    this.join(prev, res === true ? value1 : res === false ? value2 : []);
  }

  public toObject(prev: T, current: URLSearchParams): T {
    const value = current.getAll(this.key);
    return this.valid(value) ? { ...prev, [this.key]: value } : prev;
  }

  /**
   * TODO
   */

  // public override coerce(values: string[], defaults: string[] = null): string[] {
  //   return this.uniques(this.valid(values) ? values : this.valid(defaults) ? defaults : this.defaults)
  //     .filter(value => !value.some(v => v === this.ignore))
  //     .map(value => this.fromPrefix(value));
  // }

  // public override join(current: URLSearchParams, data: Types) {
  //   const values = !this.enforced && this.valid(data) ? [...this.defaults, ...(data as string[])] : this.defaults;
  //   this.uniques(values)
  //     .filter(value => !value.some(v => v === this.ignore))
  //     .map(value => this.fromPrefix(value))
  //     .forEach(v => {
  //       current.set(this.key, v);
  //     });
  // }

  // public override delta(current: URLSearchParams, data: Types) {
  //   if (this.enforced || !this.valid(data)) return;

  //   const left = this.uniques(data as string[]);
  //   const right = this.uniques(this.defaults);
  //   let values: string[][] = [];

  //   values = left.reduceRight((prev, l) => {
  //     return right.some(r => l.at(-1) === r.at(-1)) ? prev : [...prev, l];
  //   }, values);

  //   values = right.reduceRight((prev, r) => {
  //     return left.some(l => l.at(-1) === r.at(-1)) ? prev : [...prev, [this.ignore, ...r]];
  //   }, values);

  //   return values
  //     .map(value => this.fromPrefix(value))
  //     .forEach(v => {
  //       current.append(this.key, v);
  //     });
  // }

  // public override object(prev: T, current: URLSearchParams) {
  //   const value = current.getAll(this.key);
  //   return this.valid(value) ? { ...prev, [this.key]: this.coerce(value) } : prev;
  // }
}
