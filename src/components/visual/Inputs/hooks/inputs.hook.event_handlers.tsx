/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  useInputCoercingResolver,
  useInputValidationResolver
} from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import type { SyntheticEvent } from 'react';
import { useCallback, useRef, useTransition } from 'react';

/**
 * Handles input click with validation and optional enforcement
 */
export const useInputClick = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();
  const [, startTransition] = useTransition();
  const latestId = useRef<number>(0);

  const resolveCoercing = useInputCoercingResolver<Value, RawValue>();
  const resolveValidation = useInputValidationResolver<Value, RawValue>();

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

  const resolveCoercing = useInputCoercingResolver<Value, RawValue>();
  const resolveValidation = useInputValidationResolver<Value, RawValue>();

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

  const resolveCoercing = useInputCoercingResolver<Value, RawValue>();
  const resolveValidation = useInputValidationResolver<Value, RawValue>();

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
  const resolveCoercing = useInputCoercingResolver<Value, RawValue>();
  const resolveValidation = useInputValidationResolver<Value, RawValue>();
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
