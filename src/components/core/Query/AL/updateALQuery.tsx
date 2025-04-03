import type { Query } from '@tanstack/react-query';
import { queryClient } from 'components/core/Query/components/APIProvider';
import type { ALRequests, ALResponses } from 'components/core/Query/components/al.models';
import type { APIResponse } from 'components/core/Query/components/api.models';

function isObject(variable) {
  return variable !== null && typeof variable === 'object' && !Array.isArray(variable);
}

export const updateALQuery = <Request extends ALRequests>(
  request: Partial<Request>,
  updater: (prev: ALResponses<Request>) => ALResponses<Request>
) =>
  queryClient.setQueriesData<APIResponse<ALResponses<Request>>>(
    {
      predicate: ({
        queryKey
      }: Query<APIResponse<ALResponses<Request>>, Error, APIResponse<ALResponses<Request>>, [Request]>) => {
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
    },
    prev => ({ ...prev, api_response: updater(prev?.api_response) })
  );

//   import type { Query } from '@tanstack/react-query';
// import { queryClient } from 'components/core/API/APIProvider';
// import { DEFAULT_INVALIDATE_DELAY } from 'components/core/API/utils/constants';
// import type { ALRequests, ALResponses } from 'components/core/Query/models/models';

// export const invalidateALQuery = (filter: (key: ALRequests) => boolean, delay: number = DEFAULT_INVALIDATE_DELAY) =>
//   setTimeout(async () => {
//     await queryClient.invalidateQueries({
//       predicate: ({ queryKey }: Query<unknown, Error, unknown, [ALRequests]>) => {
//         try {
//           return typeof queryKey[0] === 'object' && queryKey[0] && filter(queryKey[0]);
//         } catch (err) {
//           return false;
//         }
//       }
//     });
//   }, delay);
