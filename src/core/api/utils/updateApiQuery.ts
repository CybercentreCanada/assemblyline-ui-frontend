import type { ApiQueryKey, ApiRequest, ApiResponse } from 'core/api/api.models';
import { queryClient } from 'core/api/api.providers';

/**
 * @name updateAPIQuery
 * @description Updates the cached data of all queries whose key matches the provided filter function.
 * @param filter - Predicate receiving a parsed APIRequest; return true to update
 * @param update - Updater function receiving the previous api_response value
 * @returns The result of setQueriesData
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const updateApiQuery = <T extends unknown = unknown>(
  filter: (key: ApiRequest) => boolean,
  update: (prev: T) => T
) =>
  queryClient.setQueriesData<ApiResponse<T>>(
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
          return filter(req);
        } catch {
          return false;
        }
      }
    },
    prev => (prev ? { ...prev, api_response: update(prev.api_response) } : prev)
  );
