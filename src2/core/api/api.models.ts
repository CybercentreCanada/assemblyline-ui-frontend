export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type RequestBuilder<URL extends string = string, M extends Method = 'GET', Body = null> = {
  url: URL;
  method?: M;
  body?: Body;
};

export type ApiRequest = {
  url: string;
  method?: Method;
  body?: null | boolean | number | string | object;
};

export type ApiResponse<T = unknown> = {
  message?: string;
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

export type ApiReturn<Response = unknown> = {
  data: Response;
  error: string;
  serverVersion: string;
  statusCode: number;
};

export type ApiQueryKey = [
  string, // URL
  Method, // Method
  string, // Stringified Body
  boolean // allowCache
];
