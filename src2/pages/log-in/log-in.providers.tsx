import { createFormContext } from 'features/form/createFormContext';

export type LoginFormStore = {
  mode: 'login' | 'oauth' | 'otp' | 'reset-password-now' | 'reset-password' | 'saml' | 'sectoken' | 'sign-up';
  inputs: {
    username: string;
    password: string;
    password_confirm: string;
    email: string;
  };
  tokens: {};
  done: boolean;
  disabled: boolean;

  reset_id: string;

  otp: {
    code: string;
  };
  sso: {
    avatar: string;
    username: string;
    email: string;
    oauth_token_id: string;
    saml_token_id: string;
  };
  webauthn: {
    response: number[] | null;
  };
};

export const DEFAULT_LOGIN_FORM_STORE: LoginFormStore = {
  mode: 'login',
  inputs: {
    username: '',
    password: '',
    password_confirm: '',
    email: ''
  },
  tokens: null,
  done: false,
  disabled: false,

  reset_id: '',

  otp: {
    code: ''
  },
  sso: {
    avatar: '',
    username: '',
    email: '',
    oauth_token_id: '',
    saml_token_id: ''
  },
  webauthn: {
    response: null
  }
};

export const { FormProvider: LoginFormProvider, useForm: useLoginForm } = createFormContext<LoginFormStore>({
  defaultValues: structuredClone(DEFAULT_LOGIN_FORM_STORE)
});
