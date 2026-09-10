import { getAppConfigStateFromApi, useAppConfigStoreApi } from 'core/config';
import type { AppNavigationStore } from 'core/router';
import {
  getAppLocationParamStateFromApi,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  hasBlockedPages,
  reconcileRouterFromNavigation,
  setDocumentTitleFromNavigation,
  useAppLocationParamStoreApi,
  useAppNavigationStoreApi,
  useAppRouterStoreApi,
  useAppSetRouterStore
} from 'core/router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { resetFavicon } from 'shared/utils/utils';

export function useAppSyncRouterStoreFromNavigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const configStoreApi = useAppConfigStoreApi();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setRouterStore = useAppSetRouterStore();

  const updateRouterStoreFromNavigation = useCallback(
    (navigation: AppNavigationStore) => {
      const configState = getAppConfigStateFromApi(configStoreApi);
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      if (navigation.id === routerState.id) return;
      if (hasBlockedPages(navigation, routerState) && !navigation.options?.ignoreBlocker) return;

      const fragments = getHashFragmentsFromRouter(navigation);

      void navigate(!fragments?.length ? '/v1' : `/v1#${fragments.join('#')}`, {
        state: getLocationStateFromRouter(navigation),
        replace: navigation?.options?.replace || false
      });

      setDocumentTitleFromNavigation(navigation, locationState, configState, t);
      resetFavicon();

      setRouterStore(router => reconcileRouterFromNavigation(router, navigation));
    },
    [configStoreApi, locationParamStoreApi, navigate, routerStoreApi, setRouterStore, t]
  );

  useEffect(() => {
    updateRouterStoreFromNavigation(getAppNavigationStateFromApi(navigationStoreApi));
    return navigationStoreApi?.subscribe(updateRouterStoreFromNavigation);
  }, [navigationStoreApi, updateRouterStoreFromNavigation]);

  return null;
}
