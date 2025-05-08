import type { APIResponse, BlobResponse } from 'components/core/Query/components/api.models';

export const isAPIData = (value: object): value is APIResponse =>
  value !== undefined &&
  value !== null &&
  'api_response' in value &&
  'api_error_message' in value &&
  'api_server_version' in value &&
  'api_status_code' in value;

// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
const getValue = (key, ...responses) => responses?.find(r => !!r?.[key])?.[key] || null;

export const getAPIResponse = <R, E>(data: APIResponse<R>, error: APIResponse<E>, failureReason: APIResponse<E>) => ({
  statusCode: getValue('api_status_code', data, error, failureReason) as number,
  serverVersion: getValue('api_server_version', data, error, failureReason) as string,
  data: getValue('api_response', data, error, failureReason) as R,
  error: getValue('api_error_message', data, error, failureReason) as E
});

export const getBlobResponse = <R, E>(data: BlobResponse, error: APIResponse<E>, failureReason: APIResponse<E>) => ({
  statusCode: getValue('api_status_code', data, error, failureReason) as number,
  serverVersion: getValue('api_server_version', data, error, failureReason) as string,
  data: getValue('api_response', data, error, failureReason) as R,
  error: getValue('api_error_message', data, error, failureReason) as E,
  filename: getValue('filename', data, error, failureReason) as string,
  size: getValue('size', data, error, failureReason) as number,
  type: getValue('type', data, error, failureReason) as string
});
