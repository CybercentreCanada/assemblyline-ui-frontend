import type { InputControllerProps } from 'components/visual/Inputs/lib/inputs.model';
import { isValidNumber } from 'components/visual/Inputs/lib/inputs.utils';
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
 * @param t - Optional translation function
 */
export type Validator<Value, RawValue> = (
  value: Value,
  rawValue: RawValue,
  t?: TFunction<'translation', undefined>
) => { status: ValidationStatus; message: string | null } | null;

/**
 * Builder for input validation rules
 */
export class ValidationSchema<Value, RawValue = Value> {
  protected validators: Validator<Value, RawValue>[] = [];
  protected min?: number = undefined;
  protected max?: number = undefined;

  constructor({
    min,
    max,
    validate
  }: Pick<InputControllerProps & { min?: number; max?: number }, 'min' | 'max' | 'validate'>) {
    this.min = min;
    this.max = max;

    if (validate) {
      this.validators.push((value, rawValue, t) => validate(value, rawValue, t));
    }
  }

  /**
   * Ensures the value is not empty
   */
  required(status: ValidationStatus = 'error', message: string | null = null) {
    this.validators.push((value, rawValue, t) =>
      value === null || value === undefined || value === ''
        ? { status, message: message || t?.('validation.required') || 'This field is required' }
        : null
    );
    return this;
  }

  /**
   * Ensures the value is within min/max bounds (numbers only)
   */
  inRange(status: ValidationStatus = 'error', message: string | null = null) {
    this.validators.push((value, rawValue, t) => {
      if (this.min !== undefined || this.max !== undefined) {
        if (!isValidNumber(value as number, { min: this.min, max: this.max })) {
          if (typeof this.min === 'number' && typeof this.max === 'number')
            return { status, message: message || t?.('validation.minmax', { min: this.min, max: this.max }) };
          if (typeof this.min === 'number')
            return { status, message: message || t?.('validation.min', { min: this.min }) };
          if (typeof this.max === 'number')
            return { status, message: message || t?.('validation.max', { max: this.max }) };
        }
      }
      return null;
    });
    return this;
  }

  /**
   * Ensures string values have no leading/trailing whitespace
   */
  noLeadingTrailingWhitespace(status: ValidationStatus = 'warning', message: string | null = null) {
    this.validators.push((value, rawValue, t) => {
      if (typeof value !== 'string') return null;
      return value.trim() === value ? null : { status, message: message || t?.('validation.noWhitespace') };
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
  public resolve(t: TFunction<'translation', undefined>, value: Value, rawValue: RawValue) {
    return (
      this.validators
        .map(v => v(value, rawValue, t))
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
 * @returns Object with coerced value and whether the input should revert
 */
export type Coercer<Value, RawValue> = (
  event: React.SyntheticEvent,
  value: Value,
  rawValue: RawValue
) => { value: Value; revert: boolean };

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
   * Trim whitespace from string values
   */
  trim() {
    this.coercers.push((event, value, rawValue) =>
      typeof value === 'string' ? { value: value.trim() as Value, revert: false } : { value, revert: false }
    );
    return this;
  }

  /**
   * Convert string values to lowercase
   */
  toLowerCase() {
    this.coercers.push((event, value, rawValue) =>
      typeof value === 'string' ? { value: value.toLowerCase() as Value, revert: false } : { value, revert: false }
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
    let revert = false;

    for (const coercer of this.coercers) {
      const { value: v, revert: r } = coercer(event, nextValue, rawValue);
      nextValue = v;
      revert = revert || r;
    }

    return { value: nextValue, revert };
  }
}
