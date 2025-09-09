import type {
  ParamBlueprints,
  ParamSource,
  ParamValues,
  SearchParamValues
} from 'components/core/SearchParams/lib/search_params.model';
import type { SearchParamSnapshot } from 'components/core/SearchParams/lib/search_params.snapshot';
import type { Location } from 'react-router';

export abstract class BaseBlueprint<T extends ParamValues> {
  /**
   * Unique identifier for this parameter in `location.search` or `location.state`.
   * Example: `?page=2` → key = "page".
   */
  protected _key: string;

  /**
   * The default value that will be used when no valid value is provided,
   * or when this param is locked to always fall back.
   */
  protected _defaultValue: T;

  /**
   * If true, this param will be excluded from persistence mechanisms
   * (e.g. localStorage). Useful for ephemeral, session-only values.
   */
  protected _ephemeral: boolean = false;

  /**
   * If true, changes to this parameter will be ignored when detecting
   * differences between snapshots. This prevents unnecessary re-renders
   * when only this param changes in the location.
   */
  protected _ignored: boolean = false;

  /**
   * If true, this param is locked and will always resolve
   * to its default value regardless of external input.
   */
  protected _locked: boolean = false;

  /**
   * If true, `null` is considered a valid value for this param.
   */
  protected _nullable: boolean = false;

  /**
   * Where this parameter should be resolved from:
   * - "search" → URL query string
   * - "state"  → location.state
   * - "ref"    → a React.ref value
   */
  protected _origin: ParamSource = 'search';

  constructor(key: string = null, param: BaseBlueprint<T> = null) {
    this._key = key;
    if (!param) return;
    this._defaultValue = param._defaultValue;
    this._ephemeral = param._ephemeral;
    this._ignored = param._ignored;
    this._locked = param._locked;
    this._nullable = param._nullable;
    this._origin = param._origin;
  }

  // -------------------------
  // Builder methods
  // -------------------------

  public defaultValue(defaultValue: T) {
    this._defaultValue = defaultValue;
    return this;
  }

  public ephemeral(ephemeral: boolean = true) {
    this._ephemeral = ephemeral;
    return this;
  }

  public ignored(ignored: boolean = true) {
    this._ignored = ignored;
    return this;
  }

  public locked(locked: boolean = true) {
    this._locked = locked;
    return this;
  }

  public nullable(nullable: boolean = true) {
    this._nullable = nullable;
    return this;
  }

  public origin(origin: ParamSource) {
    this._origin = origin;
    return this;
  }

  // -------------------------
  // Getters
  // -------------------------

  protected getDefaultValue(): T {
    return this._defaultValue;
  }

  protected isEphemeral() {
    return this._ephemeral;
  }

  protected isIgnored() {
    return this._ignored;
  }

  protected isLocked() {
    return this._locked;
  }

  protected isNullable() {
    return this._nullable;
  }

  protected getOrigin() {
    return this._origin;
  }

  // -------------------------
  // Helpers
  // -------------------------

  protected has(origin: T = null, value: unknown = undefined): boolean {
    return value === undefined ? true : origin === value;
  }

  protected parse(value: unknown): T {
    return value === 'null' ? null : value === 'undefined' ? undefined : undefined;
  }

  protected valid(value: unknown): value is T {
    return this._nullable && (value === null || value === undefined) ? true : !!value;
  }

  protected get<P extends Record<string, ParamValues>>(search: P | URLSearchParams): T {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.get(this._key));
      if (this.valid(value)) return value;
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return value;
    }
    return null;
  }

  // -------------------------
  // Parsers
  // -------------------------

  protected full<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    params: URLSearchParams | SearchParamValues<Blueprints>
  ): SearchParamValues<Blueprints> {
    const value = this.get(params);
    if (!this._locked && this.valid(value)) return { ...prev, [this._key]: value };
    else if (this.valid(this._defaultValue)) return { ...prev, [this._key]: this._defaultValue };
    else return prev;
  }

  protected delta<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    params: URLSearchParams | SearchParamValues<Blueprints>
  ): SearchParamValues<Blueprints> {
    const value = this.get(params);
    if (!this._locked && this.valid(value) && value !== this._defaultValue) return { ...prev, [this._key]: value };
    else return prev;
  }

  protected fromLocation<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    location: Location,
    snapshot: SearchParamSnapshot<Blueprints> | null = null
  ): SearchParamValues<Blueprints> {
    let value: T | undefined;

    switch (this._origin) {
      case 'search': {
        value = this.get(new URLSearchParams(location.search));
        break;
      }
      case 'state': {
        value = this.get((location.state ?? {}) as Record<string, ParamValues>);
        break;
      }
      case 'snapshot': {
        value = this.get(snapshot?.values);
        break;
      }
      default:
        value = null;
    }

    if (!this._locked && this.valid(value)) return { ...prev, [this._key]: value };
    else if (this.valid(this._defaultValue)) return { ...prev, [this._key]: this._defaultValue };
    else return prev;
  }

  // -------------------------
  // Resolvers
  // -------------------------

  protected toParams<Blueprints extends Record<string, ParamBlueprints>>(
    prev: string[][],
    snapshot: SearchParamValues<Blueprints>
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
    return null;
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

  // -------------------------
  // Builder methods
  // -------------------------

  public not(value: string = 'NOT') {
    this._not = value;
    return this;
  }

  public omit(value: string = '!') {
    this._omit = value;
    return this;
  }

  // -------------------------
  // Utility
  // -------------------------

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

  // -------------------------
  // Helpers
  // -------------------------

  protected has(origin: string[] = [], value: string = undefined): boolean {
    return value === undefined ? true : origin?.includes(value);
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

  // -------------------------
  // Parsers
  // -------------------------

  protected override full<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    params: URLSearchParams | SearchParamValues<Blueprints>
  ): SearchParamValues<Blueprints> {
    const data = this.get(params);
    return this.append(prev, this.clean([...this._defaultValue, ...(!this._locked && data)]));
  }

  protected override delta<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    params: URLSearchParams | SearchParamValues<Blueprints>
  ): SearchParamValues<Blueprints> {
    const data = this.get(params);
    if (this._locked || !Array.isArray(data)) return prev;

    const left = this.clean(data);
    const right = this.clean(this._defaultValue);
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

  protected override fromLocation<Blueprints extends Record<string, ParamBlueprints>>(
    prev: SearchParamValues<Blueprints>,
    location: Location,
    snapshot: SearchParamSnapshot<Blueprints> | null = null
  ): SearchParamValues<Blueprints> {
    let value: string[] | undefined;

    switch (this._origin) {
      case 'search': {
        value = this.get(new URLSearchParams(location.search));
        break;
      }
      case 'state': {
        value = this.get((location.state ?? {}) as Record<string, ParamValues>);
        break;
      }
      case 'snapshot': {
        value = this.get(snapshot?.values);
        break;
      }
      default:
        value = null;
    }

    return this.append(prev, this.clean([...this._defaultValue, ...(!this._locked && value)]));
  }

  // -------------------------
  // Resolvers
  // -------------------------

  protected override toParams<Blueprints extends Record<string, ParamBlueprints>>(
    prev: string[][],
    snapshot: SearchParamValues<Blueprints>
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
