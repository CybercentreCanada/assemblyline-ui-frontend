import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import type { TFunction } from 'i18next';

/**********************************************************************************************************************
 * Validation
 *********************************************************************************************************************/

/**
 * Possible validation states for inputs
 */
export type ValidationStatus = 'default' | 'info' | 'success' | 'warning' | 'error';

/**
 * Priority order for selecting which validation message to display
 */
export const VALIDATION_PRIORITY: ValidationStatus[] = ['error', 'warning', 'success', 'info', 'default'];

/**
 * Validation function signature
 * @param value - Current parsed value
 * @param rawValue - Raw user-entered input
 */
export type Validator<Value, RawValue> = (
  value: Value,
  rawValue: RawValue
) => { status: ValidationStatus; message: string | null } | null;

/**
 * Builder for input validation rules
 */
export class ValidationSchema<Value, RawValue = Value> {
  protected validators: Validator<Value, RawValue>[] = [];
  protected t: TFunction<'translation', undefined> = null;
  protected min?: number = undefined;
  protected max?: number = undefined;

  constructor(
    { min, max, validate }: Pick<InputControllerProps & { min?: number; max?: number }, 'min' | 'max' | 'validate'>,
    t: TFunction<'translation', undefined>
  ) {
    this.t = t;
    this.min = min;
    this.max = max;

    if (validate) {
      this.validators.push((value, rawValue) => validate(value, rawValue));
    }
  }

  /**
   * Ensures the value is not empty
   */
  required(status: ValidationStatus = 'error', message: string | null = null) {
    this.validators.push((value, rawValue) =>
      value === null || value === undefined || value === ''
        ? { status, message: message || this.t?.('validation.required') || 'This field is required' }
        : null
    );
    return this;
  }

  /**
   * Ensures the value is within min/max bounds (numbers only)
   */
  inRange(status: ValidationStatus = 'error', message: string | null = null) {
    this.validators.push((value, rawValue) => {
      if (typeof value !== 'number' || Number.isNaN(value)) return null;

      const minDefined = typeof this.min === 'number';
      const maxDefined = typeof this.max === 'number';
      if (!minDefined && !maxDefined) return null;

      if (minDefined && maxDefined)
        return { status, message: message || this.t?.('validation.minmax', { min: this.min, max: this.max }) };
      else if (minDefined) return { status, message: message || this.t?.('validation.min', { min: this.min }) };
      else if (maxDefined) return { status, message: message || this.t?.('validation.max', { max: this.max }) };
      else return null;
    });
    return this;
  }

  /**
   * Ensures the value is an integer (numbers only)
   */
  isInteger(status: ValidationStatus = 'warning', message: string | null = null) {
    this.validators.push((value, rawValue) => {
      if (typeof value !== 'number' || Number.isNaN(value)) return null;

      if (!Number.isInteger(value)) {
        return { status, message: message || this.t?.('validation.integer') };
      }
      return null;
    });

    return this;
  }

  /**
   * Ensures string values have no leading/trailing whitespace
   */
  noLeadingTrailingWhitespace(status: ValidationStatus = 'warning', message: string | null = null) {
    this.validators.push((value, rawValue) => {
      if (typeof value !== 'string') return null;
      return value.trim() === value ? null : { status, message: message || this.t?.('validation.noWhitespace') };
    });
    return this;
  }
}

/**
 * Resolves all validators and returns the highest priority validation result
 */
export class ValidationResolver<Value, RawValue = Value> extends ValidationSchema<Value, RawValue> {
  declare public validators: Validator<Value, RawValue>[];

  /**
   * Evaluate all validators and return the most severe validation result
   */
  public resolve(value: Value, rawValue: RawValue) {
    return (
      this.validators
        .map(v => v(value, rawValue))
        .sort(
          (a, b) =>
            VALIDATION_PRIORITY.indexOf(a?.status ?? 'default') - VALIDATION_PRIORITY.indexOf(b?.status ?? 'default')
        )?.[0] || { status: 'default', message: null }
    );
  }
}

/**********************************************************************************************************************
 * Coercer
 *********************************************************************************************************************/

/**
 * Coercer function signature
 * @param event - React synthetic event
 * @param value - Current parsed value
 * @param rawValue - Raw user input
 * @returns Object with coerced value and whether the changes to the value should be ignored
 */
export type Coercer<Value, RawValue = Value> = (
  event: React.SyntheticEvent,
  value: Value,
  rawValue: RawValue
) => { value: Value; ignore: boolean };

/**
 * Builder for coercing (transforming) input values before validation
 */
export class CoercersSchema<Value, RawValue = Value> {
  protected coercers: Coercer<Value, RawValue>[] = [];
  protected min?: number = undefined;
  protected max?: number = undefined;

  constructor({
    min,
    max,
    coerce
  }: Pick<InputControllerProps<Value, RawValue> & { min?: number; max?: number }, 'min' | 'max' | 'coerce'>) {
    this.min = min;
    this.max = max;

    if (coerce) {
      this.coercers.push((event, value, rawValue) => coerce(event, value, rawValue));
    }
  }

  /**
   * Ensures the value is not empty
   */
  required() {
    this.coercers.push((event, value) => {
      if (value === null || value === undefined || value === '') {
        return { value, ignore: true };
      }
      return { value, ignore: false };
    });
    return this;
  }

  /**
   * Convert string values to lowercase
   */
  toLowerCase() {
    this.coercers.push((event, value) =>
      typeof value === 'string' ? { value: value.toLowerCase() as Value, ignore: false } : { value, ignore: false }
    );
    return this;
  }

  /**
   * Convert string values to uppercase
   */
  toUpperCase() {
    this.coercers.push((event, value) =>
      typeof value === 'string' ? { value: value.toUpperCase() as Value, ignore: false } : { value, ignore: false }
    );
    return this;
  }

  /**
   * Ensures the value is within min/max bounds (numbers only)
   */
  inRange() {
    this.coercers.push((event, value) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { value, ignore: false };
      }

      let next = value as number;

      if (typeof this.min === 'number') {
        next = Math.max(this.min, next);
      }

      if (typeof this.max === 'number') {
        next = Math.min(this.max, next);
      }

      return { value: next, ignore: false } as { value: Value; ignore: boolean };
    });

    return this;
  }

  /**
   * Rounds a numeric value to the nearest integer (numbers only)
   */
  round() {
    this.coercers.push((event, value) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { value, ignore: false };
      }

      return { value: Math.round(value), ignore: false } as { value: Value; ignore: boolean };
    });

    return this;
  }

  /**
   * Rounds down a numeric value to the nearest integer (numbers only)
   */
  floor() {
    this.coercers.push((event, value) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { value, ignore: false };
      }

      return { value: Math.floor(value), ignore: false } as { value: Value; ignore: boolean };
    });

    return this;
  }

  /**
   * Rounds up a numeric value to the nearest integer (numbers only)
   */
  ceil() {
    this.coercers.push((event, value) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { value, ignore: false };
      }

      return { value: Math.ceil(value), ignore: false } as { value: Value; ignore: boolean };
    });

    return this;
  }

  /**
   * Rounds a numeric value to N decimal places (numbers only)
   */
  roundTo(decimals: number) {
    const factor = 10 ** decimals;

    this.coercers.push((event, value) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { value, ignore: false };
      }

      return { value: Math.round(value * factor) / factor, ignore: false } as { value: Value; ignore: boolean };
    });

    return this;
  }

  /**
   * Trim whitespace from string values
   */
  trim() {
    this.coercers.push((event, value) =>
      typeof value === 'string' ? { value: value.trim() as Value, ignore: false } : { value, ignore: false }
    );
    return this;
  }
}

/**
 * Resolves all coercers and returns the final value and revert status
 */
export class CoercersResolver<Value, RawValue = Value> extends CoercersSchema<Value, RawValue> {
  declare public coercers: Coercer<Value, RawValue>[];

  public resolve(event: React.SyntheticEvent, value: Value, rawValue: RawValue) {
    let nextValue = value;
    let ignore = false;

    for (const coercer of this.coercers) {
      const { value: v = undefined, ignore: i = false } = coercer(event, nextValue, rawValue);
      nextValue = v === undefined ? value : v;
      ignore = ignore || i;
    }

    return { value: nextValue, ignore };
  }
}
