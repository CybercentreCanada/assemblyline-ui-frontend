import type { FormHelperTextProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import type React from 'react';

export type RequiredInputSlotProps = {
  label: TypographyProps;
};

export type InputSlotProps = Partial<RequiredInputSlotProps>;

export const DEFAULT_INPUT_SLOT_PROPS: RequiredInputSlotProps = {
  label: null
};

export type RequiredInputProps = {
  /** Shows a small badge indicator. @default false */
  badge: boolean;

  /** Automatically capitalizes text. @default false */
  capitalize: boolean;

  /** Disables the input. @default false */
  disabled: boolean;

  /** Renders a divider around or under the input. @default false */
  divider: boolean;

  /** Element rendered at the end (e.g. icon or button). */
  endAdornment: React.ReactNode;

  /** Only propagates values when they are valid. */
  enforceValidValue: boolean;

  /** Props applied to the error helper text. */
  errorProps: FormHelperTextProps;

  /** Shows an expand/collapse button. @default false */
  expand: boolean;

  /** Props applied to the expand/collapse button. */
  expandProps: IconButtonProps;

  /** Helper or description text displayed under the input. */
  helperText: string;

  /** Props applied to the helper text component. */
  helperTextProps: FormHelperTextProps;

  /** The input element id. */
  id: string;

  /** The label content. */
  label: string;

  /** Props applied to the label typography. */
  labelProps: TypographyProps;

  /** Shows a loading spinner. @default false */
  loading: boolean;

  /** Renders input text using a monospace font. @default false */
  monospace: boolean;

  /** Hides text overflow. @default false */
  overflowHidden: boolean;

  /** Treats the input as a password field. @default false */
  password: boolean;

  /** Placeholder text shown before a value is entered. */
  placeholder: string;

  /** Prevents the disabled greyed-out style. @default false */
  preventDisabledColor: boolean;

  /** Prevents the input from rendering. @default false */
  preventRender: boolean;

  /** Makes the input read-only. @default false */
  readOnly: boolean;

  /** Marks the input as required. @default false */
  required: boolean;

  /** Props applied to the reset button. */
  resetProps: IconButtonProps;

  /** Props applied to the root container element. */
  rootProps: React.HTMLAttributes<HTMLDivElement>;

  /** Element rendered at the start (e.g. icon). */
  startAdornment: React.ReactNode;

  /** Applies a compact "tiny" style. @default false */
  tiny: boolean;

  /** Tooltip content displayed on hover. */
  tooltip: TooltipProps['title'];

  /** Props applied to the tooltip component. */
  tooltipProps: Omit<TooltipProps, 'children' | 'title'>;

  slotProps: InputSlotProps;

  /** Fired when the input loses focus. */
  onBlur: (event: React.SyntheticEvent | Event) => void;

  /** Fired when validation fails. */
  onError: (error: string) => void;

  /** Fired when the expand button is clicked. */
  onExpand: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

  /** Fired when the input gains focus. */
  onFocus: (event: React.SyntheticEvent | Event) => void;
};

export type InputProps = Partial<RequiredInputProps>;

export const DEFAULT_INPUT_PROPS: RequiredInputProps = {
  badge: false,
  capitalize: false,
  disabled: false,
  divider: false,
  endAdornment: null,
  enforceValidValue: false,
  errorProps: null,
  expand: null,
  expandProps: null,
  helperText: null,
  helperTextProps: null,
  id: null,
  label: null,
  labelProps: null,
  loading: false,
  monospace: false,
  overflowHidden: false,
  password: false,
  placeholder: null,
  preventDisabledColor: false,
  preventRender: false,
  readOnly: false,
  required: false,
  resetProps: null,
  rootProps: null,
  startAdornment: null,
  tiny: false,
  tooltip: null,
  tooltipProps: null,

  slotProps: DEFAULT_INPUT_SLOT_PROPS,

  onBlur: () => null,
  onError: () => null,
  onExpand: () => null,
  onFocus: () => null
};
