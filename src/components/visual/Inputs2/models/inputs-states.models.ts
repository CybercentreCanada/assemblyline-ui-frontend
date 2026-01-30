export type RequiredInputStates = {
  /** Shows the clear adornment. @default false */
  clearAdornment?: boolean;

  /** Current error message displayed below the input. */
  errorMessage?: string;

  /** Indicates whether the input is focused. @default false */
  focused?: boolean;

  /** Indicates whether the input has a menu end adornment. @default false */
  menuAdornment?: boolean;

  /** Indicates whether the menu is open. @default false */
  showMenu?: boolean;

  /** Indicates whether the password is visible. @default true */
  showPassword?: boolean;

  /** Shows the spinner adornment. @default false */
  spinnerAdornment?: boolean;
};

export type InputStates = Partial<RequiredInputStates>;

export const DEFAULT_INPUT_STATES: RequiredInputStates = {
  clearAdornment: false,
  errorMessage: null,
  focused: false,
  menuAdornment: false,
  showMenu: false,
  showPassword: true,
  spinnerAdornment: false
};
