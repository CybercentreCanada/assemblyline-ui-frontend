/* eslint-disable react-hooks/exhaustive-deps */
import { appendRoute, BreadcrumbItem, getRoute } from 'commons_deprecated/components/hooks/useAppSitemap';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAppUser from '../hooks/useAppUser';

export type SiteMapRoute = {
  path: string;
  title: string;
  icon?: React.ReactNode;
  isRoot?: boolean;
  isLeaf?: boolean;
  exclude?: boolean;
  breadcrumbs?: string[];
};

export interface SiteMapContextProps {
  lastOnly?: boolean;
  exceptLast?: boolean;
  allLinks?: boolean;
  itemsBefore?: number;
  itemsAfter?: number;
  routes: SiteMapRoute[];
}

interface SiteMapProviderProps extends SiteMapContextProps {
  children: React.ReactNode;
}

export interface SitemapProviderContextProps extends SiteMapContextProps {
  breadcrumbs: BreadcrumbItem[];
}

export const SiteMapContext = React.createContext<SitemapProviderContextProps>(null);

function SiteMapProvider(props: SiteMapProviderProps) {
  const { children, ...contextProps } = props;
  const location = useLocation();
  const { isReady } = useAppUser();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const isUserReady = isReady();

  // Reset the breadcrumbs if the user ready state changes.
  useEffect(() => {
    setBreadcrumbs(appendRoute([getRoute('/', contextProps.routes)], getRoute(location.pathname, contextProps.routes)));
  }, [isUserReady]);

  // useEffect(() =>
  //   // The return callback will ensure the event handler deregisters when component
  //   //  is unmounted.  Failure to do this will result in an event handler
  //   //  being registered each time this component renders.
  //   history.listen(location => {
  //     const _matchedRoute = getRoute(location.pathname, contextProps.routes);
  //     const _breadcrumbs = appendRoute(breadcrumbs, _matchedRoute);
  //     setBreadcrumbs(_breadcrumbs);
  //   })
  // );

  useEffect(() => {
    const _matchedRoute = getRoute(location.pathname, contextProps.routes);
    const _breadcrumbs = appendRoute(breadcrumbs, _matchedRoute);
    setBreadcrumbs(_breadcrumbs);
  }, [location]);

  return <SiteMapContext.Provider value={{ breadcrumbs, ...contextProps }}>{children}</SiteMapContext.Provider>;
}

export default SiteMapProvider;