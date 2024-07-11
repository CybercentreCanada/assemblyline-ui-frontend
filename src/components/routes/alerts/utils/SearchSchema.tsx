export type SearchInput = string | string[][] | Record<string, string> | URLSearchParams;

export type Types = boolean | number | string | string[];

export type Params = { [param: string]: Types };

export type SearchParams<T extends Params> = {
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

  protected defaults: string | string[] = '';

  protected enforced: boolean = false;

  constructor(key: string, defaults: Types = '', enforced: boolean = false) {
    this.key = key;
    this.defaults = this.valid(String(defaults)) ? String(defaults) : this.defaults;
    this.enforced = enforced;
  }

  public static is(value: unknown): value is Types {
    return value !== null && value !== undefined && value !== 'null' && value !== 'undefined';
  }

  protected valid(value: unknown): value is string {
    return typeof value === 'string';
  }

  protected at(search: T | URLSearchParams): string | string[] {
    if (search instanceof URLSearchParams) return search.get(this.key);
    else if (typeof search === 'object' && this.key in search) return String(search?.[this.key]);
    else return null;
  }

  public parse(value: string | string[]): Types {
    return value;
  }

  public get(search: T | URLSearchParams): Types {
    return this.parse(this.at(search));
  }

  public from(prev: URLSearchParams, search: T | URLSearchParams): void {
    const value = this.at(search);
    if (!this.enforced && this.valid(value)) prev.set(this.key, value);
    else if (this.valid(this.defaults)) prev.set(this.key, this.defaults);
  }

  public delta(prev: URLSearchParams, search: T | URLSearchParams): void {
    const value = this.at(search);
    if (!this.enforced && this.valid(value) && value !== this.defaults) prev.set(this.key, value);
  }

  public merge(
    prev: URLSearchParams,
    left: T | URLSearchParams,
    right: T | URLSearchParams,
    predicate: <K extends keyof T>(key: K, values?: [Types, Types]) => boolean
  ): void {
    const value1 = this.at(left);
    const value2 = this.at(right);
    const res = predicate(this.key, [this.parse(value1), this.parse(value2)]);

    if (!this.enforced && res === true && this.valid(value1)) prev.set(this.key, value1);
    else if (!this.enforced && res === false && this.valid(value2)) prev.set(this.key, value2);
    else if (this.valid(this.defaults)) prev.set(this.key, this.defaults);
  }

  public object(prev: T, search: T | URLSearchParams): T {
    const value = this.at(search);
    return this.valid(value) ? { ...prev, [this.key]: this.parse(value) } : prev;
  }
}

/**
 * Boolean Parameter
 */
export class BooleanParam<T extends Params> extends BaseParam<T> {
  public static override is(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  protected override valid(value: unknown): value is string {
    return super.valid(value) && (value === 'true' || value === 'false');
  }

  public override parse(value: string): boolean {
    return this.valid(value) ? Boolean(value) : value;
  }
}

/**
 * Number Parameter
 */
export class NumberParam<T extends Params> extends BaseParam<T> {
  public static override is(value: unknown): value is number {
    return typeof value === 'number';
  }

  protected override valid(value: Types): value is string {
    return super.valid(value) && !isNaN(Number(value));
  }

  public override parse(value: string): number {
    return this.valid(value) ? Number(value) : value;
  }
}

/**
 * String Parameter
 */
export class StringParam<T extends Params> extends BaseParam<T> {
  public static override is(value: unknown): value is string {
    return typeof value === 'string';
  }

  protected override valid(value: Types): value is string {
    return super.valid(value);
  }

  public override parse(value: string): string {
    return this.valid(value) ? String(value) : value;
  }
}

/**
 * Array Parameter
 */
export class ArrayParam<T extends Params> extends BaseParam<T> {
  protected override defaults: string[] = [];

  private not = 'NOT';

  private ignore = '!';

  constructor(
    key: string,
    defaultValue: Types,
    enforced: boolean = false,
    prefixes?: { not?: string; ignore?: string }
  ) {
    super(key);
    this.key = key;
    this.enforced = enforced;
    this.not = prefixes?.not || 'NOT';
    this.ignore = prefixes?.ignore || '!';

    this.defaults = !this.validArray(defaultValue) ? this.defaults : defaultValue;
  }

  public static override is(value: unknown): value is string[] {
    return Array.isArray(value);
  }

  private validArray(value: unknown): value is string[] {
    return ArrayParam.is(value);
  }

  protected override at(search: T | URLSearchParams): string[] {
    if (search instanceof URLSearchParams) return search.getAll(this.key);
    else if (typeof search === 'object' && Array.isArray(search?.[this.key])) return search?.[this.key] as string[];
    else return null;
  }

  public override parse(value: string | string[]): string | string[] {
    return this.validArray(value) ? value : super.valid(String(value)) ? String(value) : value;
  }

  public get(search: T | URLSearchParams): Types {
    return this.parse(this.at(search));
  }

  private toPrefix(value: string, prev: string[] = []): string[] {
    if (value.startsWith(`${this.ignore}(`) && value.endsWith(')')) {
      return this.toPrefix(value.substring(this.ignore.length + 1, value.length - 1), [...prev, this.ignore]);
    } else if (value.startsWith(`${this.not}(`) && value.endsWith(')')) {
      return this.toPrefix(value.substring(this.not.length + 1, value.length - 1), [...prev, this.not]);
    } else {
      return [...prev, value];
    }
  }

  private fromPrefix(value: string[]): string {
    return value.slice(0, -1).reduceRight((prev, current) => `${current}(${prev})`, value.at(-1));
  }

  private clean(values: string[]): string[][] {
    return values
      .map(v => this.toPrefix(v))
      .reduceRight((prev, cur) => (prev.some(p => cur.at(-1) === p.at(-1)) ? prev : [...prev, cur]), [] as string[][])
      .filter(value => !value.some(v => v === this.ignore))
      .toSorted((a, b) => a.at(-1).localeCompare(b.at(-1)));
  }

  private append(prev: URLSearchParams, values: string[][]): void {
    values
      .map(value => this.fromPrefix(value))
      .forEach(v => {
        prev.append(this.key, v);
      });
  }

  public override from(prev: URLSearchParams, search: T | URLSearchParams): void {
    const data = this.at(search);
    return this.append(prev, this.clean([...this.defaults, ...(!this.enforced && (data || []))]));
  }

  public override delta(prev: URLSearchParams, search: T | URLSearchParams): void {
    const data = this.at(search);
    if (this.enforced || !this.validArray(data)) return;

    const left = this.clean(data);
    const right = this.clean(this.defaults);
    let values: string[][] = [];

    values = left.reduceRight(
      (p, l) => (right.some(r => this.fromPrefix(l) === this.fromPrefix(r)) ? p : [...p, l]),
      values
    );

    values = right.reduceRight(
      (p, r) => (left.some(l => l.at(-1) === r.at(-1)) ? p : [...p, [this.ignore, ...r]]),
      values
    );

    this.append(prev, values);
  }

  public override merge(
    prev: URLSearchParams,
    left: T | URLSearchParams,
    right: T | URLSearchParams,
    predicate: <K extends keyof T>(key: K, values?: [Types, Types]) => boolean
  ): void {
    const value1 = this.at(left);
    const value2 = this.at(right);
    const res = predicate(this.key, [this.parse(value1), this.parse(value2)]);
    const data = res === true ? value1 : res === false ? value2 : [];
    this.append(prev, this.clean([...this.defaults, ...(!this.enforced && data)]));
  }

  public object(prev: T, search: T | URLSearchParams): T {
    const value = this.at(search);
    return this.validArray(value) ? { ...prev, [this.key]: value } : prev;
  }
}
