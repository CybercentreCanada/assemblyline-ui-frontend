import { useAppConfig } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppSnackbar } from 'core/snackbar';
import type { ExternalEnrichmentResults, ExternalEnrichmentState } from 'layout/external-lookup/external-lookup.models';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useMyAPI from 'shared/hooks/useMyAPI';

/** Manages external enrichment query state and results. */
export type UseAppExternalLookup = {
  /** Checks if enrichment lookup is available for a given category/type/value combination. */
  isActionable: (category: string, type: string, value: string) => boolean;
  /** Triggers an external enrichment query for a tag. */
  enrichTagExternal: (source: string, tagName: string, tagValue: string, classification: string) => void;
  /** Constructs a cache key from tag name and value. */
  getKey: (tagName: string, tagValue: string) => string;
  /** Current enrichment query results indexed by tag key. */
  enrichmentState: ExternalEnrichmentState;
};

/**
 * @name useAppExternalLookup
 * @description Manages external data source enrichment queries and result caching for tag lookups.
 * @returns Object containing enrichment helpers and current enrichment state
 */
export const useAppExternalLookup = (): UseAppExternalLookup => {
  const { t } = useTranslation(['externalLookup']);
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useAppSnackbar();

  const currentUser = useAppConfig(s => s.user);
  const currentUserConfig = useAppConfig(s => s.configuration);

  const enrichmentState = useAppInterfaceStore(s => s.externalLookup.enrichment);

  const setInterface = useAppSetInterfaceStore();

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

  const getKey = (tagName: string, tagValue: string): string => `${tagName}_${tagValue}`;

  const enrichTagExternal = useCallback(
    (source: string, tagName: string, tagValue: string, classification: string) => {
      const tagSrcMap = currentUserConfig.ui.external_source_tags;
      if (!tagSrcMap?.hasOwnProperty(tagName)) {
        showErrorMessage(t('related_external.error.invalidTagName'));
        return;
      }
      const stateKey = getKey(tagName, tagValue);
      const pendingStates = {};
      let url = `/api/v4/federated_lookup/enrich/${tagName}/${encodeURIComponent(encodeURIComponent(tagValue))}/`;
      // construct approporiate query param string
      let qs = `classification=${encodeURIComponent(classification)}`;
      if (!!source) {
        pendingStates[source] = { inProgress: true, error: '', items: [] };
        qs += `&sources=${encodeURIComponent(source)}`;
      } else {
        // only send query to sources that support the tag name and the classification
        const s = [];
        for (const src of currentUserConfig.ui.external_sources) {
          if (tagSrcMap[tagName].includes(src.name)) {
            // uncomment when classification updates are merged in
            // if (!isAccessible(src.max_classification, classification, c12nDef, c12nDef.enforce)) {
            //   pendingStates[src.name] = { inProgress: false, error: t('related_external.error.maxClassification'), items: [] };
            // } else {
            s.push(src.name);
            pendingStates[src.name] = { inProgress: true, error: '', items: [] };
            // }
          }
        }
        if (s.length <= 0) {
          showWarningMessage(t('related_external.notfound'));
          return;
        }
        qs += `&sources=${encodeURIComponent(s.join('|'))}`;
      }
      url += `?${qs}`;

      setInterface(s => {
        s.externalLookup.enrichment = {
          ...s.externalLookup.enrichment,
          [stateKey]: {
            ...s.externalLookup.enrichment[stateKey],
            ...pendingStates
          }
        };

        return s;
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

          setInterface(prevState => {
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
          setInterface(s => {
            s.externalLookup.enrichment = {
              ...s.externalLookup.enrichment,
              [stateKey]: {
                ...s.externalLookup.enrichment[stateKey],
                ...res
              }
            };

            return s;
          });
        }
      });
    },
    [currentUserConfig, apiCall, showErrorMessage, t, showWarningMessage, showSuccessMessage]
  );

  return {
    isActionable,
    enrichTagExternal,
    getKey,
    enrichmentState
  };
};
