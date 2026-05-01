import type { APIRequests } from 'app/app.api';
import { DEFAULT_APP_CONFIG } from 'app/app.configs';
import type { APIQueryKey, APIRequest } from '../api.models';
import { queryClient } from '../api.provider';
import { isObject } from '../api.utils';

/**
 * @name invalidateAppQuery
 * @description Invalidates all cached queries whose key partially matches the given app request shape, after an optional delay.
 * @param request - Partial request to match against (url prefix, method, body keys)
 * @param delay - Milliseconds to wait before invalidating (defaults to app config)
 * @returns The timeout ID
 */
export const invalidateAppQuery = <Request extends APIRequests>(
  request: Partial<Request>,
  delay: number = DEFAULT_APP_CONFIG.api.invalidateDelay
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
