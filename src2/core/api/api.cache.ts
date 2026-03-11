import { queryClient } from './api.provider';
import type { ALRequests, ALResponses, APIQueryKey, APIRequest, APIResponse } from './api.models';
import { DEFAULT_INVALIDATE_DELAY } from './api.constants';

const isObject = (variable: unknown) => variable !== null && typeof variable === 'object' && !Array.isArray(variable);

export const invalidateAPIQuery = (filter: (key: APIRequest) => boolean, delay: number = DEFAULT_INVALIDATE_DELAY) =>
  setTimeout(async () => {
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => {
        try {
          const [url, method, bodyStr] = queryKey as unknown as APIQueryKey;
          let body: APIRequest['body'] = null;
          if (typeof bodyStr === 'string') {
            try {
              body = JSON.parse(bodyStr);
            } catch {
              body = bodyStr;
            }
          }
          const req: APIRequest = { url, method, body };
          return filter(req);
        } catch {
          return false;
        }
      }
    });
  }, delay);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const updateAPIQuery = <T extends unknown = unknown>(
  filter: (key: APIRequest) => boolean,
  update: (prev: T) => T
) =>
  queryClient.setQueriesData<APIResponse<T>>(
    {
      predicate: ({ queryKey }) => {
        try {
          const [url, method, bodyStr] = queryKey as unknown as APIQueryKey;
          let body: APIRequest['body'] = null;
          if (typeof bodyStr === 'string') {
            try {
              body = JSON.parse(bodyStr);
            } catch {
              body = bodyStr;
            }
          }
          const req: APIRequest = { url, method, body };
          return filter(req);
        } catch {
          return false;
        }
      }
    },
    prev => (prev ? { ...prev, api_response: update(prev.api_response as T) } : prev)
  );

export const invalidateALQuery = <Request extends ALRequests>(
  request: Partial<Request>,
  delay: number = DEFAULT_INVALIDATE_DELAY
) =>
  setTimeout(async () => {
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => {
        try {
          const [url, method, bodyStr] = queryKey as unknown as APIQueryKey;
          let body: APIRequest['body'] = null;
          if (typeof bodyStr === 'string') {
            try {
              body = JSON.parse(bodyStr);
            } catch {
              body = bodyStr;
            }
          }
          const req: APIRequest = { url, method, body };

          return (
            (!('url' in request) ? true : req.url.startsWith(request?.url as string)) &&
            (!('method' in request) ? true : (request?.method || 'GET') === req.method) &&
            (!('body' in request)
              ? true
              : !isObject(request?.body)
                ? (request?.body ?? null) === req.body
                : isObject(req.body) &&
                  Object.keys(request?.body as object).every(key =>
                    Object.prototype.hasOwnProperty.call(req.body as object, key)
                  ))
          );
        } catch {
          return false;
        }
      }
    });
  }, delay);

export const updateALQuery = <Request extends ALRequests>(
  request: Partial<Request>,
  updater: (prev: ALResponses<Request>) => ALResponses<Request>
) =>
  queryClient.setQueriesData<APIResponse<ALResponses<Request>>>(
    {
      predicate: ({ queryKey }) => {
        try {
          const [url, method, bodyStr] = queryKey as unknown as APIQueryKey;
          let body: APIRequest['body'] = null;
          if (typeof bodyStr === 'string') {
            try {
              body = JSON.parse(bodyStr);
            } catch {
              body = bodyStr;
            }
          }
          const req: APIRequest = { url, method, body };

          return (
            (!('url' in request) ? true : req.url.startsWith(request?.url as string)) &&
            (!('method' in request) ? true : (request?.method || 'GET') === req.method) &&
            (!('body' in request)
              ? true
              : !isObject(request?.body)
                ? (request?.body ?? null) === req.body
                : isObject(req.body) &&
                  Object.keys(request?.body as object).every(key =>
                    Object.prototype.hasOwnProperty.call(req.body as object, key)
                  ))
          );
        } catch {
          return false;
        }
      }
    },
    prev => (prev ? { ...prev, api_response: updater(prev.api_response as ALResponses<Request>) } : prev)
  );
