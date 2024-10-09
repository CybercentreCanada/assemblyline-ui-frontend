import { queryClient } from './APIProvider';
import { DEFAULT_INVALIDATE_DELAY } from './constants';
import type { APIQueryKey } from './models';

export const invalidateApiQuery = async (
  filter: (key: APIQueryKey) => boolean,
  delay: number = DEFAULT_INVALIDATE_DELAY
) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  await queryClient.invalidateQueries({
    predicate: q => filter((JSON.parse(q.queryHash) as [APIQueryKey])[0])
  });
};
