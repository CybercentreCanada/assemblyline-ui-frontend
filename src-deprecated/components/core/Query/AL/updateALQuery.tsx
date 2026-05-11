import { queryClient } from 'components/core/Query/components/APIProvider';
import type { ALRequests, ALResponses } from 'components/core/Query/components/al.models';
import type { APIQueryKey, APIRequest, APIResponse } from 'components/core/Query/components/api.models';

function isObject(variable) {
  return variable !== null && typeof variable === 'object' && !Array.isArray(variable);
}

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
        } catch (err) {
          return false;
        }
      }
    },
    prev => (prev ? { ...prev, api_response: updater(prev.api_response as ALResponses<Request>) } : prev)
  );
