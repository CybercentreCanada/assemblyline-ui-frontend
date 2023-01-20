import {
  SiteMapContext,
  SiteMapContextProps,
  SiteMapRoute
} from 'commons_deprecated/components/sitemap/SitemapProvider';
import i18n from 'i18n';
import { useContext } from 'react';
import { matchPath } from 'react-router-dom';

const TITLE_404 = i18n.t('breadcrumb.404');

export type BreadcrumbItem = { route: SiteMapRoute; matcher: any };

type SitemapProps = {
  breadcrumbs: BreadcrumbItem[];
  props: SiteMapContextProps;
  resolveTitle: (breadcrumb: BreadcrumbItem) => string;
  getSiteRoute: (path: string) => BreadcrumbItem;
  last: () => BreadcrumbItem;
  first: () => BreadcrumbItem;
  is404: (breadcrumb: BreadcrumbItem) => boolean;
};

export const getRoute = (route: string, siteMap: SiteMapRoute[]): BreadcrumbItem => {
  // match all the route provide in sitemap with current route.
  const matchers = siteMap.map(_route => {
    const matcher = matchPath({ path: _route.path }, route);
    return { route: _route, matcher };
  });

  // only keep the exact matched routes.
  const matched = matchers.filter(m => m.matcher);

  // hopefully, we only have a single match.
  if (matched && matched.length > 1) {
    // eslint-disable-next-line no-console
    console.warn(`Found more than one sitemap route match for: ${route}`);
  }
  return matched && matched[0] ? matched[0] : { route: { path: route, title: TITLE_404 }, matcher: null };
};

export const appendRoute = (breadcrumbs: BreadcrumbItem[], breadcrumb: BreadcrumbItem): BreadcrumbItem[] => {
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
    return index > -1 ? [...breadcrumbs.slice(0, index), breadcrumb] : [...breadcrumbs, breadcrumb];
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

const is404 = (breadcrumb: BreadcrumbItem) => breadcrumb.route.title === TITLE_404;

export default function useAppSitemap(): SitemapProps {
  const { breadcrumbs, ...props } = useContext(SiteMapContext);
  return {
    breadcrumbs,
    props,
    resolveTitle: (breadcrumb: BreadcrumbItem) => resolveTitle(breadcrumb, props.routes),
    getSiteRoute: (path: string) => getRoute(path, props.routes),
    last: () => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : breadcrumbs[0]),
    first: () => breadcrumbs[0],
    is404
  };
}
