import { appendRoute, BreadcrumbItem, getRoute } from 'commons/components/hooks/useAppSitemap';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export type SiteMapRoute = {
  path: string;
  title: string;
  isRoot?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode;
};

export interface SiteMapContextProps {
  lastOnly?: boolean;
  exceptLast?: boolean;
  allLinks?: boolean;
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
  const [breadcrumbs, setBreadcrumbs] = useState(
    appendRoute([getRoute('/', contextProps.routes)], getRoute(history.location.pathname, contextProps.routes))
  );

  useEffect(() => {
    // The return callback will ensure the event handler deregisters when component
    //  is unmounted.  Failure to do this will result in an event handler
    //  being registered each time this component renders.
    return history.listen(location => {
      const _matchedRoute = getRoute(location.pathname + location.search, contextProps.routes);
      const _breadcrumbs = appendRoute(breadcrumbs, _matchedRoute);
      setBreadcrumbs(_breadcrumbs);
    });
  });

  return <SiteMapContext.Provider value={{ breadcrumbs, ...contextProps }}>{children}</SiteMapContext.Provider>;
}

export default SiteMapProvider;
