import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type ExternalEnrichmentItem = {
  group: string; // type or grouping for the result
  name: string; // name key
  name_description: string; // info/help for what the name key is
  value: string; // enrichment value
  value_description: string; // info/help for what the value is
  classification: string;
};

export type ExternalEnrichmentResult = {
  link: string; // link to results
  count: number; // number of hits from the search
  classification: string; // classification of the item searched
  confirmed: boolean; // if result is confirmed malicious
  description: string; // summary/description of the findings
  malicious: boolean; // if the result is malicious or not
  enrichment: Array<ExternalEnrichmentItem>;
};

export type ExternalEnrichmentResults = {
  [sourceName: string]: {
    // Data source of query
    error: null | string; // error message returned by data source
    items: Array<ExternalEnrichmentResult>;
  };
};

export type ExternalEnrichmentState = {
  [tagName: string]: ExternalEnrichmentResults;
};

export type ExternalLookupContextProps = {
  isActionable: (category: string, type: string, value: string) => boolean;
  enrichTagExternal: (source: string, tagName: string, tagValue: string, classification: string) => void;
  getKey: (tagName: string, tagValue: string) => string;
  enrichmentState: ExternalEnrichmentState;
};

export interface ExternalLookupProps {
  children: React.ReactNode;
}

export const ExternalLookupContext = React.createContext<ExternalLookupContextProps>(null);

export function ExternalLookupProvider(props: ExternalLookupProps) {
  const { children } = props;
  const { t } = useTranslation();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useMySnackbar();
  const [enrichmentState, setEnrichmentState] = React.useState<ExternalEnrichmentState>({});

  const isActionable = useCallback(
    (category, type, value) => {
      const hasExternalQuery =
        !!currentUser &&
        !!currentUser.roles.includes('external_query') &&
        !!currentUserConfig.ui.external_sources?.length &&
        !!currentUserConfig.ui.external_source_tags?.hasOwnProperty(type);

      const hasExternalLinks =
        !!currentUserConfig &&
        !!currentUserConfig.ui.external_links?.hasOwnProperty(category) &&
        !!currentUserConfig.ui.external_links[category].hasOwnProperty(type);

      return (
        category !== null &&
        type !== null &&
        value !== undefined &&
        (hasExternalQuery || hasExternalLinks || category === 'tag')
      );
    },

    [currentUser, currentUserConfig]
  );
  const getKey = (tagName: string, tagValue: string) => `${tagName}_${tagValue}`;

  const enrichTagExternal = useCallback(
    (source: string, tagName: string, tagValue: string, classification: string) => {
      const stateKey = getKey(tagName, tagValue);
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
          const res = api_data.api_response as ExternalEnrichmentResults;
          if (Object.keys(res).length !== 0) {
            let found = false;
            let error = true;
            for (const enrichmentResults of Object.values(res)) {
              if (enrichmentResults.items.length > 0) {
                showSuccessMessage(t('related_external.complete'));
                found = true;
                error = false;
                break;
              }
              // don't show error message unless all sources report an error
              else if (!enrichmentResults.error || enrichmentResults.error === 'Not Found') {
                error = false;
              }
            }
            if (!!error) {
              showErrorMessage(t('related_external.error'));
            } else if (!found) {
              showWarningMessage(t('related_external.notfound'));
            }

            setEnrichmentState(prevState => {
              return {
                ...prevState,
                [stateKey]: {
                  ...prevState[stateKey],
                  ...res
                }
              };
            });
          } else {
            showErrorMessage(t('related_external.error'));
          }
        },
        onFailure: api_data => {
          if (Object.keys(api_data.api_error_message).length !== 0) {
            showErrorMessage(`${t('related_external.error')}: ${api_data.api_error_message}`);
          } else {
            showWarningMessage(t('related_external.notfound'));
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showErrorMessage, showSuccessMessage, showWarningMessage, t]
  );
  return (
    <ExternalLookupContext.Provider value={{ getKey, isActionable, enrichmentState, enrichTagExternal }}>
      {children}
    </ExternalLookupContext.Provider>
  );
}
