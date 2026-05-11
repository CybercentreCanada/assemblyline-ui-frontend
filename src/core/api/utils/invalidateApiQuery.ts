import { DEFAULT_APP_PREFERENCE } from 'app/core.preference';
import type { ApiQueryKey, ApiRequest } from 'core/api/api.models';
import { queryClient } from 'core/api/api.providers';

/**
 * @name invalidateAPIQuery
 * @description Invalidates all cached queries whose key matches the provided filter function, after an optional delay.
 * @param filter - Predicate receiving a parsed APIRequest; return true to invalidate
 * @param delay - Milliseconds to wait before invalidating (defaults to app config)
 * @returns The timeout ID
 */
export const invalidateApiQuery = (
  filter: (key: ApiRequest) => boolean,
  delay: number = DEFAULT_APP_PREFERENCE.api.invalidateDelay
) =>
  setTimeout(async () => {
    await queryClient.invalidateQueries({
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
    });
  }, delay);
