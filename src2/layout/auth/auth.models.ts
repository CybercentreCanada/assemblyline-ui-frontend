import type { WhoAmIProps } from 'models/api/user';
import type { Configuration } from 'models/base/config';

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

/** Download response envelope with blob metadata. */
export type DownloadResponseProps<ApiResponse> = {
  /** Error message from the API. */
  api_error_message: string;
  /** Response payload. */
  api_response: ApiResponse;
  /** Server version string. */
  api_server_version: string;
  /** HTTP status code. */
  api_status_code: number;
  /** Downloaded filename. */
  filename?: string;
  /** File size in bytes. */
  size?: number;
  /** MIME type. */
  type?: string;
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

/** Props for making an API call with callbacks. */
export type APICallProps<SuccessData, FailureData> = {
  /** Whether to cache the response in TanStack Query. */
  allowCache?: boolean;
  /** Request body payload. */
  body?: boolean | object | string;
  /** Content-Type header override. */
  contentType?: string;
  /** HTTP method. */
  method?: string;
  /** Callback invoked before the request starts. */
  onEnter?: () => void;
  /** Callback invoked after the request ends (regardless of result). */
  onExit?: () => void;
  /** Callback invoked on failed response. */
  onFailure?: (api_data: ApiResponseProps<FailureData>) => void;
  /** Callback invoked after success or failure. */
  onFinalize?: (api_data: ApiResponseProps<unknown>) => void;
  /** Callback invoked on successful response. */
  onSuccess?: (api_data: ApiResponseProps<SuccessData>) => void;
  /** Whether to force page reload on 401. */
  reloadOnUnauthorize?: boolean;
  /** Delay in ms before retrying the request. */
  retryAfter?: number;
  /** Request URL. */
  url: string;
};

/** Props for bootstrapping the application. */
export type BootstrapProps = {
  /** Retry delay in ms. */
  retryAfter?: number;
  /** Callback to set the current configuration. */
  setConfiguration: (cfg: Configuration) => void;
  /** Callback to set login parameters. */
  setLoginParams: (params: LoginParamsProps) => void;
  /** Callback to mark the application ready. */
  setReady: (layout: boolean, borealis: boolean, iconifyUrl: string) => void;
  /** Callback to set the current user. */
  setUser: (user: WhoAmIProps) => void;
  /** Callback to switch the active rendered app. */
  switchRenderedApp: (value: string) => void;
};

/** Props for downloading a blob with callbacks. */
export type DownloadBlobProps<SuccessData, FailureData> = {
  /** Callback invoked before the request starts. */
  onEnter?: () => void;
  /** Callback invoked after the request ends. */
  onExit?: () => void;
  /** Callback invoked on failed response. */
  onFailure?: (api_data: DownloadResponseProps<FailureData>) => void;
  /** Callback invoked on successful blob download. */
  onSuccess?: (blob: DownloadResponseProps<SuccessData>) => void;
  /** Retry delay in ms. */
  retryAfter?: number;
  /** Request URL. */
  url: string;
};

export type UseMyAPIReturn = {
  apiCall: <SuccessData = unknown, FailureData = unknown>(props: APICallProps<SuccessData, FailureData>) => void;
  bootstrap: (props: BootstrapProps) => void;
  downloadBlob: <SuccessData = ReadableStream, FailureData = ReadableStream>(
    props: DownloadBlobProps<SuccessData, FailureData>
  ) => void;
};
