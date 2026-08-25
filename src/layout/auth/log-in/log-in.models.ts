/** Step currently rendered by the login card. */
export const LOGIN_MODE = [
  'loading',
  'log-in',
  'otp',
  'reset-password-confirmation',
  'reset-password-request',
  'sectoken',
  'sign-up-confirmation',
  'sign-up-request',
  'sso'
] as const;

export type LoginMode = (typeof LOGIN_MODE)[number];

/** Form state backing every step of the login flow. */
export type LoginFormStore = {
  /** Avatar returned by the identity provider. */
  avatar: string;
  /** Email address used for sign-up and password reset. */
  email: string;
  /** Message displayed while a request is in flight. */
  loading: string;
  /** Step currently rendered by the login card. */
  mode: LoginMode;
  /** Temporary token issued by the OAuth provider. */
  oauth_token_id: string;
  /** One-time password submitted for two-factor authentication. */
  otp_code: string;
  /** Password submitted for user/pass authentication. */
  password: string;
  /** Password confirmation submitted during sign-up and password reset. */
  password_confirm: string;
  /** Key sent by email to confirm a sign-up request. */
  registration_key: string;
  /** Identifier sent by email to confirm a password reset. */
  reset_id: string;
  /** Temporary token issued by the SAML provider. */
  saml_token_id: string;
  /** Username submitted for user/pass authentication. */
  username: string;
  /** Assertion returned by the WebAuthn security token. */
  webauthn_auth_resp: number[];
};

export const DEFAULT_LOGIN_FORM_STORE: LoginFormStore = {
  avatar: null,
  email: null,
  loading: null,
  mode: 'log-in',
  oauth_token_id: null,
  otp_code: null,
  password: null,
  password_confirm: null,
  registration_key: null,
  reset_id: null,
  saml_token_id: null,
  username: null,
  webauthn_auth_resp: null
};
