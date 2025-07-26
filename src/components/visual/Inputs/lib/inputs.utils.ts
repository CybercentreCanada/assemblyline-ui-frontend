import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';

export const getAriaLabel = <T>({ id = null, label = null }: InputProps<T>) =>
  (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const getAriaDescribedBy = <T>({
  disabled = false,
  error = () => '',
  helperText = null,
  id = null,
  label = null,
  value
}: InputProps<T>) =>
  disabled || !(error(value) || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const isValidValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '' && (typeof value !== 'number' || !isNaN(value));

export const isValidNumber = (value: number, { min = null, max = null }: { min?: number; max?: number }): boolean =>
  !isNaN(value) && (min === null || value >= min) && (max === null || value <= max);
