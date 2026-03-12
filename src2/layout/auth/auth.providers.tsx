import { createFormContext } from 'features/form/createFormContext';

export type AuthFormStore = {
  variant: 'login' | 'loading' | 'locked' | 'quota' | 'tos' | 'routes';
  userpass: {
    username: string;
    password: string;
  };
};

export const DEFAULT_AUTH_FORM_STORE: AuthFormStore = {
  variant: 'login',
  userpass: {
    username: '',
    password: ''
  }
};

export const { FormProvider: AuthFormProvider, useForm: useAuthForm } = createFormContext<AuthFormStore>({
  defaultValues: structuredClone(DEFAULT_AUTH_FORM_STORE)
});
