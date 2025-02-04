type ValueTypes = null | boolean | number | string | object | string[];

type ExtractEnumType<C> = C extends EnumParam<infer T> ? T[number] : never;

export type ParamTypes = BooleanParam | NumberParam | StringParam | FiltersParam | EnumParam<readonly string[]>;

export type ParamObject = Record<string, ParamTypes>;

export type Params = Record<string, ValueTypes>;

export type SearchParams<P extends ParamObject> = {
  [K in keyof P]: P[K] extends BooleanParam
    ? boolean
    : P[K] extends NumberParam
    ? number
    : P[K] extends StringParam
    ? string
    : P[K] extends FiltersParam
    ? string[]
    : P[K] extends EnumParam<readonly string[]>
    ? ExtractEnumType<P[K]>
    : unknown;
};

/**
 * Base Param
 */
export abstract class BaseParam<T extends ValueTypes> {
  protected _key: string = null;

  protected _default: T = null;

  protected _enforced: boolean = false;

  protected _hidden: boolean = false;

  protected _ignored: boolean = false;

  protected _nullable: boolean = false;

  constructor(key: string = null, param: BaseParam<T> = null) {
    this._key = key;
    if (!param) return;
    this._default = param._default;
    this._enforced = param._enforced;
    this._hidden = param._hidden;
    this._ignored = param._ignored;
    this._nullable = param._nullable;
  }

  public default(value: T) {
    this._default = value;
    return this;
  }

  public enforced(value: boolean = true) {
    this._enforced = value;
    return this;
  }

  public has(origin: T = null, value: unknown = undefined): boolean {
    return value === undefined ? true : origin === value;
  }

  public hidden(value: boolean = true) {
    this._hidden = value;
    return this;
  }

  public ignored(value: boolean = true) {
    this._ignored = value;
    return this;
  }

  public nullable(value: boolean = true) {
    this._nullable = value;
    return this;
  }

  protected getDefault() {
    return this._default;
  }

  protected isIgnored() {
    return this._ignored;
  }

  protected isHidden() {
    return this._hidden;
  }

  protected parse(value: unknown): T {
    return value === 'null' ? null : value === 'undefined' ? undefined : undefined;
  }

  protected valid(value: unknown): value is T {
    return this._nullable && value === null ? true : !!value;
  }

  protected get<P extends Params>(search: P | URLSearchParams): T {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.get(this._key));
      if (this.valid(value)) return value;
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return value;
    }
    return undefined;
  }

  protected from<P extends Params>(prev: P, search: P | URLSearchParams): P {
    const value = this.get(search);
    if (this.valid(value)) return { ...prev, [this._key]: value };
    else if (this.valid(this._default)) return { ...prev, [this._key]: this._default };
    else return prev;
  }

  protected full<P extends Params>(prev: P, search: P | URLSearchParams): P {
    const value = this.get(search);
    if (!this._enforced && this.valid(value)) return { ...prev, [this._key]: value };
    else if (this.valid(this._default)) return { ...prev, [this._key]: this._default };
    else return prev;
  }

  protected delta<P extends Params>(prev: P, search: P | URLSearchParams): P {
    const value = this.get(search);
    if (!this._enforced && this.valid(value) && value !== this._default) return { ...prev, [this._key]: value };
    else return prev;
  }

  protected merge<P extends Params>(
    prev: P,
    left: P | URLSearchParams,
    right: P | URLSearchParams,
    keys: (keyof P)[]
  ): P {
    const value1 = this.get(left);
    const value2 = this.get(right);

    if (!this._enforced && !keys.includes(this._key) && this.valid(value1)) return { ...prev, [this._key]: value1 };
    else if (!this._enforced && keys.includes(this._key) && this.valid(value2)) return { ...prev, [this._key]: value2 };
    else if (this.valid(this._default)) return { ...prev, [this._key]: this._default };
    return prev;
  }

  protected toParams<P extends Params>(prev: string[][], search: P): string[][] {
    return this._key in search && search?.[this._key] !== null && search?.[this._key] !== undefined
      ? [...prev, [this._key, String(search?.[this._key])]]
      : prev;
  }
}

/**
 * Boolean Param
 */
export class BooleanParam extends BaseParam<boolean> {
  protected override parse(value: unknown): boolean {
    return value === 'true' ? true : value === 'false' ? false : super.parse(value);
  }

  protected override valid(value: unknown): value is boolean {
    return typeof value === 'boolean' || super.valid(value);
  }
}

/**
 * Number Param
 */
export class NumberParam extends BaseParam<number> {
  private _min: null | number = null;

  private _max: null | number = null;

  constructor(key: string = null, param: NumberParam = null) {
    super(key, param);
    if (!param) return;
    this._min = param._min;
    this._max = param._max;
  }

  public min(value: number) {
    this._min = value;
    this._default = Math.max(this._default, this._min);
    return this;
  }

  public max(value: number) {
    this._max = value;
    this._default = Math.min(this._default, this._max);
    return this;
  }

  private clamp(value: number): number {
    let num = value;
    if (this._min !== null) num = Math.max(num, this._min);
    if (this._max !== null) num = Math.min(num, this._max);
    return num;
  }

  protected override get<P extends Params>(search: P | URLSearchParams): number {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.get(this._key));
      if (this.valid(value)) return this.clamp(value);
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return this.clamp(value);
    }
    return undefined;
  }

  protected override parse(value: unknown): number {
    return value !== null && !isNaN(Number(value)) ? Number(value) : super.parse(value);
  }

  protected override valid(value: unknown): value is number {
    return typeof value === 'number' || value === 0 || super.valid(value);
  }
}

/**
 * String Param
 */
export class StringParam extends BaseParam<string> {
  protected override parse(value: unknown): string {
    return typeof value === 'string' ? String(value) : super.parse(value);
  }

  protected override valid(value: unknown): value is string {
    return typeof value === 'string' || super.valid(value);
  }
}

/**
 * Enum Param
 */
export class EnumParam<O extends readonly string[]> extends BaseParam<O[number]> {
  private _options: O;

  constructor(key: string = null, param: EnumParam<O> = null) {
    super(key, param);
    if (!param) return;
    this._options = param._options;
  }

  public default(value: O[number]) {
    this._default = value;
    return this;
  }

  public options(value: O) {
    this._options = value;
    return this;
  }

  private check(value: unknown): value is O[number] {
    return Array.isArray(this._options) && this._options.some(v => v === value);
  }

  protected override parse(value: unknown): O[number] {
    return this.check(value) ? value : super.parse(value);
  }

  protected override valid(value: unknown): value is O[number] {
    return this.check(value) || super.valid(value);
  }
}

/**
 * Filter Param
 */
export class FiltersParam extends BaseParam<string[]> {
  private _not: string = 'NOT';

  private _omit: string = '!';

  constructor(key: string = null, param: FiltersParam = null) {
    super(key, param);
    if (!param) return;
    this._not = param._not;
    this._omit = param._omit;
  }

  public has(origin: string[] = null, value: string = undefined): boolean {
    return value === undefined ? true : origin.includes(value);
  }

  public not(value: string = 'NOT') {
    this._not = value;
    return this;
  }

  public omit(value: string = '!') {
    this._omit = value;
    return this;
  }

  private check(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(v => typeof v === 'string');
  }

  private toPrefix(value: string, prev: string[] = []): string[] {
    if (value.startsWith(`${this._omit}(`) && value.endsWith(')')) {
      return this.toPrefix(value.substring(this._omit.length + 1, value.length - 1), [...prev, this._omit]);
    } else if (value.startsWith(`${this._not}(`) && value.endsWith(')')) {
      return this.toPrefix(value.substring(this._not.length + 1, value.length - 1), [...prev, this._not]);
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
      .filter(value => !value.some(v => v === this._omit));
  }

  private append<P extends Params>(prev: P, values: string[][]): P {
    const res = values.toSorted((a, b) => a.at(-1).localeCompare(b.at(-1))).map(value => this.fromPrefix(value));
    return { ...prev, [this._key]: res };
  }

  protected override parse(value: unknown): string[] {
    return this.check(value) ? value : super.parse(value);
  }

  protected override valid(value: unknown): value is string[] {
    return this.check(value) || super.valid(value);
  }

  protected override get<P extends Params>(search: P | URLSearchParams): string[] {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.getAll(this._key));
      if (this.valid(value)) return value;
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return value;
    }
    return [];
  }

  protected override from<P extends Params>(prev: P, search: P | URLSearchParams): P {
    const value = this.get(search);
    return this.append(prev, this.clean(value));
  }

  protected override full<P extends Params>(prev: P, search: P | URLSearchParams): P {
    const data = this.get(search);
    return this.append(prev, this.clean([...this._default, ...(!this._enforced && data)]));
  }

  protected override delta<P extends Params>(prev: P, search: P | URLSearchParams): P {
    const data = this.get(search);
    if (this._enforced || !Array.isArray(data)) return prev;

    const left = this.clean(data);
    const right = this.clean(this._default);
    let values: string[][] = [];

    values = left.reduceRight(
      (p, l) => (right.some(r => this.fromPrefix(l) === this.fromPrefix(r)) ? p : [...p, l]),
      values
    );

    values = right.reduceRight(
      (p, r) => (left.some(l => l.at(-1) === r.at(-1)) ? p : [...p, [this._omit, ...r]]),
      values
    );

    return this.append(prev, values);
  }

  protected override merge<P extends Params>(
    prev: P,
    left: P | URLSearchParams,
    right: P | URLSearchParams,
    keys: (keyof P)[]
  ): P {
    const value1 = this.get(left);
    const value2 = this.get(right);
    const res = !keys.includes(this._key);
    const data = res === true ? value1 : res === false ? value2 : [];
    return this.append(prev, this.clean([...this._default, ...(!this._enforced && data)]));
  }

  protected override toParams<P extends Params>(prev: string[][], search: P): string[][] {
    if (!(this._key in search) || !this.check(search?.[this._key])) return prev;
    return (search[this._key] as string[]).reduce((p, f) => [...p, [this._key, String(f)]], prev);
  }
}

/**
 * Param Mixin
 */
type AnyFunction<A = any> = (...input: any[]) => A;

type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;

export type MIxinFormat = Mixin<typeof Format>;

export type Formatters = Record<string, MIxinFormat>;

export type Constructor = new (...args: any[]) => {};

// export function Format<TBase extends Constructor>(Base: TBase) {
function Format<T extends ValueTypes, B extends new (...args: any[]) => BaseParam<T>>(Base: B) {
  return class Accessor extends Base {
    public default = (value: T) => {
      super.default(value);
      return this;
    };

    public getDefault = () => super.getDefault();

    public parse = (value: unknown): T => super.parse(value);

    public valid = (value: unknown): value is T => super.valid(value);

    public isIgnored = (): boolean => this._ignored;

    public isHidden = (): boolean => this._hidden;

    public from = <P extends Params>(prev: P, search: P | URLSearchParams): P => super.from(prev, search);

    public full = <P extends Params>(prev: P, search: P | URLSearchParams): P => super.full(prev, search);

    public delta = <P extends Params>(prev: P, search: P | URLSearchParams): P => super.delta(prev, search);

    public merge = <P extends Params>(
      prev: P,
      left: P | URLSearchParams,
      right: P | URLSearchParams,
      keys: (keyof P)[]
    ): P => super.merge(prev, left, right, keys);

    public toParams = <P extends Params>(prev: string[][], search: P): string[][] => super.toParams(prev, search);
  };
}

export const formatters = {
  boolean: Format(BooleanParam),
  number: Format(NumberParam),
  string: Format(StringParam),
  filters: Format(FiltersParam),
  enum: Format(EnumParam)
} as const;

const params = {
  boolean: (value: boolean) => new BooleanParam().default(value),
  number: (value: number) => new NumberParam().default(value),
  string: (value: string) => new StringParam().default(value),
  enum: <O extends readonly string[]>(value: O[number], options: O) =>
    new EnumParam<O>().default(value).options(options),
  filters: (value: string[], not: string = 'NOT', omit: string = '!') =>
    new FiltersParam().default(value).not(not).omit(omit)
} as const;

export const createSearchParams = <P extends ParamObject>(input: (p: typeof params) => P) => input(params);

export default createSearchParams;
