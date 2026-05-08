import type {
  FormHelperTextProps,
  ListItemButtonBaseProps,
  ListItemProps,
  ListItemTextProps,
  SkeletonProps,
  TypographyProps
} from '@mui/material';
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
   * The secondary text content of the list item.
   */
  secondary?: ListItemTextProps['secondary'];

  /**
   * Maximum width of the list item.
   */
  width?: CSSProperties['maxWidth'];
};

export const DEFAULT_LIST_INPUT_OPTIONS: ListInputOptions = {
  ...DEFAULT_INPUT_OPTIONS,
  inset: false,
  primary: null,
  secondary: null,
  width: '30%'
};

/**********************************************************************************************************************
 * List Input Slot Props
 *********************************************************************************************************************/
export type ListInputSlotProps = {
  slotProps?: {
    buttonRoot?: Omit<ListItemButtonBaseProps, 'children'>;
    helperText?: FormHelperTextProps;
    inner?: Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;
    primary?: TypographyProps;
    root?: Omit<ListItemProps, 'children'>;
    secondary?: TypographyProps;
    skeleton?: SkeletonProps;
    wrapper?: Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;
  };
};

export const DEFAULT_LIST_INPUT_SLOT_PROPS: ListInputSlotProps = {
  slotProps: {
    buttonRoot: null,
    helperText: null,
    inner: null,
    primary: null,
    root: null,
    secondary: null,
    skeleton: null,
    wrapper: null
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
