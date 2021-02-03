/* eslint-disable react-hooks/exhaustive-deps */
import { appendRoute, BreadcrumbItem, getRoute } from 'commons/components/hooks/useAppSitemap';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
  const { isReady } = useAppUser();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const isUserReady = isReady();

  // Reset the breadcrumbs if the user ready state changes.
  useEffect(() => {
    setBreadcrumbs(
      appendRoute([getRoute('/', contextProps.routes)], getRoute(history.location.pathname, contextProps.routes))
    );
  }, [isUserReady]);

  useEffect(() => {
    // The return callback will ensure the event handler deregisters when component
    //  is unmounted.  Failure to do this will result in an event handler
    //  being registered each time this component renders.
    return history.listen(location => {
      const _matchedRoute = getRoute(location.pathname, contextProps.routes);
      const _breadcrumbs = appendRoute(breadcrumbs, _matchedRoute);
      setBreadcrumbs(_breadcrumbs);
    });
  });

  return <SiteMapContext.Provider value={{ breadcrumbs, ...contextProps }}>{children}</SiteMapContext.Provider>;
}

export default SiteMapProvider;
