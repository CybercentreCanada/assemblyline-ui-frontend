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
    (
      event: SyntheticEvent<Element, Event>,
      nextRawValue: RawValue,
      previousRawValue: RawValue = undefined,
      toValue: (value: RawValue) => Value = v => v as unknown as Value
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (nextRawValue === previousRawValue) return;

      const { value: coercedValue, ignore } = resolveCoercing(event, toValue(nextRawValue));
      const [validationStatus, validationMessage] = resolveValidation(coercedValue);
      setStore({ rawValue: nextRawValue, validationStatus, validationMessage });

      const id = ++latestId.current;
      startTransition(() => {
        if (id === latestId.current && !ignore) {
          setStore({ value: coercedValue });
          onChange(event, toValue(nextRawValue));
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
    (
      event: SyntheticEvent<Element, Event>,
      nextRawValue: RawValue,
      previousRawValue: RawValue = undefined,
      toValue: (value: RawValue) => Value = v => v as unknown as Value
    ) => {
      if (nextRawValue === previousRawValue) return;

      const { ignore } = resolveCoercing(event, toValue(nextRawValue));
      const [validationStatus, validationMessage] = resolveValidation(toValue(nextRawValue));
      setStore({ rawValue: nextRawValue, validationStatus, validationMessage });

      const id = ++latestId.current;
      startTransition(() => {
        if (id === latestId.current && !ignore) {
          setStore({ value: toValue(nextRawValue) });
          onChange(event, toValue(nextRawValue));
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
  const handleChange = useInputChange<Value, RawValue>();

  return useCallback(
    (
      event: React.FocusEvent,
      nextRawValue: RawValue,
      previousRawValue: RawValue = undefined,
      toValue: (value: RawValue) => Value = v => v as unknown as Value,
      toRawValue: (value: Value) => RawValue = v => v as unknown as RawValue
    ) => {
      onBlur(event);
      setStore({ isFocused: false });
      const { value: coercedValue, ignore } = resolveCoercing(event, toValue(nextRawValue));
      if (ignore) handleChange(event, nextRawValue, previousRawValue, toValue);
      else handleChange(event, toRawValue(coercedValue), previousRawValue, toValue);
    },
    [handleChange, onBlur, resolveCoercing, setStore]
  );
};

/**
 * Handles input click/blur combined, with coercion and validation
 */
export const useInputClickBlur = <Value extends unknown = unknown, RawValue = Value>() => {
  const [get, setStore] = usePropStore<InputControllerProps<Value, RawValue>>();

  const onBlur = get('onBlur');

  const resolveCoercing = useInputCoercingResolver<Value, RawValue>();
  const handleClick = useInputClick<Value, RawValue>();

  return useCallback(
    (
      event: React.FocusEvent,
      nextRawValue: RawValue,
      previousRawValue: RawValue = undefined,
      toValue: (value: RawValue) => Value = v => v as unknown as Value,
      toRawValue: (value: Value) => RawValue = v => v as unknown as RawValue
    ) => {
      onBlur(event);
      setStore({ isFocused: false });
      const { value: coercedValue, ignore } = resolveCoercing(event, toValue(nextRawValue));
      if (ignore) handleClick(event, nextRawValue, previousRawValue, toValue);
      else handleClick(event, toRawValue(coercedValue), previousRawValue, toValue);
    },
    [handleClick, onBlur, resolveCoercing, setStore]
  );
};
