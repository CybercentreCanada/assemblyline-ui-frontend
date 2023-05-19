import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type ExternalLookupResult = {
  results: {
    [sourceName: string]: {
      link: string;
      count: number;
    };
  };
  errors: {
    [sourceName: string]: string;
  };
  success: null | boolean;
};

type ExternalLookupResults = {
  [tagName: string]: ExternalLookupResult;
};

export function useSearchTagExternal(initialState: ExternalLookupResults) {
  const { t } = useTranslation();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useMySnackbar();
  const [lookupState, setLookupState] = React.useState<ExternalLookupResults>(initialState);

  const searchTagExternal = useCallback(
    (source: string, tagName: string, tagValue: string, classification: string) => {
      let url = `/api/v4/federated_lookup/search/${tagName}/${encodeURIComponent(tagValue)}/`;
      // construct approporiate query param string
      let qs = `classification=${encodeURIComponent(classification)}`;
      if (!!source) {
        qs += `&sources=${encodeURIComponent(source)}`;
      }
      url += `?${qs}`;

      apiCall({
        method: 'GET',
        url: url,
        onSuccess: api_data => {
          if (Object.keys(api_data.api_response).length !== 0) {
            showSuccessMessage(t('related_external.found'));
            // cast error response into object
            let errors = {};
            for (let sourceName in api_data.api_error_message as Object) {
              errors[sourceName] = api_data.api_error_message[sourceName];
            }
            setLookupState(prevState => {
              return {
                ...prevState,
                [tagName]: {
                  results: {
                    ...prevState[tagName].results,
                    ...api_data.api_response
                  },
                  errors: {
                    ...prevState[tagName].errors,
                    ...errors
                  },
                  success: true
                }
              };
            });
          }
        },
        onFailure: api_data => {
          if (Object.keys(api_data.api_error_message).length !== 0) {
            showErrorMessage(t('related_external.error'));
            let errors = {};
            for (let sourceName in api_data.api_error_message as Object) {
              errors[sourceName] = api_data.api_error_message[sourceName];
            }
            setLookupState(prevState => {
              return {
                ...prevState,
                [tagName]: {
                  ...prevState[tagName],
                  errors: {
                    ...prevState[tagName].errors,
                    ...errors
                  },
                  // take existing success from previous source search if available
                  success: prevState[tagName].success || false
                }
              };
            });
          } else {
            showWarningMessage(t('related_external.notfound'));
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    lookupState,
    searchTagExternal
  };
}
