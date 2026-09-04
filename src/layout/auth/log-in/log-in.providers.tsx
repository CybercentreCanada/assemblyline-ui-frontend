import { createFormContext } from 'features/form/createFormContext';
import type { LoginFormStore } from 'layout/auth/log-in/log-in.models';
import { DEFAULT_LOGIN_FORM_STORE } from 'layout/auth/log-in/log-in.models';

const loginFormContext = createFormContext<LoginFormStore>({
  defaultValues: structuredClone(DEFAULT_LOGIN_FORM_STORE)
});

/**
 * @name LoginFormProvider
 * @description Wires up the login form store (TanStack React Form) for the login card.
 * @returns A component that must wrap any login page children that call `useLoginForm()`.
 */
export const LoginFormProvider = loginFormContext.FormProvider;

/**
 * @name useLoginForm
 * @description Accessor for the login form store (values, setters, field helpers, subscriptions).
 * @returns The login form API instance for reading/writing login-related fields.
 */
export const useLoginForm = loginFormContext.useForm;
