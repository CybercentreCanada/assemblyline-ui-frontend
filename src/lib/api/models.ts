export type APIResponse<T = any> = {
  api_error_message: string;
  api_response: T;
  api_server_version: string;
  api_status_code: number;
};

export type APIReturn<Response> = {
  statusCode: number;
  serverVersion: string;
  data: Response;
  error: string;
};

export type APIQueryKey<Body extends object = object> = {
  url: string;
  contentType: string;
  method: string;
  body: Body;
  reloadOnUnauthorize: boolean;
  enabled: boolean;
  [key: string]: unknown;
};

export type ApiCallProps<Body extends object = object> = {
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  enabled?: boolean;
};
