import type { InputControllerProps } from 'components/visual/Inputs/lib/inputs.model';
import { isValidNumber } from 'components/visual/Inputs/lib/inputs.utils';
import type { TFunction } from 'i18next';

//************************************************************************************
// Validation
//************************************************************************************
export type ValidationStatus = 'default' | 'info' | 'success' | 'warning' | 'error';

export const VALIDATION_PRIORITY: ValidationStatus[] = ['error', 'warning', 'success', 'info', 'default'];

export type Validator<Value, RawValue> = (
  t: TFunction<'translation', undefined>,
  value: Value,
  rawValue: RawValue
) => { status: ValidationStatus; message: string | null };

export class ValidationSchema<Value, RawValue = Value> {
  protected validators: Validator<Value, RawValue>[] = [];
  protected min: number = null;
  protected max: number = null;

  constructor({
    min,
    max,
    validate
  }: Pick<InputControllerProps & { max?: number; min?: number }, 'max' | 'min' | 'validate'>) {
    this.min = min;
    this.max = max;

    if (validate) {
      this.validators.push((t, value, rawValue) => validate(value, rawValue));
    }
  }

  public required(status: ValidationStatus = 'error', message: string = null) {
    this.validators.push((t, value) =>
      value === null || value === undefined || value === ''
        ? { status, message: message || t('validation.required') }
        : null
    );
    return this;
  }

  public inBound(status: ValidationStatus = 'error', message: string = null) {
    this.validators.push((t, value) => {
      if (this.min != null || this.max != null) {
        if (!isValidNumber(value as number, { min: this.min, max: this.max })) {
          if (typeof this.min === 'number' && typeof this.max === 'number')
            return { status, message: message || t('validation.minmax', { min: this.min, max: this.max }) };
          if (typeof this.min === 'number')
            return { status, message: message || t('validation.min', { min: this.min }) };
          if (typeof this.max === 'number')
            return { status, message: message || t('validation.max', { max: this.max }) };
        }
      }
    });
    return this;
  }

  public noWhitespace(status: ValidationStatus = 'warning', message: string = null) {
    this.validators.push((t, value) => {
      if (typeof value !== 'string') return null;
      return value.trim() === value ? null : { status, message: message || t('validation.noWhitespace') };
    });
    return this;
  }
}

export class ValidationResolver<Value, RawValue = Value> extends ValidationSchema<Value, RawValue> {
  declare public validators: Validator<Value, RawValue>[];

  public resolve(t: TFunction<'translation', undefined>, value: Value, rawValue: RawValue) {
    return (
      this.validators
        .map(v => v(t, value, rawValue))
        .sort(
          (a, b) =>
            VALIDATION_PRIORITY.indexOf(a?.status ?? 'default') - VALIDATION_PRIORITY.indexOf(b?.status ?? 'default')
        )?.[0] || { status: 'default', message: null }
    );
  }
}

//************************************************************************************
// Coercer
//************************************************************************************

export type Coercer<Value, RawValue> = (event: React.SyntheticEvent, value: Value, rawValue: RawValue) => Value;

export class CoercersSchema<Value, RawValue> {
  protected coercers: Coercer<Value, RawValue>[] = [];
  protected min: number = null;
  protected max: number = null;

  constructor({
    min,
    max,
    coerce
  }: Pick<InputControllerProps<Value, RawValue> & { max?: number; min?: number }, 'max' | 'min' | 'coerce'>) {
    this.min = min;
    this.max = max;

    if (coerce) {
      this.coercers.push((event, value, rawValue) => coerce(event, value, rawValue));
    }
  }

  trim() {
    this.coercers.push((event, value) => (typeof value === 'string' ? (value.trim() as Value) : value));
    return this;
  }

  toLowerCase() {
    this.coercers.push((event, value) => (typeof value === 'string' ? (value.toLowerCase() as Value) : value));
    return this;
  }
}

export class CoercersResolver<Value, RawValue = Value> extends CoercersSchema<Value, RawValue> {
  declare public coercers: Coercer<Value, RawValue>[];

  public resolve(event: React.SyntheticEvent, value: Value, rawValue: RawValue) {
    let nextValue = value;
    for (const c of this.coercers) {
      nextValue = c(event, nextValue, rawValue);
    }
    return nextValue;
  }
}
