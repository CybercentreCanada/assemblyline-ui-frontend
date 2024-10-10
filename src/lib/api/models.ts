export type APIResponse<T = any> = {
  api_error_message: string;
  api_response: T;
  api_server_version: string;
  api_status_code: number;
};

export type BlobResponse = {
  api_error_message: string;
  api_response: unknown;
  api_server_version: string;
  api_status_code: number;
  filename: string;
  size: number;
  type: string;
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
