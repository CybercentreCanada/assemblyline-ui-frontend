import { queryClient } from 'core/api/api.providers';
import { updateAppQuery } from 'core/api/utils/updateAppQuery';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// updateAppQuery
//*****************************************************************************************
describe('updateAppQuery', () => {
  it('updates the api_response of queries whose url starts with the request url', () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo/1', 'GET', 'null', true], { api_response: { count: 1 } });

    updateAppQuery(
      { url: '/api/foo' } as never,
      ((prev: { count: number }) => ({ ...prev, count: prev.count + 1 })) as never
    );

    expect(queryClient.getQueryData(['/api/foo/1', 'GET', 'null', true])).toEqual({ api_response: { count: 2 } });
  });

  it('leaves queries whose url does not match untouched', () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/bar', 'GET', 'null', true], { api_response: { count: 1 } });

    updateAppQuery({ url: '/api/foo' } as never, (prev: never) => prev);

    expect(queryClient.getQueryData(['/api/bar', 'GET', 'null', true])).toEqual({ api_response: { count: 1 } });
  });

  it('matches on method and body subset like invalidateAppQuery', () => {
    queryClient.clear();
    queryClient.setQueryData(['/api/foo', 'POST', JSON.stringify({ id: 1, name: 'a' }), true], {
      api_response: { done: false }
    });

    updateAppQuery({ url: '/api/foo', method: 'POST', body: { id: 1 } } as never, () => ({ done: true }) as never);

    expect(queryClient.getQueryData(['/api/foo', 'POST', JSON.stringify({ id: 1, name: 'a' }), true])).toEqual({
      api_response: { done: true }
    });
  });

  it('does nothing when there is no previous cached data', () => {
    queryClient.clear();
    expect(() => updateAppQuery({} as never, (prev: never) => prev)).not.toThrow();
  });
});
