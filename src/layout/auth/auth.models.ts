/** Standard API response envelope. */
export type ApiResponseProps<ApiResponse> = {
  /** Error message from the API. */
  api_error_message: string;
  /** Response payload. */
  api_response: ApiResponse;
  /** Server version string. */
  api_server_version: string;
  /** HTTP status code. */
  api_status_code: number;
};

/** Login parameters returned by the unauthenticated API. */
export type LoginParamsProps = {
  /** Whether SAML-based login is allowed. */
  allow_saml_login: boolean;
  /** Whether user/pass signup is allowed. */
  allow_signup: boolean;
  /** Whether user/pass login is allowed. */
  allow_userpass_login: boolean;
  /** List of available OAuth provider identifiers. */
  oauth_providers?: string[];
};

export const DEFAULT_LOGIN_PARAMS: LoginParamsProps = {
  allow_saml_login: false,
  allow_signup: false,
  allow_userpass_login: false,
  oauth_providers: []
};
