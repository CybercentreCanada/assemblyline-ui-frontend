import type { Configuration } from 'models/base/config';
import type { WhoAmIProps } from 'models/ui/user';

export type ApiResponseProps<ApiResponse> = {
  api_error_message: string;
  api_response: ApiResponse;
  api_server_version: string;
  api_status_code: number;
};

export type DownloadResponseProps<ApiResponse> = {
  api_error_message: string;
  api_response: ApiResponse;
  api_server_version: string;
  api_status_code: number;
  filename?: string;
  type?: string;
  size?: number;
};

export type LoginParamsProps = {
  oauth_providers?: string[];
  allow_userpass_login: boolean;
  allow_signup: boolean;
  allow_saml_login: boolean;
};

export type APICallProps<SuccessData, FailureData> = {
  url: string;
  contentType?: string;
  method?: string;
  body?: boolean | string | object;
  reloadOnUnauthorize?: boolean;
  allowCache?: boolean;
  onSuccess?: (api_data: ApiResponseProps<SuccessData>) => void;
  onFailure?: (api_data: ApiResponseProps<FailureData>) => void;
  onEnter?: () => void;
  onExit?: () => void;
  onFinalize?: (api_data: ApiResponseProps<unknown>) => void;
  retryAfter?: number;
};

export type BootstrapProps = {
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: Configuration) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps) => void;
  setReady: (layout: boolean, borealis: boolean, iconifyUrl: string) => void;
  retryAfter?: number;
};

export type DownloadBlobProps<SuccessData, FailureData> = {
  url: string;
  onSuccess?: (blob: DownloadResponseProps<SuccessData>) => void;
  onFailure?: (api_data: DownloadResponseProps<FailureData>) => void;
  onEnter?: () => void;
  onExit?: () => void;
  retryAfter?: number;
};

export type UseMyAPIReturn = {
  apiCall: <SuccessData = unknown, FailureData = unknown>(props: APICallProps<SuccessData, FailureData>) => void;
  bootstrap: (props: BootstrapProps) => void;
  downloadBlob: <SuccessData = ReadableStream, FailureData = ReadableStream>(
    props: DownloadBlobProps<SuccessData, FailureData>
  ) => void;
};
