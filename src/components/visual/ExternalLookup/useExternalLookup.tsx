import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useCallback, useEffect } from 'react';
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

type ExternalEnrichmentItem = {
  group: string; // type or grouping for the result
  name: string; // name key
  name_description: string; // info/help for what the name key is
  value: string; // enrichment value
  value_description: string; // info/help for what the value is
  classification: string;
};

type ExternalEnrichmentResult = {
  confirmed: boolean; // if result is confirmed malicious
  description: string; // summary/description of the findings
  malicious: string; // if the result is malicious or not
  enrichment: Array<ExternalEnrichmentItem>;
};

export type ExternalEnrichmentSource = {
  [sourceName: string]: {
    // Data source of query
    error: null | string; // error message returned by data source
    items: Array<ExternalEnrichmentResult>;
  };
};

export type ExternalEnrichmentResults = {
  [tagName: string]: ExternalEnrichmentSource;
};

export function useSearchTagExternal(initialState: ExternalLookupResults, key: string = null) {
  const { t } = useTranslation();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useMySnackbar();
  const [lookupState, setLookupState] = React.useState<ExternalLookupResults>(initialState);
  const [enrichmentState, setEnrichmentState] = React.useState<ExternalEnrichmentResults>();

  useEffect(
    () => {
      setLookupState(initialState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  const isActionable = useCallback(
    (category, type, value) => {
      const hasExternalQuery =
        !!currentUser.roles.includes('external_query') &&
        !!currentUserConfig.ui.external_sources?.length &&
        !!currentUserConfig.ui.external_source_tags?.hasOwnProperty(type);

      const hasExternalLinks =
        !!currentUserConfig.ui.external_links?.hasOwnProperty(category) &&
        !!currentUserConfig.ui.external_links[category].hasOwnProperty(type);

      return (
        category !== null &&
        type !== null &&
        value !== undefined &&
        (hasExternalQuery || hasExternalLinks || category === 'tag')
      );
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
    [showErrorMessage, showSuccessMessage, showWarningMessage, t]
  );

  const enrichTagExternal = useCallback(
    (source: string, tagName: string, tagValue: string, classification: string) => {
      let url = `/api/v4/federated_lookup/enrich/${tagName}/${encodeURIComponent(tagValue)}/`;
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

            let res = api_data.api_response as ExternalEnrichmentSource;
            setEnrichmentState(prevState => {
              return {
                ...prevState,
                [tagName]: res
              };
            });
          }
        },
        onFailure: api_data => {
          if (Object.keys(api_data.api_error_message).length !== 0) {
            showErrorMessage(t('related_external.error'));
          } else {
            showWarningMessage(t('related_external.notfound'));
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showErrorMessage, showSuccessMessage, showWarningMessage, t]
  );
  return {
    isActionable,
    lookupState,
    searchTagExternal,
    enrichmentState,
    enrichTagExternal
  };
}
