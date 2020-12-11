/* eslint-disable react-hooks/exhaustive-deps */
import useMyAPI from 'components/hooks/useMyAPI';
import SearchQuery from 'components/visual/SearchBar/search-query';
import { useCallback } from 'react';
import { AlertItem } from './useAlerts';

// Specification interface of this hook.
export interface UsingPromiseAPI {
  fetchAlert: (alertId: string) => Promise<AlertItem>;
  onApplyWorkflowAction: (
    query: SearchQuery,
    selectedStatus: string,
    selectedPriority: string,
    selectedLabels: string[]
  ) => Promise<boolean>;
  onTakeOwnership: (query: SearchQuery) => Promise<boolean>;
}

// Stateless hook that returns promise wrappers around AL's rest api.
export default function usePromiseAPI(): UsingPromiseAPI {
  //
  const apiCall = useMyAPI();

  // Hook API: fetch the alert for the specified alert_id.
  const fetchAlert = async (alertId: string): Promise<AlertItem> => {
    return new Promise<AlertItem>((resolve, reject) => {
      const url = `/api/v4/alert/${alertId}/`;
      apiCall({
        url,
        onSuccess: api_data => {
          resolve(api_data.api_response);
        },
        onFailure: api_data => reject(api_data)
      });
    });
  };

  // Hook API: apply workflow actions
  const onApplyWorkflowAction = async (
    query: SearchQuery,
    selectedStatus: string,
    selectedPriority: string,
    selectedLabels: string[]
  ): Promise<boolean> => {
    const statusPromise = new Promise((resolve, reject) => {
      if (selectedStatus) {
        apiCall({
          url: `/api/v4/alert/status/batch/?${query.buildAPIQueryString()}`,
          method: 'post',
          body: selectedStatus,
          onSuccess: api_data => {
            resolve(true);
          },
          onFailure: api_data => reject(api_data)
        });
      } else {
        resolve(false);
      }
    });

    const priorityPromise = new Promise((resolve, reject) => {
      if (selectedPriority) {
        apiCall({
          url: `/api/v4/alert/priority/batch/?${query.buildAPIQueryString()}`,
          method: 'post',
          body: selectedPriority,
          onSuccess: api_data => {
            resolve(true);
          },
          onFailure: api_data => reject(api_data)
        });
      } else {
        resolve(false);
      }
    });

    const labelPromise = new Promise((resolve, reject) => {
      if (selectedLabels && selectedLabels.length > 0) {
        apiCall({
          url: `/api/v4/alert/label/batch/?${query.buildAPIQueryString()}`,
          method: 'post',
          body: selectedLabels,
          onSuccess: api_data => {
            resolve(true);
          },
          onFailure: api_data => reject(api_data)
        });
      } else {
        resolve(true);
      }
    });

    return Promise.all([statusPromise, priorityPromise, labelPromise]).then(() => true);
  };

  // Hook API: take ownership of alerts matching specified query.
  const onTakeOwnership = async (query: SearchQuery): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      apiCall({
        url: `/api/v4/alert/ownership/batch/?${query.buildAPIQueryString()}`,
        onSuccess: api_data => {
          resolve(true);
        },
        onFailure: () => resolve(false)
      });
    });
  };

  // Wrap each exposed method in 'useCallback' hook in order to ensure they are memoized and do not
  //  cause re-renders.
  return {
    fetchAlert: useCallback(fetchAlert, []),
    onApplyWorkflowAction: useCallback(onApplyWorkflowAction, []),
    onTakeOwnership: useCallback(onTakeOwnership, [])
  };
}
