import { AppStorageKeys } from 'commons/components/app/AppConstants';
import { type BreadcrumbItem, getRoute, useAppSitemap } from 'commons/components/app/hooks/useAppSitemap';
import useLocalStorageItem from 'commons/components/utils/hooks/useLocalStorageItem';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import { AppBreadcrumbsContext } from 'commons/components/app/AppContexts';
import { useAppConfigs, useAppUser } from 'commons/components/app/hooks';

const { LS_KEY_BREADCRUMBS_ENABLED } = AppStorageKeys;

type AppBreadcrumbsProviderProps = {
  children: ReactNode;
};

const DefaultAppBreadcrumbsProvider = ({ children }: AppBreadcrumbsProviderProps) => {
  const { pathname } = useLocation();
  const { sitemap, preferences } = useAppConfigs();
  const user = useAppUser();
  const { appendRoute } = useAppSitemap();
  const isUserReady = user.isReady();

  // States.
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [show, setShow] = useLocalStorageItem<boolean>(LS_KEY_BREADCRUMBS_ENABLED, preferences.defaultShowBreadcrumbs);

  // Reset the breadcrumbs if the user ready state changes.
  useEffect(() => {
    setItems(appendRoute([getRoute('/', sitemap.routes)], getRoute(pathname, sitemap.routes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserReady]);

  // The return callback will ensure the event handler deregisters when component
  //  is unmounted.  Failure to do this will result in an event handler
  //  being registered each time this component renders.
  useEffect(() => {
    const _matchedRoute = getRoute(pathname, sitemap.routes);
    setItems(_items => appendRoute(_items, _matchedRoute));
  }, [pathname, appendRoute, sitemap.routes]);

  // Memoized context value.
  const context = useMemo(() => {
    return {
      show: preferences.allowBreadcrumbs && show,
      items,
      setItems,
      toggle: () => setShow(!show),
      last: () => (items.length > 0 ? items[items.length - 1] : items[0]),
      first: () => items[0]
    };
  }, [preferences.allowBreadcrumbs, show, items, setShow]);
  return <AppBreadcrumbsContext.Provider value={context}>{children}</AppBreadcrumbsContext.Provider>;
};

const AppBreadcrumbsProvider = ({ children }: AppBreadcrumbsProviderProps) => {
  const { overrides } = useAppConfigs();
  const _breadcrumbs = overrides?.providers?.breadcrumbs?.provider;

  if (_breadcrumbs) {
    return <_breadcrumbs>{children}</_breadcrumbs>;
  }

  return <DefaultAppBreadcrumbsProvider>{children}</DefaultAppBreadcrumbsProvider>;
};

export default AppBreadcrumbsProvider;
