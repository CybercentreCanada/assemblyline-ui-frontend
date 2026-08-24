import { queryClient } from 'components/core/Query/components/APIProvider';
import type { APIQueryKey, APIRequest } from 'components/core/Query/components/api.models';
import { DEFAULT_INVALIDATE_DELAY } from 'components/core/Query/components/constants';

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
