import type { Method } from 'components/models/utils/request';

export type APIRequest = {
  url: string;
  method?: Method;
  body?: null | boolean | number | string | object;
};

export type APIResponse<T = unknown> = {
  api_error_message: string;
  api_response: T;
  api_server_version: string;
  api_status_code: number;
};

export type BlobResponse<T = unknown> = {
  api_error_message: string;
  api_response: T;
  api_server_version: string;
  api_status_code: number;
  filename: string;
  size: number;
  type: string;
};

export type APIReturn<Response = unknown> = {
  data: Response;
  error: string;
  serverVersion: string;
  statusCode: number;
};

export type APIQueryKey<Body extends object = object> = {
  body: Body;
  contentType: string;
  enabled: boolean;
  method: string;
  reloadOnUnauthorize: boolean;
  url: string;
  [key: string]: unknown;
};
