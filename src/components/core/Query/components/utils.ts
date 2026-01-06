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

/**
 * Recursively serializes a JSON-serializable value into a **deterministic string**.
 *
 * Unlike `JSON.stringify`, this function ensures that object keys are sorted alphabetically,
 * producing a stable string output for the same content. This is useful for caching, query keys,
 * and other scenarios where object reference equality cannot be relied upon.
 *
 * Constraints:
 * - Only works with JSON-serializable values (no functions, Symbols, circular references).
 * - Dates will be converted to ISO strings automatically.
 *
 * @param value - Any JSON-serializable value (object, array, primitive)
 * @returns A deterministic string representation of the value
 */
export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();

  return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(',')}}`;
};
