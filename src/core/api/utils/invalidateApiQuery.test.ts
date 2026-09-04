import { queryClient } from 'core/api/api.providers';
import { invalidateApiQuery } from 'core/api/utils/invalidateApiQuery';
import { describe, expect, it } from 'vitest';

const wait = () => new Promise(resolve => setTimeout(resolve, 10));

//*****************************************************************************************
// invalidateApiQuery
//*****************************************************************************************
describe('invalidateApiQuery', () => {
  it('invalidates queries matching the filter after the delay', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'GET', 'null', true], { api_response: 'data' });

    invalidateApiQuery(req => req.url === '/api/foo', 0);
    await wait();

    expect(queryClient.getQueryState(['/api/foo', 'GET', 'null', true])?.isInvalidated).toBe(true);
  });

  it('does not invalidate queries that do not match the filter', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/bar', 'GET', 'null', true], { api_response: 'data' });

    invalidateApiQuery(req => req.url === '/api/foo', 0);
    await wait();

    expect(queryClient.getQueryState(['/api/bar', 'GET', 'null', true])?.isInvalidated).toBe(false);
  });

  it('parses a JSON string body before passing it to the filter', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', JSON.stringify({ id: 1 }), true], { api_response: 'data' });

    let capturedBody: unknown;
    invalidateApiQuery(req => {
      capturedBody = req.body;
      return true;
    }, 0);
    await wait();

    expect(capturedBody).toEqual({ id: 1 });
  });

  it('falls back to the raw string body when it is not valid JSON', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', 'not-json', true], { api_response: 'data' });

    let capturedBody: unknown;
    invalidateApiQuery(req => {
      capturedBody = req.body;
      return true;
    }, 0);
    await wait();

    expect(capturedBody).toBe('not-json');
  });

  it('swallows errors from malformed query keys without throwing', async () => {
    queryClient.clear();
    queryClient.setQueryData(['weird-key'], {});

    expect(() => invalidateApiQuery(() => true, 0)).not.toThrow();
    await wait();
  });

  it('returns a timeout id that can be cleared', () => {
    const id = invalidateApiQuery(() => false, 1_000);
    expect(id).toBeDefined();
    clearTimeout(id);
  });
});
