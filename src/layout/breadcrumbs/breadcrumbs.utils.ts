import type { AppLocationParamStore } from 'core/routes';
import { findAppRouteFromPath } from 'core/routes';

/**
 * @name getAncestorAppRoutes
 * @description Walks a route's `ancestor` chain and returns the full breadcrumb trail, from root to the route itself.
 * @param store - Location param store used to resolve each ancestor by path
 * @param route - Route to start the walk from
 * @returns Ordered routes, starting with the root ancestor and ending with `route`
 */
export const getAncestorAppRoutes = (store: AppLocationParamStore, route: AppRoute): AppRoute[] => {
  const chain: AppRoute[] = [];
  let current = route;

  while (current?.path) {
    chain.unshift(current);
    current = current.ancestor ? findAppRouteFromPath(store, current.ancestor as never) : null;
  }

  return chain;
};

/**
 * @name splitItems
 * @description Splits the breadcrumb trail into leading/trailing slices around an optional ellipsis, matching the deprecated BreadcrumbList behaviour.
 * @param routes - Full breadcrumb trail, root first
 * @param itemsBeforeCount - Max routes to show before the ellipsis
 * @param itemsAfterCount - Max routes to show after the ellipsis when collapsed
 * @param expanded - Whether the ellipsis has been expanded to reveal every item
 * @returns Leading routes, trailing routes, and whether an ellipsis is needed
 */
export const splitItems = (
  routes: AppRoute[],
  itemsBeforeCount: number,
  itemsAfterCount: number,
  expanded: boolean
): { before: AppRoute[]; after: AppRoute[]; hasEllipsis: boolean } => {
  const hasEllipsis = routes.length > itemsBeforeCount + itemsAfterCount;
  if (!hasEllipsis) return { before: [], after: routes, hasEllipsis: false };

  const before = routes.slice(0, itemsBeforeCount);
  const after = expanded ? routes.slice(itemsBeforeCount) : routes.slice(routes.length - itemsAfterCount);
  return { before, after, hasEllipsis: true };
};
