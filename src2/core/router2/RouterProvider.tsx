import { useAppDrawer } from 'commons/components/app/hooks';
import { APP_DRAWER_ROUTES } from 'components/routes/routes';
import { useCallback, useEffect, useMemo } from 'react';
import { matchPath, Route, Routes, useLocation, useNavigate } from 'react-router';

const DRAWER_SEARCH_PARAM = 'drawer';

type ParsedDrawerRoute = {
  raw: string;
  pathname: string;
  search: string;
  hash: string;
};

const parseDrawerRoute = (value: string | null): ParsedDrawerRoute | null => {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);
    if (!url.pathname.startsWith('/')) return null;

    return {
      raw: value,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash
    };
  } catch {
    return null;
  }
};

const RouterProvider = () => {
  const drawer = useAppDrawer();
  const location = useLocation();
  const navigate = useNavigate();

  const drawerRoute = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return parseDrawerRoute(search.get(DRAWER_SEARCH_PARAM));
  }, [location.search]);

  const clearDrawerSearchParam = useCallback(() => {
    const search = new URLSearchParams(location.search);
    if (!search.has(DRAWER_SEARCH_PARAM)) return;

    search.delete(DRAWER_SEARCH_PARAM);

    navigate(
      {
        pathname: location.pathname,
        search: search.toString() ? `?${search.toString()}` : '',
        hash: location.hash
      },
      { replace: true, state: location.state }
    );
  }, [location.hash, location.pathname, location.search, location.state, navigate]);

  const hasMatchedDrawerRoute = useMemo(
    () =>
      !!drawerRoute &&
      APP_DRAWER_ROUTES.some(route => !!matchPath({ path: route.path, end: true }, drawerRoute.pathname)),
    [drawerRoute]
  );

  const drawerElement = useMemo(() => {
    if (!drawerRoute || !hasMatchedDrawerRoute) return null;

    return (
      <Routes
        location={{
          pathname: drawerRoute.pathname,
          search: drawerRoute.search,
          hash: drawerRoute.hash,
          state: null,
          key: `drawer:${drawerRoute.raw}`
        }}
      >
        {APP_DRAWER_ROUTES.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    );
  }, [drawerRoute, hasMatchedDrawerRoute]);

  useEffect(() => {
    if (!drawerRoute) {
      if (drawer.id?.startsWith('router:') && drawer.isOpen) {
        drawer.close();
      }
      return;
    }

    if (!hasMatchedDrawerRoute) {
      clearDrawerSearchParam();
      return;
    }

    const drawerId = `router:${drawerRoute.raw}`;

    if (!drawer.isOpen && drawer.id === drawerId) {
      return;
    }

    if (drawer.id !== drawerId || !drawer.isOpen) {
      drawer.open({
        id: drawerId,
        element: drawerElement,
        onClose: clearDrawerSearchParam
      });
    }
  }, [clearDrawerSearchParam, drawer, drawerElement, drawerRoute, hasMatchedDrawerRoute]);

  return null;
};

export default RouterProvider;
