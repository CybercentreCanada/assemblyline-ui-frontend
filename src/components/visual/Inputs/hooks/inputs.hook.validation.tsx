/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import type { InputControllerProps, InputOptions, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import type {
  Coercer,
  CoercersSchema,
  ValidationSchema,
  ValidationStatus,
  Validator
} from 'components/visual/Inputs/utils/inputs.util.validation';
import { CoercersResolver, ValidationResolver } from 'components/visual/Inputs/utils/inputs.util.validation';
import type { SyntheticEvent } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**********************************************************************************************************************
 * Validation Hooks
 *********************************************************************************************************************/

/**
 * Returns the validation status and message for a given value
 */
export const useInputValidation = <Value extends unknown = unknown, RawValue = Value>({
  max,
  min,
  rawValue,
  validate,
  validators = (schema: ValidationSchema<Value, RawValue>) => schema,
  value
}: InputValueModel<Value, RawValue> & InputOptions & { max?: number; min?: number }): ReturnType<
  Validator<Value, RawValue>
> => {
  const { t } = useTranslation(['inputs']);
  const schema = new ValidationResolver<Value, RawValue>({ max, min, validate }, t);
  const resolver = validators(schema) as ValidationResolver<Value, RawValue>;
  return resolver.resolve(value, rawValue);
};

/**
 * Returns a callback that resolves validation for a value/rawValue pair
 */
export const useInputValidationResolver = <Value extends unknown = unknown, RawValue = Value>(): ((
  value: Value,
  rawValue: RawValue
) => [ValidationStatus, string]) => {
  const { t } = useTranslation(['inputs']);
  const [get] = usePropStore<InputControllerProps<Value, RawValue> & { min?: number; max?: number }>();

  const min = get('min');
  const max = get('max');
  const validate = get('validate');
  const validators = get('validators');

  return useCallback(
    (value: Value, rawValue: RawValue) => {
      const schema = new ValidationResolver<Value, RawValue>({ max, min, validate }, t);
      const resolver = validators(schema) as ValidationResolver<Value, RawValue>;
      const { status, message } = resolver.resolve(value, rawValue);
      return [status, message];
    },
    [max, min, t, validate, validators]
  );
};

/**********************************************************************************************************************
 * Coercing Hooks
 *********************************************************************************************************************/

/**
 * Returns the coerced value for a given input
 */
export const useInputCoerceValue = <Value extends unknown = unknown, RawValue = Value>({
  coerce,
  coercers = (schema: CoercersSchema<Value, RawValue>) => schema,
  max,
  min,
  rawValue,
  value
}: InputControllerProps<Value, RawValue> & { max?: number; min?: number }): ReturnType<Coercer<Value, RawValue>> => {
  const schema = new CoercersResolver<Value, RawValue>({ coerce, max, min });
  const resolver = coercers(schema) as CoercersResolver<Value, RawValue>;
  return resolver.resolve(undefined, value, rawValue);
};

/**
 * Returns a callback to resolve coercion on user input
 */
export const useInputCoercingResolver = <Value extends unknown = unknown, RawValue = Value>(): ((
  event: SyntheticEvent,
  value: Value,
  rawValue: RawValue
) => ReturnType<Coercer<Value, RawValue>>) => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue> & { min?: number; max?: number }>();

  const coerce = get('coerce');
  const coercers = get('coercers');
  const max = get('max');
  const min = get('min');

  return useCallback(
    (event: SyntheticEvent, value: Value, rawValue: RawValue) => {
      const schema = new CoercersResolver<Value, RawValue>({ coerce, max, min });
      const resolver = coercers(schema) as CoercersResolver<Value, RawValue>;
      return resolver.resolve(event, value, rawValue);
    },
    [coerce, coercers, max, min]
  );
};
