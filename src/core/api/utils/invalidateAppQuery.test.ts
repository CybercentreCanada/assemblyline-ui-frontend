import { queryClient } from 'core/api/api.providers';
import { invalidateAppQuery } from 'core/api/utils/invalidateAppQuery';
import { describe, expect, it } from 'vitest';

const wait = () => new Promise(resolve => setTimeout(resolve, 10));

//*****************************************************************************************
// invalidateAppQuery
//*****************************************************************************************
describe('invalidateAppQuery', () => {
  it('invalidates queries whose url starts with the request url', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo/1', 'GET', 'null', true], { api_response: 'data' });

    invalidateAppQuery({ url: '/api/foo' } as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/foo/1', 'GET', 'null', true])?.isInvalidated).toBe(true);
  });

  it('does not invalidate queries whose url does not match', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/bar', 'GET', 'null', true], { api_response: 'data' });

    invalidateAppQuery({ url: '/api/foo' } as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/bar', 'GET', 'null', true])?.isInvalidated).toBe(false);
  });

  it('matches on method when provided', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', 'null', true], { api_response: 'data' });

    invalidateAppQuery({ url: '/api/foo', method: 'GET' } as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/foo', 'POST', 'null', true])?.isInvalidated).toBe(false);
  });

  it('defaults method to GET when comparing and matches GET requests', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'GET', 'null', true], { api_response: 'data' });

    invalidateAppQuery({ url: '/api/foo', method: 'GET' } as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/foo', 'GET', 'null', true])?.isInvalidated).toBe(true);
  });

  it('matches when request body keys are a subset of the cached body', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', JSON.stringify({ id: 1, name: 'a' }), true], {
      api_response: 'data'
    });

    invalidateAppQuery({ url: '/api/foo', body: { id: 1 } } as never, 0);
    await wait();

    expect(
      queryClient.getQueryState(['/api/foo', 'POST', JSON.stringify({ id: 1, name: 'a' }), true])?.isInvalidated
    ).toBe(true);
  });

  it('does not match when a request body key is missing from the cached body', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', JSON.stringify({ id: 1 }), true], { api_response: 'data' });

    invalidateAppQuery({ url: '/api/foo', body: { name: 'a' } } as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/foo', 'POST', JSON.stringify({ id: 1 }), true])?.isInvalidated).toBe(false);
  });

  it('matches on a primitive body using strict equality', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', JSON.stringify('raw'), true], { api_response: 'data' });

    invalidateAppQuery({ url: '/api/foo', body: 'raw' } as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/foo', 'POST', JSON.stringify('raw'), true])?.isInvalidated).toBe(true);
  });

  it('matches everything when the request is empty', async () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/anything', 'GET', 'null', true], { api_response: 'data' });

    invalidateAppQuery({} as never, 0);
    await wait();

    expect(queryClient.getQueryState(['/api/anything', 'GET', 'null', true])?.isInvalidated).toBe(true);
  });

  it('returns a timeout id that can be cleared', () => {
    const id = invalidateAppQuery({ url: '/never' } as never, 1_000);
    expect(id).toBeDefined();
    clearTimeout(id);
  });
});
