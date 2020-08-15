import { SiteMapContext, SiteMapRoute } from 'commons/components/sitemap/SitemapProvider';
import { useContext, useEffect, useState } from 'react';
import { match, matchPath, useHistory } from 'react-router-dom';

export type BreadcrumbItem = { route: SiteMapRoute; matcher: match };

const getRoute = (route: string, siteMap: SiteMapRoute[]): BreadcrumbItem => {
  // match all the route provide in sitemap with current route.
  const matchers = siteMap.map(_route => {
    const matcher = matchPath(route, { path: _route.path });
    return { route: _route, matcher };
  });

  // only keep the exact matched routes.
  const matched = matchers.filter(m => m.matcher && m.matcher.isExact);

  // hopefully, we only have a single match.
  if (matched && matched.length > 1) {
    // eslint-disable-next-line no-console
    console.warn(`Found more than one sitemap route match for: ${route}`);
  }
  return matched && matched[0] ? matched[0] : null;
};

const appendRoute = (breadcrumbs: BreadcrumbItem[], breadcrumb: BreadcrumbItem): BreadcrumbItem[] => {
  // If the 'siteRoute' is null/undefined, we ignore it.
  if (breadcrumb) {
    // If a root route, then we reset the breadcrumbs.
    if (breadcrumb.route.isRoot) {
      return [breadcrumb];
    }
    // If the last element of bread is a leaf, then we remove it.
    if (breadcrumbs[breadcrumbs.length - 1].route.isLeaf) {
      // eslint-disable-next-line no-param-reassign
      breadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
    }
    // See if the route is already in the breadcrumbs.
    const index = breadcrumbs.findIndex(_breadcrumb => _breadcrumb.route.path === breadcrumb.route.path);
    // If the route is already in breacrumbs, then we slice off what comes after,
    //  if not then we append it to the end.
    return index > -1 ? breadcrumbs.slice(0, index + 1) : [...breadcrumbs, breadcrumb];
  }
  return breadcrumbs;
};

// We need to dynamically build the title since it will be language/locale specific and therefore we cannot
//  rely on the cached version since language might have changed since then.
const resolveTitle = (breadcrumb: BreadcrumbItem, siteMap: SiteMapRoute[]) => {
  // we need to refetch the route in order to ensure we have the correct language.
  let title = breadcrumb.route.path ? getRoute(breadcrumb.route.path, siteMap).route.title : breadcrumb.route.title;
  // if there are any parameters in match, replace them in title.
  if (breadcrumb.matcher && breadcrumb.matcher.params) {
    const { params } = breadcrumb.matcher;
    Object.keys(params).forEach(k => {
      title = title.replace(`{:${k}}`, params[k]);
    });
  }
  return title;
};

export default function useSitemap() {
  const history = useHistory();
  const sitemap = useContext(SiteMapContext);
  const [breadcrumbs, setBreadcrumbs] = useState(
    appendRoute([getRoute('/', sitemap.routes)], getRoute(history.location.pathname, sitemap.routes))
  );

  useEffect(() => {
    // The return callback will ensure the event handler deregisters when component
    //  is unmounted.  Failure to do this will result in an event handler
    //  being registered each time this component renders.
    return history.listen(location => {
      const _matchedRoute = getRoute(location.pathname + location.search, sitemap.routes);
      const _breadcrumbs = appendRoute(breadcrumbs, _matchedRoute);
      setBreadcrumbs(_breadcrumbs);
    });
  });

  return {
    breadcrumbs,
    sitemap,
    resolveTitle: (breadcrumb: BreadcrumbItem) => resolveTitle(breadcrumb, sitemap.routes),
    getSiteRoute: (path: string) => getRoute(path, sitemap.routes),
    last: () => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : breadcrumbs[0]),
    first: () => breadcrumbs[0]
  };
}
