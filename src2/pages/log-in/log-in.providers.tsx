import { createFormContext } from 'features/form/createFormContext';

export type LoginFormStore = {
  mode:
    | 'loading'
    | 'log-in'
    | 'otp'
    | 'reset-password-confirmation'
    | 'reset-password-request'
    | 'sectoken'
    | 'sign-up-confirmation'
    | 'sign-up-request'
    | 'sso';

  avatar: string;
  username: string;
  password: string;
  password_confirm: string;
  email: string;

  reset_id: string;
  otp_code: string;
  registration_key: string;

  oauth_token_id: string;
  saml_token_id: string;
  webauthn_auth_resp: number[];

  loading: string;
};

export const DEFAULT_LOGIN_FORM_STORE: LoginFormStore = {
  mode: 'log-in',

  avatar: null,
  username: null,
  password: null,
  password_confirm: null,
  email: null,

  reset_id: null,
  otp_code: null,
  registration_key: null,

  oauth_token_id: null,
  saml_token_id: null,
  webauthn_auth_resp: null,

  loading: null
};

export const { FormProvider: LoginFormProvider, useForm: useLoginForm } = createFormContext<LoginFormStore>({
  defaultValues: structuredClone(DEFAULT_LOGIN_FORM_STORE)
});
