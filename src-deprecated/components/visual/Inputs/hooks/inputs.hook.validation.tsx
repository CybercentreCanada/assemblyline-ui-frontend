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
  validate,
  validators = (schema: ValidationSchema<Value>) => schema,
  value
}: InputValueModel<Value> & InputOptions & { max?: number; min?: number }): ReturnType<Validator<Value>> => {
  const { t } = useTranslation(['inputs']);
  const schema = new ValidationResolver<Value>({ max, min, validate }, t);
  const resolver = validators(schema) as ValidationResolver<Value>;
  return resolver.resolve(value);
};

/**
 * Returns a callback that resolves validation for a value/rawValue pair
 */
export const useInputValidationResolver = <Value extends unknown = unknown, RawValue = Value>(): ((
  value: Value
) => [ValidationStatus, string]) => {
  const { t } = useTranslation(['inputs']);
  const [get] = usePropStore<InputControllerProps<Value, RawValue> & { min?: number; max?: number }>();

  const min = get('min');
  const max = get('max');
  const validate = get('validate');
  const validators = get('validators');

  return useCallback(
    (value: Value) => {
      const schema = new ValidationResolver<Value>({ max, min, validate }, t);
      const resolver = validators(schema) as ValidationResolver<Value>;
      const { status, message } = resolver.resolve(value);
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
  coercers = (schema: CoercersSchema<Value>) => schema,
  max,
  min,
  value
}: InputControllerProps<Value, RawValue> & { max?: number; min?: number }): ReturnType<Coercer<Value>> => {
  const schema = new CoercersResolver<Value>({ coerce, max, min });
  const resolver = coercers(schema) as CoercersResolver<Value>;
  return resolver.resolve(undefined, value);
};

/**
 * Returns a callback to resolve coercion on user input
 */
export const useInputCoercingResolver = <Value extends unknown = unknown, RawValue = Value>(): ((
  event: SyntheticEvent,
  value: Value
) => ReturnType<Coercer<Value>>) => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue> & { min?: number; max?: number }>();

  const coerce = get('coerce');
  const coercers = get('coercers');
  const max = get('max');
  const min = get('min');

  return useCallback(
    (event: SyntheticEvent, value: Value) => {
      const schema = new CoercersResolver<Value>({ coerce, max, min });
      const resolver = coercers(schema) as CoercersResolver<Value>;
      return resolver.resolve(event, value);
    },
    [coerce, coercers, max, min]
  );
};
