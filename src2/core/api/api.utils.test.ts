import { describe, expect, it } from 'vitest';
import type { ApiResponse, BlobResponse } from './api.models';
import { getApiResponse, getBlobResponse, getValue, isApiData, stableStringify } from './api.utils';

//*****************************************************************************************
// isAPIData
//*****************************************************************************************
describe('isAPIData', () => {
  it('returns true for a valid APIResponse object', () => {
    const value = {
      api_response: 'data',
      api_error_message: '',
      api_server_version: '1.0.0',
      api_status_code: 200
    };
    expect(isApiData(value)).toBe(true);
  });

  it('returns false when api_response is missing', () => {
    const value = {
      api_error_message: '',
      api_server_version: '1.0.0',
      api_status_code: 200
    };
    expect(isApiData(value)).toBe(false);
  });

  it('returns false when api_error_message is missing', () => {
    const value = {
      api_response: 'data',
      api_server_version: '1.0.0',
      api_status_code: 200
    };
    expect(isApiData(value)).toBe(false);
  });

  it('returns false when api_server_version is missing', () => {
    const value = {
      api_response: 'data',
      api_error_message: '',
      api_status_code: 200
    };
    expect(isApiData(value)).toBe(false);
  });

  it('returns false when api_status_code is missing', () => {
    const value = {
      api_response: 'data',
      api_error_message: '',
      api_server_version: '1.0.0'
    };
    expect(isApiData(value)).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isApiData({})).toBe(false);
  });

  it('returns true even when api_response is null', () => {
    const value = {
      api_response: null,
      api_error_message: '',
      api_server_version: '1.0.0',
      api_status_code: 200
    };
    expect(isApiData(value)).toBe(true);
  });
});

//*****************************************************************************************
// getValue
//*****************************************************************************************
describe('getValue', () => {
  it('returns the value from the first response that has the key', () => {
    const r1 = { api_status_code: 200 };
    const r2 = { api_status_code: 500 };
    expect(getValue('api_status_code', r1, r2)).toBe(200);
  });

  it('skips responses where the key is falsy and returns the first truthy one', () => {
    const r1 = { api_status_code: 0 };
    const r2 = { api_status_code: 404 };
    expect(getValue('api_status_code', r1, r2)).toBe(404);
  });

  it('returns null when no response has the key', () => {
    const r1 = { other: 'value' };
    expect(getValue('api_status_code', r1)).toBeNull();
  });

  it('returns null when called with no responses', () => {
    expect(getValue('api_status_code')).toBeNull();
  });

  it('returns null when all responses have undefined for the key', () => {
    const r1 = { api_status_code: undefined };
    const r2 = { api_status_code: undefined };
    expect(getValue('api_status_code', r1, r2)).toBeNull();
  });

  it('returns a string value', () => {
    const r1 = { api_server_version: '2.0.0' };
    expect(getValue('api_server_version', r1)).toBe('2.0.0');
  });
});

//*****************************************************************************************
// getAPIResponse
//*****************************************************************************************
describe('getAPIResponse', () => {
  it('extracts fields from the data response when available', () => {
    const data: ApiResponse<string> = {
      api_response: 'result',
      api_error_message: '',
      api_server_version: '1.0.0',
      api_status_code: 200
    };
    const empty = null as unknown as ApiResponse<string>;

    const result = getApiResponse(data, empty, empty);
    expect(result.statusCode).toBe(200);
    expect(result.serverVersion).toBe('1.0.0');
    expect(result.data).toBe('result');
    expect(result.error).toBeNull();
  });

  it('falls back to error response when data is null', () => {
    const error: ApiResponse<string> = {
      api_response: null as unknown as string,
      api_error_message: 'Not found',
      api_server_version: '1.0.0',
      api_status_code: 404
    };
    const empty = null as unknown as ApiResponse<string>;

    const result = getApiResponse(empty, error, empty);
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Not found');
  });

  it('falls back to failureReason when data and error are null', () => {
    const failureReason: ApiResponse<string> = {
      api_response: null as unknown as string,
      api_error_message: 'Server error',
      api_server_version: '1.0.0',
      api_status_code: 500
    };
    const empty = null as unknown as ApiResponse<string>;

    const result = getApiResponse(empty, empty, failureReason);
    expect(result.statusCode).toBe(500);
    expect(result.error).toBe('Server error');
  });

  it('returns all null values when all inputs are null', () => {
    const empty = null as unknown as ApiResponse<string>;
    const result = getApiResponse(empty, empty, empty);
    expect(result.statusCode).toBeNull();
    expect(result.serverVersion).toBeNull();
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });
});

//*****************************************************************************************
// getBlobResponse
//*****************************************************************************************
describe('getBlobResponse', () => {
  it('extracts all fields including blob metadata from data', () => {
    const data: BlobResponse = {
      api_response: new Blob(),
      api_error_message: '',
      api_server_version: '1.0.0',
      api_status_code: 200,
      filename: 'report.pdf',
      size: 1024,
      type: 'application/pdf'
    };
    const empty = null as unknown as ApiResponse<string>;

    const result = getBlobResponse<Blob, string>(data, empty, empty);
    expect(result.statusCode).toBe(200);
    expect(result.serverVersion).toBe('1.0.0');
    expect(result.filename).toBe('report.pdf');
    expect(result.size).toBe(1024);
    expect(result.type).toBe('application/pdf');
  });

  it('falls back to error response for shared fields', () => {
    const error: ApiResponse<string> = {
      api_response: null as unknown as string,
      api_error_message: 'Forbidden',
      api_server_version: '1.0.0',
      api_status_code: 403
    };
    const empty = null as unknown as BlobResponse;

    const result = getBlobResponse<Blob, string>(empty, error, null as unknown as ApiResponse<string>);
    expect(result.statusCode).toBe(403);
    expect(result.error).toBe('Forbidden');
  });

  it('returns all null values when all inputs are null', () => {
    const empty = null as unknown as BlobResponse;
    const emptyErr = null as unknown as ApiResponse<string>;
    const result = getBlobResponse<Blob, string>(empty, emptyErr, emptyErr);
    expect(result.statusCode).toBeNull();
    expect(result.filename).toBeNull();
    expect(result.size).toBeNull();
    expect(result.type).toBeNull();
  });
});

//*****************************************************************************************
// stableStringify
//*****************************************************************************************
describe('stableStringify', () => {
  it('serializes a primitive string', () => {
    expect(stableStringify('hello')).toBe('"hello"');
  });

  it('serializes a number', () => {
    expect(stableStringify(42)).toBe('42');
  });

  it('serializes null', () => {
    expect(stableStringify(null)).toBe('null');
  });

  it('serializes undefined', () => {
    expect(stableStringify(undefined)).toBe(undefined);
  });

  it('serializes a boolean', () => {
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(false)).toBe('false');
  });

  it('serializes an empty object', () => {
    expect(stableStringify({})).toBe('{}');
  });

  it('serializes an empty array', () => {
    expect(stableStringify([])).toBe('[]');
  });

  it('sorts object keys alphabetically', () => {
    const obj = { z: 1, a: 2, m: 3 };
    expect(stableStringify(obj)).toBe('{"a":2,"m":3,"z":1}');
  });

  it('produces the same output regardless of key insertion order', () => {
    const obj1 = { b: 2, a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(stableStringify(obj1)).toBe(stableStringify(obj2));
  });

  it('handles nested objects with sorted keys', () => {
    const obj = { b: { d: 1, c: 2 }, a: 3 };
    expect(stableStringify(obj)).toBe('{"a":3,"b":{"c":2,"d":1}}');
  });

  it('serializes arrays preserving order', () => {
    expect(stableStringify([3, 1, 2])).toBe('[3,1,2]');
  });

  it('handles arrays of objects', () => {
    const arr = [{ b: 2, a: 1 }];
    expect(stableStringify(arr)).toBe('[{"a":1,"b":2}]');
  });

  it('serializes a Date as an ISO string', () => {
    const date = new Date('2024-01-15T00:00:00.000Z');
    expect(stableStringify(date)).toBe('"2024-01-15T00:00:00.000Z"');
  });

  it('handles deeply nested structures', () => {
    const obj = { a: { b: { c: [1, { e: 5, d: 4 }] } } };
    expect(stableStringify(obj)).toBe('{"a":{"b":{"c":[1,{"d":4,"e":5}]}}}');
  });
});
