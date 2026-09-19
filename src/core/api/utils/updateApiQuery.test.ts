import { QUERY_CLIENT } from 'core/api/api.providers';
import { updateApiQuery } from 'core/api/utils/updateApiQuery';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// updateApiQuery
//*****************************************************************************************
describe('updateApiQuery', () => {
  it('updates the api_response of queries matching the filter', () => {
    QUERY_CLIENT.clear();
    QUERY_CLIENT.setQueryData(['/api/foo', 'GET', 'null', true], { api_response: 1 });

    updateApiQuery<number>(
      req => req.url === '/api/foo',
      prev => prev + 1
    );

    expect(QUERY_CLIENT.getQueryData(['/api/foo', 'GET', 'null', true])).toEqual({ api_response: 2 });
  });

  it('leaves non-matching queries untouched', () => {
    QUERY_CLIENT.clear();
    QUERY_CLIENT.setQueryData(['/api/bar', 'GET', 'null', true], { api_response: 1 });

    updateApiQuery<number>(
      req => req.url === '/api/foo',
      prev => prev + 1
    );

    expect(QUERY_CLIENT.getQueryData(['/api/bar', 'GET', 'null', true])).toEqual({ api_response: 1 });
  });

  it('does nothing when there is no previous cached data', () => {
    QUERY_CLIENT.clear();

    expect(() =>
      updateApiQuery<number>(
        () => true,
        prev => prev + 1
      )
    ).not.toThrow();
  });

  it('parses a JSON string body before passing it to the filter', () => {
    QUERY_CLIENT.clear();
    QUERY_CLIENT.setQueryData(['/api/foo', 'POST', JSON.stringify({ id: 1 }), true], { api_response: 'x' });

    let capturedBody: unknown;
    updateApiQuery<string>(
      req => {
        capturedBody = req.body;
        return true;
      },
      prev => prev
    );

    expect(capturedBody).toEqual({ id: 1 });
  });

  it('swallows errors from malformed query keys without throwing', () => {
    QUERY_CLIENT.clear();
    QUERY_CLIENT.setQueryData(['weird-key'], {});

    expect(() =>
      updateApiQuery(
        () => true,
        prev => prev
      )
    ).not.toThrow();
  });
});
