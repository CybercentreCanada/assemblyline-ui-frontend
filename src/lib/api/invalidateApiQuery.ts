import type { Query } from '@tanstack/react-query';
import { queryClient } from './APIProvider';
import { DEFAULT_INVALIDATE_DELAY } from './constants';
import type { ApiCallProps } from './utils';

export const invalidateApiQuery = (
  filter: (key: ApiCallProps) => boolean,
  delay: number = DEFAULT_INVALIDATE_DELAY
) => {
  setTimeout(async () => {
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }: Query<unknown, Error, unknown, [ApiCallProps]>) => {
        try {
          return typeof queryKey[0] === 'object' && queryKey[0] && filter(queryKey[0]);
        } catch (err) {
          return false;
        }
      }
    });
  }, delay);
};
