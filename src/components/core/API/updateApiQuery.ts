import type { Query } from '@tanstack/react-query';
import { queryClient } from './APIProvider';
import type { APIResponse } from './models';
import type { ApiCallProps } from './utils';

export const updateApiQuery = <T>(filter: (key: ApiCallProps) => boolean, update: (prev: T) => T) => {
  queryClient.setQueriesData<APIResponse<T>>(
    {
      predicate: ({ queryKey }: Query<unknown, Error, unknown, [ApiCallProps]>) => {
        try {
          return typeof queryKey[0] === 'object' && queryKey[0] && filter(queryKey[0]);
        } catch (err) {
          return false;
        }
      }
    },
    prev => ({ ...prev, api_response: update(prev?.api_response) })
  );
};
