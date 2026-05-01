import type { APIResponse, BlobResponse } from './api.models';

/**
 * @name isObject
 * @description Checks whether a value is a plain object (not null and not an array).
 * @param variable - The value to check
 * @returns True if the value is a plain object
 */
export const isObject = (variable: unknown) =>
  variable !== null && typeof variable === 'object' && !Array.isArray(variable);

//*****************************************************************************************
// isAPIData
//*****************************************************************************************

/**
 * @name isAPIData
 * @description Type guard that checks whether a value conforms to the APIResponse shape.
 * @param value - The object to check
 * @returns True if the value is an APIResponse
 */
export const isAPIData = (value: object): value is APIResponse =>
  value !== undefined &&
  value !== null &&
  'api_response' in value &&
  'api_error_message' in value &&
  'api_server_version' in value &&
  'api_status_code' in value;

//*****************************************************************************************
// getValue
//*****************************************************************************************

/**
 * @name getValue
 * @description Extracts the first non-falsy value for a given key across multiple response objects.
 * @param key - The property key to look up
 * @param responses - One or more response objects to search
 * @returns The first truthy value found, or null
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
export const getValue = (key, ...responses) => responses?.find(r => !!r?.[key])?.[key] || null;

//*****************************************************************************************
// getAPIResponse
//*****************************************************************************************

/**
 * @name getAPIResponse
 * @description Normalizes query data, error, and failureReason into a single flat response object.
 * @param data - The successful API response
 * @param error - The error API response
 * @param failureReason - The failure reason API response
 * @returns A normalized object with statusCode, serverVersion, data, and error
 */
export const getAPIResponse = <R, E>(data: APIResponse<R>, error: APIResponse<E>, failureReason: APIResponse<E>) => ({
  statusCode: getValue('api_status_code', data, error, failureReason) as number,
  serverVersion: getValue('api_server_version', data, error, failureReason) as string,
  data: getValue('api_response', data, error, failureReason) as R,
  error: getValue('api_error_message', data, error, failureReason) as E
});

//*****************************************************************************************
// getBlobResponse
//*****************************************************************************************

/**
 * @name getBlobResponse
 * @description Normalizes blob query data, error, and failureReason into a single flat response object including file metadata.
 * @param data - The successful blob response
 * @param error - The error API response
 * @param failureReason - The failure reason API response
 * @returns A normalized object with statusCode, serverVersion, data, error, filename, size, and type
 */
export const getBlobResponse = <R, E>(data: BlobResponse, error: APIResponse<E>, failureReason: APIResponse<E>) => ({
  statusCode: getValue('api_status_code', data, error, failureReason) as number,
  serverVersion: getValue('api_server_version', data, error, failureReason) as string,
  data: getValue('api_response', data, error, failureReason) as R,
  error: getValue('api_error_message', data, error, failureReason) as E,
  filename: getValue('filename', data, error, failureReason) as string,
  size: getValue('size', data, error, failureReason) as number,
  type: getValue('type', data, error, failureReason) as string
});

//*****************************************************************************************
// stableStringify
//*****************************************************************************************

/**
 * @name stableStringify
 * @description Recursively serializes a JSON-serializable value into a deterministic string
 * with object keys sorted alphabetically. Useful for caching and query keys.
 * @param value - Any JSON-serializable value (object, array, primitive)
 * @returns A deterministic string representation of the value
 */
export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();

  return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(',')}}`;
};
