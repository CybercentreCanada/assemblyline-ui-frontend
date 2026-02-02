/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import type { InputControllerProps, InputOptions, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import type {
  Coercer,
  CoercersSchema,
  ValidationSchema,
  ValidationStatus,
  Validator
} from 'components/visual/Inputs/utils/inputs.validation';
import { CoercersResolver, ValidationResolver } from 'components/visual/Inputs/utils/inputs.validation';
import type { SyntheticEvent } from 'react';
import { useCallback, useRef, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

/**********************************************************************************************************************
 * Simple Props Hooks
 *********************************************************************************************************************/

/**
 * Returns the label for an input, or a non-breaking space if not defined
 */
export const useInputLabel = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  return get('label') ?? '\u00A0';
};

/**
 * Returns a deterministic input ID, using label if ID not defined
 */
export const useInputId = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const id = get('id');
  const label = get('label');
  return id ?? (typeof label === 'string' ? label.toLowerCase().replaceAll(' ', '-') : '\u00A0');
};

/**
 * Returns whether the clear/reset button should be rendered
 */
export const useShouldRenderClear = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const readOnly = get('readOnly');
  const showClearButton = get('showClearButton');
  return Boolean(showClearButton) && !readOnly && !disabled;
};

/**
 * Returns whether the expand button should be rendered
 */
export const useShouldRenderExpand = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const expand = get('expand');
  return Boolean(expand);
};

/**
 * Returns whether the menu adornment should be rendered
 */
export const useShouldRenderMenu = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const readOnly = get('readOnly');
  const hasMenuAdornment = get('hasMenuAdornment');
  return Boolean(hasMenuAdornment) && !readOnly && !disabled;
};

/**
 * Returns whether the password toggle should be rendered
 */
export const useShouldRenderPassword = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const loading = get('loading');
  const password = get('password');
  const readOnly = get('readOnly');
  return Boolean(password) && !loading && !disabled && !readOnly;
};

/**
 * Returns whether the reset button should be rendered
 */
export const useShouldRenderReset = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const loading = get('loading');
  const readOnly = get('readOnly');
  const reset = get('reset');
  const rawValue = get('rawValue');
  const value = get('value');

  const canReset = typeof reset === 'function' ? reset(value, rawValue) : reset;
  return Boolean(canReset) && !disabled && !readOnly && !loading;
};

/**
 * Returns whether the spinner should be rendered
 */
export const useShouldRenderSpinner = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get] = usePropStore<InputControllerProps<Value, RawValue>>();
  const disabled = get('disabled');
  const readOnly = get('readOnly');
  const showSpinner = get('showSpinner');
  return Boolean(showSpinner) && !readOnly && !disabled;
};

/**********************************************************************************************************************
 * Validation Hooks
 *********************************************************************************************************************/

/**
 * Returns the validation status and message for a given value
 */
export const useValidation = <Value extends unknown = unknown, RawValue = Value>({
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
  const schema = new ValidationResolver<Value, RawValue>({ max, min, validate });
  const resolver = validators(schema) as ValidationResolver<Value, RawValue>;
  return resolver.resolve(t, value, rawValue);
};

/**
 * Returns a callback that resolves validation for a value/rawValue pair
 */
export const useValidationResolver = <Value extends unknown = unknown, RawValue = Value>(): ((
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
      const schema = new ValidationResolver<Value, RawValue>({ max, min, validate });
      const resolver = validators(schema) as ValidationResolver<Value, RawValue>;
      const { status, message } = resolver.resolve(t, value, rawValue);
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
export const useCoerceValue = <Value extends unknown = unknown, RawValue = Value>({
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
export const useCoercingResolver = <Value extends unknown = unknown, RawValue = Value>(): ((
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

/**********************************************************************************************************************
 * Input Event Hooks
 *********************************************************************************************************************/

/**
 * Handles input click with validation and optional enforcement
 */
export const useInputClick = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();
  const [, startTransition] = useTransition();
  const latestId = useRef<number>(0);

  const resolveCoercing = useCoercingResolver<Value, RawValue>();
  const resolveValidation = useValidationResolver<Value, RawValue>();

  const onChange = get('onChange');

  return useCallback(
    (event: SyntheticEvent<Element, Event>, value: Value, rawValue: RawValue) => {
      event.preventDefault();
      event.stopPropagation();

      const { value: coercedValue, ignore } = resolveCoercing(event, value, rawValue);
      const [validationStatus, validationMessage] = resolveValidation(coercedValue, rawValue);
      setStore({ rawValue, validationStatus, validationMessage });

      const id = ++latestId.current;
      startTransition(() => {
        if (id === latestId.current && !ignore) {
          setStore({ value: coercedValue });
          onChange(event, value);
        }
      });
    },
    [onChange, resolveCoercing, resolveValidation, setStore]
  );
};

/**
 * Handles input change events with validation and optional enforcement
 */
export const useInputChange = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();

  const [, startTransition] = useTransition();
  const latestId = useRef<number>(0);

  const resolveCoercing = useCoercingResolver<Value, RawValue>();
  const resolveValidation = useValidationResolver<Value, RawValue>();

  const onChange = get('onChange');

  return useCallback(
    (event: SyntheticEvent<Element, Event>, value: Value, rawValue: RawValue) => {
      const { ignore } = resolveCoercing(event, value, rawValue);
      const [validationStatus, validationMessage] = resolveValidation(value, rawValue);
      setStore({ rawValue, validationStatus, validationMessage });

      const id = ++latestId.current;
      startTransition(() => {
        if (id === latestId.current && !ignore) {
          setStore({ value });
          onChange(event, value);
        }
      });
    },
    [onChange, resolveCoercing, resolveValidation, setStore]
  );
};

/**
 * Handles input focus events
 */
export const useInputFocus = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();
  const onFocus = get('onFocus');

  return useCallback(
    (event: React.FocusEvent) => {
      onFocus(event);
      setStore(s => ({ isFocused: !s.readOnly && !s.disabled && document.activeElement === event.target }));
    },
    [onFocus, setStore]
  );
};

/**
 * Handles input blur events
 */
export const useInputBlur = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();
  const onBlur = get('onBlur');

  const resolveCoercing = useCoercingResolver<Value, RawValue>();
  const resolveValidation = useValidationResolver<Value, RawValue>();

  return useCallback(
    (event: React.FocusEvent, value: Value, rawValue: RawValue) => {
      onBlur(event);
      const { value: coercedValue, ignore } = resolveCoercing(event, value, rawValue);

      if (ignore) {
        const [validationStatus, validationMessage] = resolveValidation(value, rawValue);
        setStore({
          isFocused: false,
          rawValue,
          value,
          validationStatus,
          validationMessage
        });
      } else {
        const [validationStatus, validationMessage] = resolveValidation(coercedValue, rawValue);
        setStore({
          isFocused: false,
          rawValue,
          value: coercedValue,
          validationStatus,
          validationMessage
        });
      }
    },
    [onBlur, resolveCoercing, resolveValidation, setStore]
  );
};

/**
 * Handles input click/blur combined, with coercion and validation
 */
export const useInputClickBlur = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();
  const resolveCoercing = useCoercingResolver<Value, RawValue>();
  const resolveValidation = useValidationResolver<Value, RawValue>();
  const onBlur = get('onBlur');

  return useCallback(
    (event: React.FocusEvent, value: Value, rawValue: RawValue) => {
      onBlur(event);
      const { value: coercedValue, ignore } = resolveCoercing(event, value, rawValue);

      if (ignore) {
        const [validationStatus, validationMessage] = resolveValidation(value, rawValue);
        setStore({
          isFocused: false,
          rawValue,
          value,
          validationStatus,
          validationMessage
        });
      } else {
        const [validationStatus, validationMessage] = resolveValidation(coercedValue, rawValue);
        setStore({
          isFocused: false,
          rawValue,
          value: coercedValue,
          validationStatus,
          validationMessage
        });
      }
    },
    [onBlur, resolveCoercing, resolveValidation, setStore]
  );
};
