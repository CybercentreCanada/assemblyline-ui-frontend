import type { FormHelperTextProps, ListItemTextProps, TypographyProps } from '@mui/material';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  DEFAULT_INPUT_OPTIONS,
  DEFAULT_INPUT_RUNTIME_STATE,
  DEFAULT_INPUT_VALUE_MODEL
} from 'components/visual/Inputs/models/inputs.model';
import type { CSSProperties } from 'react';

/**********************************************************************************************************************
 * List Input Options (visual + behavioral configuration)
 *********************************************************************************************************************/
export type ListInputOptions = Omit<InputOptions, 'label' | 'labelProps'> & {
  /**
   * If `true`, applies an inset layout to the list item content.
   * @default false
   */
  inset?: boolean;

  /**
   * The primary text content of the list item.
   */
  primary?: ListItemTextProps['primary'];

  /**
   * Props applied to the primary text typography.
   */
  primaryProps?: TypographyProps;

  /**
   * The secondary text content of the list item.
   */
  secondary?: ListItemTextProps['secondary'];

  /**
   * Props applied to the secondary text typography.
   */
  secondaryProps?: TypographyProps;

  /**
   * Maximum width of the list item.
   */
  width?: CSSProperties['maxWidth'];
};

export const DEFAULT_LIST_INPUT_OPTIONS: ListInputOptions = {
  ...DEFAULT_INPUT_OPTIONS,
  inset: false,
  primary: null,
  primaryProps: null,
  secondary: null,
  secondaryProps: null,
  width: '30%'
};

/**********************************************************************************************************************
 * List Input Slot Props
 *********************************************************************************************************************/
export type ListInputSlotProps = {
  slotProps?: {
    // formControl?: FormControlProps;
    // formLabel?: TypographyProps;
    // formLabelTooltip?: Omit<TooltipProps, 'children' | 'title'>;
    helperText?: FormHelperTextProps;
    // root?: React.HTMLAttributes<HTMLDivElement>;
    // skeleton?: SkeletonProps;
    // resetAdornment?: IconButtonProps;
  };
};

export const DEFAULT_LIST_INPUT_SLOT_PROPS: ListInputSlotProps = {
  slotProps: {
    // formControl: null,
    // formLabel: null,
    // formLabelTooltip: null,
    helperText: null
    // root: null,
    // skeleton: null,
    // resetAdornment: null
  }
};

/**********************************************************************************************************************
 * Combined Internal Controller Props
 *********************************************************************************************************************/
export type ListInputControllerProps<Value = unknown, RawValue = Value> = InputValueModel<Value> &
  ListInputOptions &
  InputRuntimeState<RawValue> &
  ListInputSlotProps;

export const DEFAULT_LIST_INPUT_CONTROLLER_PROPS: ListInputControllerProps = {
  ...DEFAULT_INPUT_VALUE_MODEL,
  ...DEFAULT_INPUT_RUNTIME_STATE,
  ...DEFAULT_LIST_INPUT_OPTIONS,
  ...DEFAULT_LIST_INPUT_SLOT_PROPS
};
