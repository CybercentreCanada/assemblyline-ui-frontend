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
