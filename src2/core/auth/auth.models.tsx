import { Configuration } from 'models/base/config';
import { WhoAmIProps } from 'models/ui/user';
import { z } from 'zod';

const DEFAULT_RETRY_MS = 32;

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

type APICallProps<SuccessData, FailureData> = {
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

type BootstrapProps = {
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: Configuration) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps) => void;
  setReady: (layout: boolean, borealis: boolean, iconifyUrl: string) => void;
  retryAfter?: number;
};

type DownloadBlobProps<SuccessData, FailureData> = {
  url: string;
  onSuccess?: (blob: DownloadResponseProps<SuccessData>) => void;
  onFailure?: (api_data: DownloadResponseProps<FailureData>) => void;
  onEnter?: () => void;
  onExit?: () => void;
  retryAfter?: number;
};

type UseMyAPIReturn = {
  apiCall: <SuccessData = any, FailureData = any>(props: APICallProps<SuccessData, FailureData>) => void;
  bootstrap: (props: BootstrapProps) => void;
  downloadBlob: <SuccessData = ReadableStream, FailureData = ReadableStream>(
    props: DownloadBlobProps<SuccessData, FailureData>
  ) => void;
};

export const AppAuthSettingsSchema = z.object({
  login: z
    .object({
      allow_saml_login: z.boolean().optional(),
      allow_signup: z.boolean().optional(),
      allow_userpass_login: z.boolean().optional(),
      oauth_providers: z.array(z.string()).optional()
    })
    .optional(),
  redirectTo: z.string(),
  preferredMethod: z.string()
});

export type AppAuthSettings = z.infer<typeof AppAuthSettingsSchema>;

export type AppAuthConfig = AppAuthSettings & {
  mode: 'login' | 'loading' | 'locked' | 'quota' | 'tos' | 'app' | 'logout';
};
