import type {
  EnumParamValue,
  InferSearchParamValueMapFromBlueprintMap,
  ObjectParamValue,
  SearchParamBlueprintMap,
  SearchParamSnapshot,
  SearchParamSource,
  SearchParamValue,
  SearchParamValueMap
} from 'features/search-params';
import type { Location } from 'react-router';

//*****************************************************************************************
// Base Blueprint
//*****************************************************************************************
export abstract class BaseSearchParamBlueprint<T extends SearchParamValue> {
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
  protected _source: SearchParamSource = 'search';

  constructor(key: string = null, param: BaseSearchParamBlueprint<T> = null) {
    this._key = key;
    if (!param) return;
    this._defaultValue = param._defaultValue;
    this._ephemeral = param._ephemeral;
    this._ignored = param._ignored;
    this._locked = param._locked;
    this._nullable = param._nullable;
    this._source = param._source;
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

  public source(source: SearchParamSource) {
    this._source = source;
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

  protected getSource() {
    return this._source;
  }

  // -------------------------
  // Setters
  // -------------------------

  protected setDefaultValue(values: URLSearchParams) {
    const next = this.get(values);
    if (next !== null || this._nullable) {
      this._defaultValue = next;
    }
    return this;
  }

  // -------------------------
  // Helpers
  // -------------------------

  protected has(source: T = null, value: unknown = undefined): boolean {
    return value === undefined ? true : source === value;
  }

  protected parse(value: unknown): T {
    return value === 'undefined' ? undefined : null;
  }

  protected valid(value: unknown): value is T {
    return this._nullable && (value === null || value === undefined) ? true : !!value;
  }

  protected get<P extends SearchParamValueMap>(search: P | URLSearchParams): T {
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

  protected full<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    params: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const value = this.get(params);

    if (!this._locked && this.valid(value)) {
      (prev as Record<string, SearchParamValue>)[this._key] = value;
      return prev;
    }

    if (this.valid(this._defaultValue)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this._defaultValue;
    }

    return prev;
  }

  protected delta<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    params: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const value = this.get(params);

    if (!this._locked && this.valid(value) && value !== this._defaultValue) {
      (prev as Record<string, SearchParamValue>)[this._key] = value;
    }

    return prev;
  }

  protected fromLocation<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    location: Location,
    snapshot: SearchParamSnapshot<SearchParamBlueprints> | null = null
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    let value: T | undefined;

    switch (this._source) {
      case 'search': {
        value = this.get(new URLSearchParams(location.search));
        break;
      }
      case 'state': {
        value = this.get((location.state ?? {}) as SearchParamValueMap);
        break;
      }
      case 'transient': {
        value = this.get(snapshot?.values);
        break;
      }
      default:
        value = null;
    }

    if (!this._locked && this.valid(value)) {
      (prev as Record<string, SearchParamValue>)[this._key] = value;
      return prev;
    }

    if (this.valid(this._defaultValue)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this._defaultValue;
    }

    return prev;
  }

  protected fromRoute<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    href: string = '',
    state: unknown = null,
    transient: unknown = null
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    let value: T | undefined;

    switch (this._source) {
      case 'search': {
        value = this.get(new URLSearchParams(new URL(href, 'http://localhost').search));
        break;
      }
      case 'state': {
        value = this.get((state ?? {}) as SearchParamValueMap);
        break;
      }
      case 'transient': {
        value = this.get((transient ?? {}) as SearchParamValueMap);
        break;
      }
      default:
        value = null;
    }

    if (!this._locked && this.valid(value)) {
      (prev as Record<string, SearchParamValue>)[this._key] = value;
      return prev;
    }

    if (this.valid(this._defaultValue)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this._defaultValue;
    }

    return prev;
  }

  // -------------------------
  // Resolvers
  // -------------------------

  protected toParams<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: string[][],
    snapshot: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): string[][] {
    if (!(this._key in snapshot)) return prev;

    const value = snapshot?.[this._key];
    if (value === null || value === undefined || Array.isArray(value) || typeof value === 'object') return prev;

    prev.push([this._key, String(value)]);
    return prev;
  }
}

//*****************************************************************************************
// Boolean Blueprint
//*****************************************************************************************
export class BooleanSearchParamBlueprint extends BaseSearchParamBlueprint<boolean> {
  protected override parse(value: unknown): boolean {
    return value === 'true' ? true : value === 'false' ? false : super.parse(value);
  }

  protected override valid(value: unknown): value is boolean {
    return typeof value === 'boolean' || super.valid(value);
  }
}

//*****************************************************************************************
// Number Blueprint
//*****************************************************************************************
export class NumberSearchParamBlueprint extends BaseSearchParamBlueprint<number> {
  private _min: null | number = null;

  private _max: null | number = null;

  constructor(key: string = null, param: NumberSearchParamBlueprint = null) {
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

  protected override get<P extends SearchParamValueMap>(search: P | URLSearchParams): number {
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

//*****************************************************************************************
// String Blueprint
//*****************************************************************************************
export class StringSearchParamBlueprint extends BaseSearchParamBlueprint<string> {
  protected override parse(value: unknown): string {
    return typeof value === 'string' ? String(value) : super.parse(value);
  }

  protected override valid(value: unknown): value is string {
    return typeof value === 'string' || super.valid(value);
  }
}

//*****************************************************************************************
// Enum Blueprint
//*****************************************************************************************
export class EnumSearchParamBlueprint<
  O extends readonly [EnumParamValue, ...EnumParamValue[]]
> extends BaseSearchParamBlueprint<O[number]> {
  private _options: O;

  constructor(key: string = null, param: EnumSearchParamBlueprint<O> = null) {
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
    return Array.isArray(this._options) && this._options.includes(v => v === value);
  }

  protected override parse(value: unknown): O[number] {
    return this.check(value) ? value : super.parse(value);
  }

  protected override valid(value: unknown): value is O[number] {
    return this.check(value) || super.valid(value);
  }
}

//*****************************************************************************************
// Filter Blueprint
//*****************************************************************************************
export class FiltersSearchParamBlueprint extends BaseSearchParamBlueprint<string[]> {
  private _not: string = 'NOT';

  private _omit: string = '!';

  constructor(key: string = null, param: FiltersSearchParamBlueprint = null) {
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
    const next = prev.slice();

    if (value.startsWith(`${this._omit}(`) && value.endsWith(')')) {
      next.push(this._omit);
      return this.toPrefix(value.substring(this._omit.length + 1, value.length - 1), next);
    } else if (value.startsWith(`${this._not}(`) && value.endsWith(')')) {
      next.push(this._not);
      return this.toPrefix(value.substring(this._not.length + 1, value.length - 1), next);
    } else {
      next.push(value);
      return next;
    }
  }

  private fromPrefix(value: string[]): string {
    if (value.length === 0) return '';

    let output = value[value.length - 1];
    for (let i = value.length - 2; i >= 0; i--) {
      output = `${value[i]}(${output})`;
    }

    return output;
  }

  private clean(values: string[]): string[][] {
    const prefixed: string[][] = [];
    for (const value of values) {
      prefixed.push(this.toPrefix(value));
    }

    const dedup: string[][] = [];
    const seen = new Set<string>();

    for (let i = prefixed.length - 1; i >= 0; i--) {
      const current = prefixed[i];
      const suffix = current.at(-1);
      if (!suffix || seen.has(suffix)) continue;

      seen.add(suffix);
      dedup.push(current);
    }

    const cleaned: string[][] = [];
    for (const value of dedup) {
      if (!value.some(v => v === this._omit)) cleaned.push(value);
    }

    return cleaned;
  }

  private append<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    values: string[][]
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const sorted = values.slice();
    sorted.sort((a, b) => a.at(-1).localeCompare(b.at(-1)));

    const res: string[] = [];
    for (const value of sorted) {
      res.push(this.fromPrefix(value));
    }

    (prev as Record<string, SearchParamValue>)[this._key] = res;
    return prev;
  }

  // -------------------------
  // Helpers
  // -------------------------

  protected has(source: string[] = [], value: string = undefined): boolean {
    return value === undefined ? true : source?.includes(value);
  }

  protected override parse(value: unknown): string[] {
    return this.check(value) ? value : super.parse(value);
  }

  protected override valid(value: unknown): value is string[] {
    return this.check(value) || super.valid(value);
  }

  protected override get<SearchParamBlueprints extends SearchParamBlueprintMap>(
    search: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> | URLSearchParams
  ): string[] {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.getAll(this._key));
      if (this.valid(value)) return value;
    } else if (typeof search === 'object' && this._key in search) {
      const value: unknown = search?.[this._key];
      if (this.valid(value)) return value;
    }
    return [];
  }

  // -------------------------
  // Parsers
  // -------------------------

  protected override full<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    params: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const data = this.get(params);
    const values = this._defaultValue.slice();
    if (!this._locked) {
      for (const item of data) values.push(item);
    }

    return this.append(prev, this.clean(values));
  }

  protected override delta<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    params: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const data = this.get(params);
    if (this._locked || !Array.isArray(data)) return prev;

    const left = this.clean(data);
    const right = this.clean(this._defaultValue);
    const values: string[][] = [];

    for (let i = left.length - 1; i >= 0; i--) {
      const current = left[i];
      const exists = right.some(r => this.fromPrefix(current) === this.fromPrefix(r));
      if (!exists) values.push(current);
    }

    for (let i = right.length - 1; i >= 0; i--) {
      const current = right[i];
      const exists = left.some(l => l.at(-1) === current.at(-1));
      if (exists) continue;

      const omitted: string[] = [this._omit];
      for (const item of current) omitted.push(item);
      values.push(omitted);
    }

    return this.append(prev, values);
  }

  protected override fromLocation<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    location: Location,
    snapshot: SearchParamSnapshot<SearchParamBlueprints> | null = null
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    let value: string[] | undefined;

    switch (this._source) {
      case 'search': {
        value = this.get(new URLSearchParams(location.search));
        break;
      }
      case 'state': {
        value = this.get((location.state ?? {}) as SearchParamValueMap);
        break;
      }
      case 'transient': {
        value = this.get(snapshot?.values);
        break;
      }
      default:
        value = null;
    }

    const values = this._defaultValue.slice();
    if (!this._locked && value) {
      for (const item of value) values.push(item);
    }

    return this.append(prev, this.clean(values));
  }

  // -------------------------
  // Resolvers
  // -------------------------

  protected override toParams<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: string[][],
    snapshot: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): string[][] {
    if (!(this._key in snapshot) || !this.check(snapshot?.[this._key])) return prev;

    const values = snapshot[this._key] as string[];
    for (const value of values) {
      prev.push([this._key, String(value)]);
    }

    return prev;
  }
}

//*****************************************************************************************
// Object Blueprint
//*****************************************************************************************
export class ObjectSearchParamBlueprint<
  O extends ObjectParamValue = ObjectParamValue
> extends BaseSearchParamBlueprint<O> {
  private isPrimitive(value: unknown): value is string | number | boolean | null {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
  }

  private isFlatObject(value: unknown): value is Record<string, string | number | boolean | null> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).every(entry => this.isPrimitive(entry))
    );
  }

  private isShape(value: unknown): value is O[string] {
    return (
      this.isPrimitive(value) ||
      this.isFlatObject(value) ||
      (Array.isArray(value) && value.every(v => this.isPrimitive(v)))
    );
  }

  private isObjectValue(value: unknown): value is O {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).every(v => this.isShape(v))
    );
  }

  private clone(value: O): O {
    return structuredClone(value);
  }

  private mergeValue(base: O, next: O): O {
    if (!this.isObjectValue(next)) {
      return this.clone(base);
    }

    const merged = this.clone(base) as unknown as Record<string, unknown>;

    for (const [key, nextValue] of Object.entries(next as Record<string, unknown>)) {
      const baseValue = merged[key];

      if (this.isFlatObject(baseValue) && this.isFlatObject(nextValue)) {
        const mergedValue: Record<string, unknown> = {};

        for (const [baseKey, baseEntry] of Object.entries(baseValue)) {
          mergedValue[baseKey] = baseEntry;
        }

        for (const [nextKey, nextEntry] of Object.entries(nextValue)) {
          mergedValue[nextKey] = nextEntry;
        }

        merged[key] = mergedValue;
      } else {
        merged[key] = nextValue;
      }
    }

    return merged as O;
  }

  private isEqual(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  private deltaValue(base: O, next: O): Partial<O> {
    if (!this.isObjectValue(next)) {
      return {} as Partial<O>;
    }

    const delta = {} as Partial<O>;

    for (const [key, value] of Object.entries(next)) {
      const baseValue = base[key];

      if (this.isFlatObject(baseValue) && this.isFlatObject(value)) {
        const nested: Record<string, string | number | boolean | null> = {};

        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (!this.isEqual(baseValue[nestedKey], nestedValue)) {
            nested[nestedKey] = nestedValue;
          }
        }

        if (Object.keys(nested).length > 0) {
          (delta as Record<string, unknown>)[key] = nested;
        }

        continue;
      }

      if (!this.isEqual(baseValue, value)) {
        (delta as Record<string, unknown>)[key] = value;
      }
    }

    return delta;
  }

  protected override parse(value: unknown): O {
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return this.isObjectValue(parsed) ? parsed : super.parse(value);
      } catch {
        return super.parse(value);
      }
    }

    return this.isObjectValue(value) ? value : super.parse(value);
  }

  protected override valid(value: unknown): value is O {
    return this.isObjectValue(value) || super.valid(value);
  }

  protected override get<SearchParamBlueprints extends SearchParamBlueprintMap>(
    search: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> | URLSearchParams
  ): O {
    if (search instanceof URLSearchParams) {
      const value = this.parse(search.get(this._key));
      if (this.valid(value)) return this.clone(value);
    } else if (typeof search === 'object' && this._key in search) {
      const value = search?.[this._key];
      if (this.valid(value)) return this.clone(value);
    }
    return null;
  }

  protected override full<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    params: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const value = this.get(params);
    if (value === null || value === undefined) {
      if (!this._locked && this.isNullable()) {
        (prev as Record<string, SearchParamValue>)[this._key] = null;
        return prev;
      }

      if (this.valid(this._defaultValue)) {
        (prev as Record<string, SearchParamValue>)[this._key] = this.clone(this._defaultValue);
      }

      return prev;
    }

    if (!this._locked && this.valid(value)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this.mergeValue(this._defaultValue || ({} as O), value);
      return prev;
    }

    if (this.valid(this._defaultValue)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this.clone(this._defaultValue);
    }

    return prev;
  }

  protected override delta<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    params: URLSearchParams | InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    const value = this.get(params);
    if (this._locked || !this.valid(value)) return prev;

    if (value === null || value === undefined) {
      if (!this.isEqual(this._defaultValue, null)) {
        (prev as Record<string, SearchParamValue>)[this._key] = null;
      }
      return prev;
    }

    const delta = this.deltaValue(this._defaultValue || ({} as O), value);
    if (Object.keys(delta).length === 0) return prev;

    (prev as Record<string, SearchParamValue>)[this._key] = delta;
    return prev;
  }

  protected override fromLocation<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>,
    location: Location,
    snapshot: SearchParamSnapshot<SearchParamBlueprints> | null = null
  ): InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints> {
    let value: O | undefined;

    switch (this._source) {
      case 'search': {
        value = this.get(new URLSearchParams(location.search));
        break;
      }
      case 'state': {
        value = this.get((location.state ?? {}) as SearchParamValueMap);
        break;
      }
      case 'transient': {
        value = this.get(snapshot?.values);
        break;
      }
      default:
        value = null;
    }

    if (!this._locked && this.valid(value)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this.mergeValue(this._defaultValue || ({} as O), value);
      return prev;
    }

    if (this.valid(this._defaultValue)) {
      (prev as Record<string, SearchParamValue>)[this._key] = this.clone(this._defaultValue);
    }

    return prev;
  }

  protected override toParams<SearchParamBlueprints extends SearchParamBlueprintMap>(
    prev: string[][],
    snapshot: InferSearchParamValueMapFromBlueprintMap<SearchParamBlueprints>
  ): string[][] {
    if (!(this._key in snapshot)) return prev;

    const value = snapshot?.[this._key];
    if (!this.valid(value)) return prev;

    prev.push([this._key, JSON.stringify(value)]);
    return prev;
  }
}

export const SEARCH_PARAM_BLUEPRINTS_MAP = {
  boolean: (value: boolean) => new BooleanSearchParamBlueprint().defaultValue(value),
  number: (value: number) => new NumberSearchParamBlueprint().defaultValue(value),
  string: (value: string) => new StringSearchParamBlueprint().defaultValue(value),
  enum: <O extends readonly [EnumParamValue, ...EnumParamValue[]]>(value: O[number], options: O) =>
    new EnumSearchParamBlueprint<O>().defaultValue(value).options(options),
  filters: (value: string[], not: string = 'NOT', omit: string = '!') =>
    new FiltersSearchParamBlueprint().defaultValue(value).not(not).omit(omit),
  object: <O extends ObjectParamValue>(value: O) => new ObjectSearchParamBlueprint<O>().defaultValue(value)
} as const;
