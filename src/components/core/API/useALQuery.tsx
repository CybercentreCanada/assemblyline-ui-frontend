import { useApiQuery } from './useApiQuery';
import type { SearchRequests, SearchResponses } from './v4/search';

// prettier-ignore
type Requests = SearchRequests;

// prettier-ignore
type Responses<Response extends Requests> =
  Response extends SearchRequests ? SearchResponses<Response> :
  never;

export const useALQuery = <Request extends Requests>({ url = null, method = null, body = null }: Request) => {
  let newURL: string = url;
  let newBody: unknown = body;
  if (method === 'GET') {
    newBody = null;
    newURL = `${url}?${Object.entries(body)
      .map(([k, v]) => (Array.isArray(v) ? v.map(i => `${k}=${i}`).join('&') : `${k}=${v}`))
      .join('&')}`;
  }

  return useApiQuery<{ body: Request['body']; response: Responses<Request> }>({ url: newURL, method, body: newBody });
};
