/** HTTP method verbs. */
export type Method = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';

/** Builder type for constructing an API request. */
export type RequestBuilder<URL extends string = string, M extends Method = 'GET', Body = null> = {
  /** Request body payload. */
  body?: Body;
  /** HTTP method. */
  method?: M;
  /** Request URL. */
  url: URL;
};

/** Normalized API request descriptor. */
export type ApiRequest = {
  /** Request body payload. */
  body?: null | boolean | number | object | string;
  /** HTTP method. */
  method?: Method;
  /** Request URL. */
  url: string;
};

/** Standard API JSON response envelope. */
export type ApiResponse<T = unknown> = {
  /** Error message from the API. */
  api_error_message: string;
  /** Response payload. */
  api_response: T;
  /** Server version string. */
  api_server_version: string;
  /** HTTP status code. */
  api_status_code: number;
  /** Optional human-readable message. */
  message?: string;
};

/** Blob download response envelope. */
export type BlobResponse<T = unknown> = {
  /** Error message from the API. */
  api_error_message: string;
  /** Response payload. */
  api_response: T;
  /** Server version string. */
  api_server_version: string;
  /** HTTP status code. */
  api_status_code: number;
  /** Downloaded filename. */
  filename: string;
  /** File size in bytes. */
  size: number;
  /** MIME type. */
  type: string;
};

/** Normalized return type from API call hooks. */
export type ApiReturn<Response = unknown> = {
  /** Parsed response data. */
  data: Response;
  /** Error message string. */
  error: string;
  /** Server version string. */
  serverVersion: string;
  /** HTTP status code. */
  statusCode: number;
};

/** Query key tuple for TanStack Query caching. */
export type ApiQueryKey = [
  string, // URL
  Method, // Method
  string, // Stringified Body
  boolean // allowCache
];
