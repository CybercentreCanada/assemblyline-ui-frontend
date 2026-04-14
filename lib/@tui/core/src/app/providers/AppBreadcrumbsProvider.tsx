/* eslint-disable react-hooks/refs */
import { useEffect, useMemo, useRef, useState, type FC, type PropsWithChildren } from 'react';

import type { AppBreadcrumbItem, AppHistoryRoute } from '../../breadcrumbs';
import { useCookiesStore } from '../../cookies/hooks/useCookiesStore';
import { AppBreadcrumbsContext } from '../AppContexts';
import { useAppPreferences, useAppRouter } from '../hooks';

export const AppBreadcrumbsProvider: FC<PropsWithChildren> = ({ children }) => {
  const history = useRef<AppHistoryRoute[]>([]);

  const { breadcrumbs, location } = useAppRouter();

  const { allowBreadcrumbs } = useAppPreferences();

  const [items, setItems] = useState<AppBreadcrumbItem[]>([]);

  const show = useCookiesStore(state => allowBreadcrumbs && state.showBreadcrumbs);

  const setShow = useCookiesStore(state => state.setShowBreadcrumbs);

  useEffect(() => {
    // build history route.
    const hRoute = { route: location.pathname, path: location.pathname + location.search };

    // remove previous, add new history route
    history.current = history.current.filter(hr => hr.route !== hRoute.route);
    history.current.push(hRoute);

    // keep it under control.
    if (history.current.length > 100) {
      history.current = history.current.slice(-100);
    }

    // get breadcrumbs for current location.
    const _breadcrumbs = breadcrumbs(location);

    // replace the breadcrumb's path with latest entry in history.
    const _items = _breadcrumbs.map(_item => {
      const hRoute = history.current.find(hr => hr.route === _item.route);
      return hRoute ? { ..._item, path: hRoute.path } : _item;
    });

    setItems(_items);
  }, [breadcrumbs, location]);

  const context = useMemo(() => {
    return {
      initialized: true,
      show,
      items,
      history: history.current,
      setItems,
      toggle: () => setShow(!show)
    };
  }, [show, items, setShow]);

  return <AppBreadcrumbsContext.Provider value={context}>{children}</AppBreadcrumbsContext.Provider>;
};

export default AppBreadcrumbsProvider;
