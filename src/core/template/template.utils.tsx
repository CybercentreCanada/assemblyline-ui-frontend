import { Divider } from '@mui/material';
import type { LeftNavMenuItem } from '@tui/core';
import type { AppLocationParamStore } from 'core/routes';
import { findAppRouteFromPath } from 'core/routes';
import { LeftNavRoute } from 'core/template/components/LeftNavRoute';
import type { AppLeftNavItem } from 'core/template/template.models';
import type { TFunction } from 'i18next';

//*****************************************************************************************
// Breadcrumbs
//*****************************************************************************************

/**
 * @name getAncestorAppRoutes
 * @description Walks a route's `ancestor` chain and returns the full breadcrumb trail, from root to the route itself.
 * @param route - Route to start the walk from
 * @param store - Location param store used to resolve each ancestor by path
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

//*****************************************************************************************
// Left Nav
//*****************************************************************************************

/**
 * @name isRouteHidden
 * @description Determines whether a route should be excluded from navigation based on its disabled/forbidden state.
 * @param route - Route to evaluate, or null for non-route items
 * @param configState - Current app config store state used to resolve conditional route flags
 * @returns True when the route should not be rendered
 */
export const isRouteHidden = (route: AppRoute | null, configState: AppConfigStore): boolean =>
  Boolean(
    (typeof route?.disabled === 'function' ? route.disabled(null as never, configState) : route?.disabled) ||
      (typeof route?.forbidden === 'function' ? route.forbidden(null as never, configState) : route?.forbidden)
  );

/**
 * @name getLeftNavMenuItem
 * @description Recursively converts an app left-nav item into a template menu item, dropping hidden routes and empty menus.
 * @param item - Left-nav item to convert
 * @param index - Position within the parent list, used to build a fallback id/label
 * @param store - Location param store used to resolve the item's route from `link.route`
 * @param configState - Current app config store state used to resolve route visibility
 * @param t - Reactive translate function from `useTranslation()`, used to resolve menu group labels
 * @returns Converted menu item, or null when the item should not be rendered
 */
export const getLeftNavMenuItem = (
  { link = null, divider = false, items = [] }: AppLeftNavItem,
  index: number,
  store: AppLocationParamStore,
  configState: AppConfigStore,
  t: TFunction
): LeftNavMenuItem | null => {
  if (divider) return { id: `divider-${index}`, type: 'slot', render: () => <Divider /> };

  const route = link?.route ? findAppRouteFromPath(store, link.route as never) : null;
  const id = `${route?.path} - ${index}`;
  const name = route?.shortname?.(link as never, configState);
  const icon = route?.shorticon?.(link as never, configState) ?? null;

  if (items.length) {
    const nextItems = items
      .map((child, childIndex) => getLeftNavMenuItem(child, childIndex, store, configState, t))
      .filter((child): child is LeftNavMenuItem => child !== null);

    return nextItems.length ? { id, type: 'menu', i18nKey: name?.i18nKey, icon, items: nextItems } : null;
  }

  if (isRouteHidden(route, configState)) return null;

  return {
    id,
    type: 'slot',
    withProps: true,
    render: (navOpen, navProps) => (
      <LeftNavRoute
        i18nKey={name?.i18nKey}
        ns={name?.ns}
        icon={icon}
        nav={link ? navigate => navigate.to().only(link as never) : undefined}
        navOpen={navOpen}
        navProps={navProps}
      />
    )
  };
};
