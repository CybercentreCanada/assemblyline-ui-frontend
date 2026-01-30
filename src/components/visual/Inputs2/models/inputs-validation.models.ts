export type ValidationState = 'default' | 'info' | 'success' | 'warning' | 'error';

export const VALIDATION_PRIORITY: ValidationState[] = ['error', 'warning', 'success', 'info', 'default'];

export type ValidationStatus = {
  state?: ValidationState;
  message?: string;
};
