import type {
  ParamBlueprints,
  ParamSource,
  ParamValues,
  SearchParamValues
} from 'components/core/SearchParams2/lib/search_params.model';
import type { SearchParamSnapshot } from 'components/core/SearchParams2/lib/search_params.snapshot';
import type { Location } from 'react-router';

export abstract class BaseBlueprint<T extends ParamValues> {
  /**
   * Key of the search param
   */
  protected _key: string;

  /**
   * Default value of the param
   */
  protected _defaultValue: T;

  /**
   * Source of the param
   */
  protected _source: ParamSource = 'search';

  /**
   * Parameter changes will not cause rerenders
   */
  protected _ignored: boolean;

  /**
   * Null is a valid value
   */
  protected _nullable: boolean;

  /**
   * Enforce the defaultValues when no value is provided
   */
  protected _enforced: boolean;

  constructor(key: string = null, param: BaseBlueprint<T> = null) {
    this._key = key;
    if (!param) return;
    this._defaultValue = param._defaultValue;
    this._enforced = param._enforced;
    this._ignored = param._ignored;
    this._nullable = param._nullable;
    this._source = param._source;
  }

  public defaultValue(defaultValue: T) {
    this._defaultValue = defaultValue;
    return this;
  }

  public enforced(enforced: boolean = true) {
    this._enforced = enforced;
    return this;
  }

  public ignored(ignored: boolean = true) {
    this._ignored = ignored;
    return this;
  }

  public nullable(nullable: boolean = true) {
    this._nullable = nullable;
    return this;
  }

  public source(source: ParamSource) {
    this._source = source;
    return this;
  }

  public getDefaultValue() {
    return this._defaultValue;
  }

  public getEnforced() {
    return this._enforced;
  }

  public getIgnored() {
    return this._ignored;
  }

  public getNullable() {
    return this._nullable;
  }

  public getSource() {
    return this._source;
  }

  public has(origin: T = null, value: unknown = undefined): boolean {
    return value === undefined ? true : origin === value;
  }

  protected parse(value: unknown): T {
    return value === 'null' ? null : value === 'undefined' ? undefined : undefined;
  }

  protected valid(value: unknown): value is T {
    return this._nullable && value === null ? true : !!value;
  }

  protected get<P extends Record<string, ParamValues>>(search: P | URLSearchParams): T {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.get(this._key));
      if (this.valid(value)) return value;
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return value;
    }
    return undefined;
  }

  protected fromLocation<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    location: Location,
    snapshot: SearchParamSnapshot<Blueprints> | null = null
  ): SearchParamValues<Blueprints> {
    let raw: T | undefined;

    // 1. Resolve raw value from the correct source
    switch (this._source) {
      case 'search': {
        const params = new URLSearchParams(location.search);
        raw = params.get(this._key) as T;
        break;
      }
      case 'state': {
        const state = (location.state ?? {}) as Record<string, unknown>;
        raw = state[this._key] as T;
        break;
      }
      case 'ref': {
        raw = snapshot?.values?.[this._key as keyof SearchParamValues<Blueprints>] as T;
        break;
      }
      default:
        raw = undefined;
    }

    // 2. Parse into expected type
    const parsed = this.parse(raw);

    // 3. If valid → keep it
    if (this.valid(parsed)) {
      return parsed !== prev[this._key] ? { ...prev, [this._key]: parsed } : prev;
    }

    // 4. If enforced → always fall back to default
    if (this._enforced) {
      return prev[this._key] !== this._defaultValue ? { ...prev, [this._key]: this._defaultValue } : prev;
    }

    // 5. Otherwise → keep previous snapshot value (if any)
    const fallback = snapshot?.values?.[this._key as keyof SearchParamValues<Blueprints>];
    if (fallback !== undefined && fallback !== prev[this._key]) {
      return { ...prev, [this._key]: fallback };
    }

    // 6. Nothing changed
    return { ...prev, [this._key]: this._defaultValue };
  }

  protected fromParams<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    params: URLSearchParams,
    snapshot: SearchParamSnapshot<Blueprints> | null = null
  ): SearchParamValues<Blueprints> {
    const raw = params.get(this._key) as T;
    const parsed = this.parse(raw);

    if (this.valid(parsed)) {
      return parsed !== prev[this._key] ? { ...prev, [this._key]: parsed } : prev;
    }

    if (this._enforced) {
      return prev[this._key] !== this._defaultValue ? { ...prev, [this._key]: this._defaultValue } : prev;
    }

    const fallback = snapshot?.values?.[this._key as keyof SearchParamValues<Blueprints>];
    if (fallback !== undefined && fallback !== prev[this._key]) {
      return { ...prev, [this._key]: fallback };
    }

    return { ...prev, [this._key]: this._defaultValue };
  }

  protected fromObject<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    value: SearchParamValues<Blueprints>,
    snapshot: SearchParamSnapshot<Blueprints> | null = null
  ): SearchParamValues<Blueprints> {
    const raw = value[this._key as keyof SearchParamValues<Blueprints>] as T;
    const parsed = this.parse(raw);

    if (this.valid(parsed)) {
      return parsed !== prev[this._key] ? { ...prev, [this._key]: parsed } : prev;
    }

    if (this._enforced) {
      return prev[this._key] !== this._defaultValue ? { ...prev, [this._key]: this._defaultValue } : prev;
    }

    const fallback = snapshot?.values?.[this._key as keyof SearchParamValues<Blueprints>];
    if (fallback !== undefined && fallback !== prev[this._key]) {
      return { ...prev, [this._key]: fallback };
    }

    return { ...prev, [this._key]: this._defaultValue };
  }

  protected toParams<Blueprints extends Record<string, ParamBlueprints>>(
    prev: string[][],
    snapshot: SearchParamSnapshot<Blueprints>
  ): string[][] {
    return this._key in snapshot && snapshot?.[this._key] !== null && snapshot?.[this._key] !== undefined
      ? [...prev, [this._key, String(snapshot?.[this._key])]]
      : prev;
  }
}

/**
 * Boolean Param
 */
export class BooleanBlueprint extends BaseBlueprint<boolean> {
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
export class NumberBlueprint extends BaseBlueprint<number> {
  private _min: null | number = null;

  private _max: null | number = null;

  constructor(key: string = null, param: NumberBlueprint = null) {
    super(key, param);
    if (!param) return;
    this._min = param._min;
    this._max = param._max;
  }

  public min(value: number) {
    this._min = value;
    this._defaultValue = Math.max(this._defaultValue, this._min);
    return this;
  }

  public max(value: number) {
    this._max = value;
    this._defaultValue = Math.min(this._defaultValue, this._max);
    return this;
  }

  private clamp(value: number): number {
    let num = value;
    if (this._min !== null) num = Math.max(num, this._min);
    if (this._max !== null) num = Math.min(num, this._max);
    return num;
  }

  protected override get<P extends Record<string, ParamValues>>(search: P | URLSearchParams): number {
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
export class StringBlueprint extends BaseBlueprint<string> {
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
export class EnumBlueprint<O extends readonly string[]> extends BaseBlueprint<O[number]> {
  private _options: O;

  constructor(key: string = null, param: EnumBlueprint<O> = null) {
    super(key, param);
    if (!param) return;
    this._options = param._options;
  }

  public defaultValue(defaultValue: O[number]) {
    this._defaultValue = defaultValue;
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
export class FiltersBlueprint extends BaseBlueprint<string[]> {
  private _not: string = 'NOT';

  private _omit: string = '!';

  constructor(key: string = null, param: FiltersBlueprint = null) {
    super(key, param);
    if (!param) return;
    this._not = param._not;
    this._omit = param._omit;
  }

  public not(value: string = 'NOT') {
    this._not = value;
    return this;
  }

  public omit(value: string = '!') {
    this._omit = value;
    return this;
  }

  public has(origin: string[] = null, value: string = undefined): boolean {
    return value === undefined ? true : origin.includes(value);
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

  private append<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    values: string[][]
  ): SearchParamValues<Blueprints> {
    const res = values.toSorted((a, b) => a.at(-1).localeCompare(b.at(-1))).map(value => this.fromPrefix(value));
    return { ...prev, [this._key]: res };
  }

  protected override parse(value: unknown): string[] {
    return this.check(value) ? value : super.parse(value);
  }

  protected override valid(value: unknown): value is string[] {
    return this.check(value) || super.valid(value);
  }

  protected override get<Blueprints extends Record<string, ParamBlueprints>>(
    search: SearchParamValues<Blueprints> | URLSearchParams
  ): string[] {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.getAll(this._key));
      if (this.valid(value)) return value;
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return value;
    }
    return [];
  }

  // protected override from<Blueprints extends Record<string, ParamBlueprints>>(prev: P, search: P | URLSearchParams): P {
  //   const value = this.get(search);
  //   return this.append(prev, this.clean(value));
  // }

  // protected override full<Blueprints extends Record<string, ParamBlueprints>>(prev: P, search: P | URLSearchParams): P {
  //   const data = this.get(search);
  //   return this.append(prev, this.clean([...this._default, ...(!this._enforced && data)]));
  // }

  // protected override delta<Blueprints extends Record<string, ParamBlueprints>>(prev: P, search: P | URLSearchParams): P {
  //   const data = this.get(search);
  //   if (this._enforced || !Array.isArray(data)) return prev;

  //   const left = this.clean(data);
  //   const right = this.clean(this._default);
  //   let values: string[][] = [];

  //   values = left.reduceRight(
  //     (p, l) => (right.some(r => this.fromPrefix(l) === this.fromPrefix(r)) ? p : [...p, l]),
  //     values
  //   );

  //   values = right.reduceRight(
  //     (p, r) => (left.some(l => l.at(-1) === r.at(-1)) ? p : [...p, [this._omit, ...r]]),
  //     values
  //   );

  //   return this.append(prev, values);
  // }

  // protected override merge<Blueprints extends Record<string, ParamBlueprints>>(
  //   prev: P,
  //   left: P | URLSearchParams,
  //   right: P | URLSearchParams,
  //   keys: (keyof P)[]
  // ): P {
  //   const value1 = this.get(left);
  //   const value2 = this.get(right);
  //   const res = !keys.includes(this._key);
  //   const data = res === true ? value1 : res === false ? value2 : [];
  //   return this.append(prev, this.clean([...this._default, ...(!this._enforced && data)]));
  // }

  protected override toParams<Blueprints extends Record<string, ParamBlueprints>>(
    prev: string[][],
    snapshot: SearchParamSnapshot<Blueprints>
  ): string[][] {
    if (!(this._key in snapshot) || !this.check(snapshot?.[this._key])) return prev;
    return (snapshot[this._key] as string[]).reduce((p, f) => [...p, [this._key, String(f)]], prev);
  }
}

export const PARAM_BLUEPRINTS = {
  boolean: (value: boolean) => new BooleanBlueprint().defaultValue(value),
  number: (value: number) => new NumberBlueprint().defaultValue(value),
  string: (value: string) => new StringBlueprint().defaultValue(value),
  enum: <O extends readonly string[]>(value: O[number], options: O) =>
    new EnumBlueprint<O>().defaultValue(value).options(options),
  filters: (value: string[], not: string = 'NOT', omit: string = '!') =>
    new FiltersBlueprint().defaultValue(value).not(not).omit(omit)
} as const;
