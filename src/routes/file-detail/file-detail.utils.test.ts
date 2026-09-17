import type { File } from 'models/api/file';
import type { Error } from 'models/base/error';
import type { FileResult } from 'models/base/result';
import { patchFileDetails } from 'routes/file-detail/file-detail.utils';
import { describe, expect, it } from 'vitest';

const makeResult = (serviceName: string, empty = false, marker = serviceName): FileResult =>
  ({
    response: {
      extracted: [],
      service_name: serviceName,
      supplementary: []
    },
    result: {
      score: empty ? 0 : 1,
      sections: empty ? [] : [{ marker }]
    }
  }) as unknown as FileResult;

const makeError = (serviceName: string, marker = serviceName): Error =>
  ({
    id: marker,
    response: {
      message: marker,
      service_name: serviceName,
      service_version: '1',
      status: 'FAIL_RECOVERABLE'
    }
  }) as Error;

const makeFile = (overrides: Partial<File>): File =>
  ({
    results: [],
    emptys: [],
    errors: [],
    ...overrides
  }) as File;

//*****************************************************************************************
// patchFileDetails
//*****************************************************************************************
describe('patchFileDetails', () => {
  it('returns empty collections when no file details are available', () => {
    const patched = patchFileDetails(null, makeFile({}));

    expect(patched.results).toEqual([]);
    expect(patched.errors).toEqual([]);
    expect(patched.emptys).toEqual([]);
  });

  it('replaces previous data for the same service with current data', () => {
    const previous = makeFile({ results: [makeResult('service-a', false, 'old')] });
    const current = makeFile({ results: [makeResult('service-a', false, 'new')] });

    const patched = patchFileDetails(previous, current);

    expect(patched.results).toEqual([current.results[0]]);
    expect(patched.results[0].result.sections).toEqual([{ marker: 'new' }]);
  });

  it('keeps one entry per service across results, errors, and live errors', () => {
    const previous = makeFile({
      results: [makeResult('result-service')],
      errors: [makeError('error-service', 'old-error')]
    });
    const current = makeFile({
      results: [makeResult('result-service', false, 'current-result')],
      errors: [makeError('error-service', 'current-error')]
    });

    const patched = patchFileDetails(previous, current, [makeError('live-service', 'live-error')]);

    expect(patched.results.map(result => result.response.service_name)).toEqual(['result-service']);
    expect(patched.errors.map(error => error.response.service_name)).toEqual(['error-service', 'live-service']);
    expect(patched.errors.map(error => error.id)).toEqual(['current-error', 'live-error']);
  });

  it('uses the latest live error for a service', () => {
    const previous = makeFile({ errors: [makeError('error-service', 'previous-error')] });

    const patched = patchFileDetails(previous, makeFile({}), [
      makeError('error-service', 'first-live-error'),
      makeError('error-service', 'latest-live-error')
    ]);

    expect(patched.errors.map(error => error.id)).toEqual(['latest-live-error']);
  });

  it('prioritizes successful results over errors and errors over empty results', () => {
    const previous = makeFile({
      results: [
        makeResult('success-service', false),
        makeResult('error-service', true),
        makeResult('empty-service', true)
      ]
    });
    const current = makeFile({
      errors: [makeError('success-service'), makeError('error-service')]
    });

    const patched = patchFileDetails(previous, current);

    expect(patched.results.map(result => result.response.service_name)).toEqual(['success-service']);
    expect(patched.errors.map(error => error.response.service_name)).toEqual(['error-service']);
    expect(patched.emptys.map(result => result.response.service_name)).toEqual(['empty-service']);
  });
});
