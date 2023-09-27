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
    error?: null | string; // error message returned by data source
    items?: Array<ExternalEnrichmentResult>;
    inProgress?: null | boolean;
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
      const tagSrcMap = currentUserConfig.ui.external_source_tags;
      if (!tagSrcMap?.hasOwnProperty(tagName)) {
        showErrorMessage(t('related_external.invalidTagName'));
        return;
      }
      const stateKey = getKey(tagName, tagValue);
      const pendingStates = {};
      let url = `/api/v4/federated_lookup/enrich/${tagName}/${encodeURIComponent(tagValue)}/`;
      // construct approporiate query param string
      let qs = `classification=${encodeURIComponent(classification)}`;
      if (!!source) {
        pendingStates[source] = { inProgress: false, error: '', items: [] };
        qs += `&sources=${encodeURIComponent(source)}`;
      } else {
        // only send query to sources that support the tag name and the classification
        let s = [];
        for (const src of currentUserConfig.ui.external_sources) {
          if (
            tagSrcMap[tagName].includes(src.name)
            // let search proxy handle classifications so we can easily report the error back
            // && isAccessible(src.max_classification, classification, c12nDef, c12nDef.enforce)
          ) {
            s.push(src.name);
            pendingStates[src.name] = { inProgress: false, error: '', items: [] };
          }
        }
        if (s.length <= 0) {
          showWarningMessage(t('related_external.notfound'));
          return;
        }
        qs += `&sources=${encodeURIComponent(s.join('|'))}`;
      }
      url += `?${qs}`;

      setEnrichmentState(prevState => {
        return {
          ...prevState,
          [stateKey]: {
            ...prevState[stateKey],
            ...pendingStates
          }
        };
      });

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
          } else {
            showErrorMessage(t('related_external.error'));
          }
          // always update the results to display errors and not found.
          Object.keys(pendingStates).forEach(src => {
            pendingStates[src].inProgress = false;
          });
          setEnrichmentState(prevState => {
            return {
              ...prevState,
              [stateKey]: {
                ...prevState[stateKey],
                ...{ ...pendingStates, ...res }
              }
            };
          });
        },
        onFailure: api_data => {
          if (Object.keys(api_data.api_error_message).length !== 0) {
            showErrorMessage(`${t('related_external.error')}: ${api_data.api_error_message}`);
          } else {
            showWarningMessage(t('related_external.notfound'));
          }
          // ensure inProgress state is unset
          Object.keys(pendingStates).forEach(src => {
            pendingStates[src].inProgess = false;
          });
          const res = { ...pendingStates, ...(api_data.api_response as ExternalEnrichmentResults) };
          setEnrichmentState(prevState => {
            return {
              ...prevState,
              [stateKey]: {
                ...prevState[stateKey],
                ...res
              }
            };
          });
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
