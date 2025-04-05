import type { Query } from '@tanstack/react-query';
import { queryClient } from 'components/core/Query/components/APIProvider';
import type { APIRequest } from 'components/core/Query/components/api.models';
import { DEFAULT_INVALIDATE_DELAY } from 'components/core/Query/components/constants';

export const invalidateAPIQuery = (filter: (key: APIRequest) => boolean, delay: number = DEFAULT_INVALIDATE_DELAY) =>
  setTimeout(async () => {
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }: Query<unknown, Error, unknown, [APIRequest]>) => {
        try {
          return typeof queryKey[0] === 'object' && queryKey[0] && filter(queryKey[0]);
        } catch (err) {
          return false;
        }
      }
    });
  }, delay);
