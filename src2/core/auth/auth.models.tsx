import { Configuration } from 'models/base/config';
import { WhoAmIProps } from 'models/ui/user';

export type APIResponseProps<APIResponse> = {
  api_error_message: string;
  api_response: APIResponse;
  api_server_version: string;
  api_status_code: number;
};

export type DownloadResponseProps<APIResponse> = {
  api_error_message: string;
  api_response: APIResponse;
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
  onSuccess?: (api_data: APIResponseProps<SuccessData>) => void;
  onFailure?: (api_data: APIResponseProps<FailureData>) => void;
  onEnter?: () => void;
  onExit?: () => void;
  onFinalize?: (api_data: APIResponseProps<unknown>) => void;
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
  apiCall: <SuccessData = any, FailureData = any>(props: APICallProps<SuccessData, FailureData>) => void;
  bootstrap: (props: BootstrapProps) => void;
  downloadBlob: <SuccessData = ReadableStream, FailureData = ReadableStream>(
    props: DownloadBlobProps<SuccessData, FailureData>
  ) => void;
};
