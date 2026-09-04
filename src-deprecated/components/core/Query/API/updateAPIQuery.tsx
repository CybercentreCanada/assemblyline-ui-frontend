import { queryClient } from 'components/core/Query/components/APIProvider';
import type { APIQueryKey, APIRequest, APIResponse } from 'components/core/Query/components/api.models';

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
