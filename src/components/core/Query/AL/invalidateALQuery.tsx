import type { Query } from '@tanstack/react-query';
import { queryClient } from 'components/core/Query/components/APIProvider';
import type { ALRequests } from 'components/core/Query/components/al.models';
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
      predicate: ({ queryKey }: Query<unknown, Error, unknown, [ALRequests]>) => {
        try {
          return (
            typeof queryKey[0] === 'object' &&
            queryKey[0] &&
            (!('url' in request) ? true : queryKey[0].url.startsWith(request?.url)) &&
            (!('method' in request) ? true : (request?.method || 'GET') === queryKey[0].method) &&
            (!('body' in request)
              ? true
              : !isObject(request?.body)
              ? (request?.body || null) === queryKey[0].body
              : Object.keys(request?.body).every(key => Object.prototype.hasOwnProperty.call(queryKey[0].body, key)))
          );
        } catch (err) {
          return false;
        }
      }
    });
  }, delay);
