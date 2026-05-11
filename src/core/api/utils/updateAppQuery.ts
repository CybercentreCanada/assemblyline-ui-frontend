import type { ApiQueryKey, ApiRequest, ApiResponse } from 'core/api/api.models';
import { queryClient } from 'core/api/api.providers';

/**
 * @name isObject
 * @description Checks whether a value is a plain object (not null and not an array).
 * @param variable - The value to check
 * @returns True if the value is a plain object
 */
const isObject = (variable: unknown) => variable !== null && typeof variable === 'object' && !Array.isArray(variable);

/**
 * @name updateAppQuery
 * @description Updates the cached data of all queries whose key partially matches the given app request shape.
 * @param request - Partial request to match against (url prefix, method, body keys)
 * @param updater - Updater function receiving the previous api_response value
 * @returns The result of setQueriesData
 */
export const updateAppQuery = <Request extends ApiRequests>(
  request: Partial<Request>,
  updater: (prev: ApiResponses<Request>) => ApiResponses<Request>
) =>
  queryClient.setQueriesData<ApiResponse<ApiResponses<Request>>>(
    {
      predicate: ({ queryKey }) => {
        try {
          const [url, method, bodyStr] = queryKey as unknown as ApiQueryKey;
          let body: ApiRequest['body'] = null;
          if (typeof bodyStr === 'string') {
            try {
              body = JSON.parse(bodyStr);
            } catch {
              body = bodyStr;
            }
          }
          const req: ApiRequest = { url, method, body };

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
    prev => (prev ? { ...prev, api_response: updater(prev.api_response) } : prev)
  );
