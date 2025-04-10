import type { Query } from '@tanstack/react-query';
import { queryClient } from 'components/core/Query/components/APIProvider';
import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const updateAPIQuery = <T extends unknown = unknown>(
  filter: (key: APIRequest) => boolean,
  update: (prev: T) => T
) =>
  queryClient.setQueriesData<APIResponse<T>>(
    {
      predicate: ({ queryKey }: Query<APIResponse<T>, Error, APIResponse<T>, [APIRequest]>) => {
        try {
          return typeof queryKey[0] === 'object' && queryKey[0] && filter(queryKey[0]);
        } catch (err) {
          return false;
        }
      }
    },
    prev => ({ ...prev, api_response: update(prev?.api_response) })
  );
