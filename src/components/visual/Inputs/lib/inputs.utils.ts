import type { InputProps, InputStates, InputValues } from 'components/visual/Inputs/lib/inputs.model';

export const getAriaLabel = <T>({ id = null, label = null }: InputValues<T> & InputProps) =>
  (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const getAriaDescribedBy = <T>({
  disabled = false,
  error = () => '',
  helperText = null,
  id = null,
  label = null,
  value
}: InputValues<T> & InputProps) =>
  disabled || !(error(value) || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const isValidValue = <T>(value: T): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

export const isValidNumber = (value: number, { min = null, max = null }: { min?: number; max?: number }): boolean =>
  value == null ? false : (min == null || value >= min) && (max == null || value <= max);

export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  return keysA.length === keysB.length && keysA.every(key => key in b && Object.is(a[key], b[key]));
}

export function deepReconcile<T extends Record<string, unknown>>(
  incoming: Partial<T>,
  existing: Partial<T>,
  initial: Partial<T>
): T {
  const result: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(initial), ...Object.keys(existing), ...Object.keys(incoming)])) {
    if (key in incoming) {
      result[key] = incoming[key];
    } else if (key in existing && key in initial) {
      result[key] = initial[key];
    } else {
      result[key] = existing[key] ?? initial[key];
    }
  }

  return result as T;
}

export function shallowReconcile<T extends Record<string, unknown>>(
  current: Partial<T>,
  previous: Partial<T>,
  result: Partial<T>
): T {
  const output: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(result), ...Object.keys(current), ...Object.keys(previous)])) {
    if (key in current) {
      output[key] = current[key];
    } else if (key in result && key in previous) {
      continue;
    } else if (key in result) {
      output[key] = result[key];
    }
  }

  return output as T;
}

export const parseInputProps = <Props extends InputProps>(props: Props): Props & InputStates => ({
  errorMsg: null,
  focused: false,
  showPassword: true,
  ...props,
  label: props.label ?? '\u00A0',
  id: (props.id || (props.label ?? '\u00A0')).toLowerCase().replaceAll(' ', '-'),
  preventExpandRender: props.expand === null,
  preventPasswordRender: props.loading || props.disabled || props.readOnly || !props.password,
  preventResetRender: props.loading || props.disabled || props.readOnly || !props.reset
});
