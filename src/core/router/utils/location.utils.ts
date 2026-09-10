import type { AppLocationParamStore, AppRouterPage, AppRouterStore, InferAppLocationFromPath } from 'core/router';
import { getPageFromParam, removeRouteParamFromKey, sanitizePage, upsertRouteParamFromPage } from 'core/router';

//*****************************************************************************************
// External Href
//*****************************************************************************************

/**
 * @name getExternalHrefFromPage
 * @description Builds an external application href from a router page.
 * @param store - Location parameter store used to resolve the page route.
 * @param page - Router page to serialize.
 * @returns Serialized external href, or null when the page cannot be resolved.
 */
export const getExternalHrefFromPage = function (
  store: AppLocationParamStore,
  page: AppRouterPage
): AppRouterPage['href'] {
  const next = sanitizePage(store, page);
  return !next?.href ? null : `/v1#${next.href}`;
};

/**
 * @name getExternalHrefFromParam
 * @description Builds an external application href from typed route parameters.
 * @param store - Location parameter store used to resolve the route.
 * @param param - Typed route location parameters to serialize.
 * @returns Serialized external href, or null when the parameters cannot be resolved.
 */
export const getExternalHrefFromParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  param: InferAppLocationFromPath<Origin>
): AppRouterPage['href'] {
  const location = getPageFromParam(store, param);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// URL Decoding
//*****************************************************************************************

// export const parseRouteLocationFromHashFragment = function (fragment: string): AppRouterRoute | null {
//   if (!fragment) return null;

//   const hashIndex = fragment.indexOf('#');
//   if (hashIndex === -1) return { digest: hashObject({ href: fragment, state: null }), href: fragment, state: null };

//   const pathname = fragment.slice(0, hashIndex);
//   const hashAndSearch = fragment.slice(hashIndex + 1);
//   const searchIndex = hashAndSearch.indexOf('?');

//   const hash = searchIndex === -1 ? hashAndSearch : hashAndSearch.slice(0, searchIndex);
//   const search = searchIndex === -1 ? '' : hashAndSearch.slice(searchIndex);

//   try {
//     const href = `${pathname}${search}${hash ? `#${decodeURIComponent(hash)}` : ''}`;
//     return {
//       digest: hashObject({ href, state: null }),
//       href,
//       state: null
//     };
//   } catch {
//     return null;
//   }
// };

// export const getRouteLocationsFromLegacyURL = (
//   store: AppLocationParamStore,
//   url: Location<AppRouterState>
// ): AppRouterRoute[] => {
//   if (!url?.pathname || url.pathname === '/v1') return [];

//   const pathname = url.pathname === '/' ? '/submit' : url.pathname;
//   const href = `${pathname}${url.search || ''}${url.hash || ''}`;
//   const route: AppRouterRoute = {
//     digest: hashObject({ href, state: url.state ?? null }),
//     href,
//     state: url.state ?? null
//   };

//   const normalized = sanitizeRoute(store, route);
//   return normalized?.href ? [normalized] : [];
// };

// export const getRouteLocationsFromURLHash = (
//   store: AppLocationParamStore,
//   url: Location<AppRouterState>
// ): AppRouterRoute[] => {
//   if (url?.pathname !== '/v1' || !url?.hash) return [];

//   const hashFragment = url.hash.slice(1);
//   if (!hashFragment) return [];

//   return hashFragment
//     .split('#/')
//     .map((fragment, index) => {
//       const route = parseRouteLocationFromHashFragment(`${index === 0 ? '' : '/'}${fragment}`);
//       return sanitizeRoute(store, route);
//     })
//     .filter((parsedRoute): parsedRoute is AppRouterRoute => !!parsedRoute?.href);
// };

//*****************************************************************************************
// Location Store
//*****************************************************************************************

/**
 * @name syncRouteParamsFromRouter
 * @description Synchronizes route parameter snapshots with the pages in a router store.
 * @param store - Location parameter store to update.
 * @param router - Router store containing active pages.
 * @returns The updated location parameter store.
 */
export const syncRouteParamsFromRouter = function (
  store: AppLocationParamStore,
  router: AppRouterStore
): AppLocationParamStore {
  for (const pageKey of Object.keys(store?.locations || {})) {
    if (!(pageKey in (router?.pages || {}))) {
      store = removeRouteParamFromKey(store, pageKey);
    }
  }

  for (const [pageKey, route] of Object.entries(router?.pages || {})) {
    store = upsertRouteParamFromPage(store, pageKey, route);
  }

  return store;
};
