import { queryClient } from 'components/core/Query/components/APIProvider';
import type { ALRequests } from 'components/core/Query/components/al.models';
import type { APIQueryKey, APIRequest } from 'components/core/Query/components/api.models';
import { DEFAULT_INVALIDATE_DELAY } from 'components/core/Query/components/constants';

function isObject(variable) {
  return variable !== null && typeof variable === 'object' && !Array.isArray(variable);
}

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
        } catch (err) {
          return false;
        }
      }
    });
  }, delay);
