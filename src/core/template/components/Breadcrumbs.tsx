import { MoreHoriz } from '@mui/icons-material';
import { Link, Breadcrumbs as MuiBreadcrumbs, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { getAppConfigStateFromApi, useAppConfigStoreApi } from 'core/config';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink, getPageFromPanelKey, useAppRouterStore } from 'core/router';
import {
  findAppRouteFromPage,
  getAppLocationParamStateFromApi,
  getRouteParamFromPage,
  RouteName,
  useAppLocationParamStore,
  useAppLocationParamStoreApi
} from 'core/routes';
import { getAncestorAppRoutes } from 'core/template/template.utils';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ITEMS_BEFORE = 1;
const ITEMS_AFTER = 2;

//*****************************************************************************************
// Breadcrumb Icon
//*****************************************************************************************

export type BreadcrumbIconProps = {
  location?: unknown;
  route: AppRoute;
};

export const BreadcrumbIcon = memo(({ location = null, route }: BreadcrumbIconProps) => {
  const theme = useTheme();

  const configStoreApi = useAppConfigStoreApi();

  const icon = route.shorticon?.(location as never, getAppConfigStateFromApi(configStoreApi));

  return !icon ? null : (
    <>
      {icon}
      <span style={{ marginRight: theme.spacing(1) }} />
    </>
  );
});

BreadcrumbIcon.displayName = 'BreadcrumbIcon';

//*****************************************************************************************
// Breadcrumb Last Item
//*****************************************************************************************

export type BreadcrumbLastItemProps = {
  location: unknown;
  route: AppRoute;
};

export const BreadcrumbLastItem = memo(({ location, route }: BreadcrumbLastItemProps) => {
  const configStoreApi = useAppConfigStoreApi();

  const name = route.shortname?.(location as never, getAppConfigStateFromApi(configStoreApi));

  return (
    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
      <BreadcrumbIcon location={location} route={route} />
      <Tooltip title={route.path}>
        <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <RouteName name={name} fallback={route.path} />
        </span>
      </Tooltip>
    </Typography>
  );
});

BreadcrumbLastItem.displayName = 'BreadcrumbLastItem';

//*****************************************************************************************
// Breadcrumb Link Item
//*****************************************************************************************

export type BreadcrumbLinkItemProps = {
  route: AppRoute;
};

export const BreadcrumbLinkItem = memo(({ route }: BreadcrumbLinkItemProps) => {
  const configStoreApi = useAppConfigStoreApi();

  const nav = useCallback<NonNullable<InferAppNavigationPropsFromPath<AppRoute['path']>['nav']>>(
    navigate => navigate.at(0).only({ route: route.path } as never),
    [route.path]
  );

  const name = route.shortname?.(null as never, getAppConfigStateFromApi(configStoreApi));

  return (
    <Link component={AppLink} nav={nav} color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
      <BreadcrumbIcon route={route} />
      <Tooltip title={route.path}>
        <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <RouteName name={name} fallback={route.path} />
        </span>
      </Tooltip>
    </Link>
  );
});

BreadcrumbLinkItem.displayName = 'BreadcrumbLinkItem';

//*****************************************************************************************
// Breadcrumbs Ellipsis
//*****************************************************************************************

export type BreadcrumbsEllipsisProps = {
  expanded: boolean;
  onClick: () => void;
};

export const BreadcrumbsEllipsis = memo(({ onClick, expanded }: BreadcrumbsEllipsisProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t(expanded ? 'tooltip.breadcrumbs.min' : 'tooltip.breadcrumbs.max')}>
      <MoreHoriz
        fontSize="small"
        sx={{ verticalAlign: 'bottom', marginTop: '5px', display: 'inline-flex', '&:hover': { cursor: 'pointer' } }}
        onClick={onClick}
      />
    </Tooltip>
  );
});

BreadcrumbsEllipsis.displayName = 'BreadcrumbsEllipsis';

//*****************************************************************************************
// Split Items
//*****************************************************************************************

/**
 * @name splitItems
 * @description Splits the breadcrumb trail into leading/trailing slices around an optional ellipsis, matching the deprecated BreadcrumbList behaviour.
 * @param routes - Full breadcrumb trail, root first
 * @param itemsBeforeCount - Max routes to show before the ellipsis
 * @param itemsAfterCount - Max routes to show after the ellipsis when collapsed
 * @param expanded - Whether the ellipsis has been expanded to reveal every item
 * @returns Leading routes, trailing routes, and whether an ellipsis is needed
 */
const splitItems = (
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

//*****************************************************************************************
// App Breadcrumbs
//*****************************************************************************************

export const AppBreadcrumbs = memo(() => {
  const theme = useTheme();
  const locationParamStoreApi = useAppLocationParamStoreApi();

  const [expanded, setExpanded] = useState<boolean>(false);

  const isMedium = useMediaQuery(theme.breakpoints.up('md'));

  const page = useAppRouterStore(s => getPageFromPanelKey(s, 0));
  const routes = useAppLocationParamStore(s => {
    const route = findAppRouteFromPage(s, page);
    return getAncestorAppRoutes(s, route);
  });

  const location = useMemo(() => {
    const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
    return getRouteParamFromPage(locationState, page);
  }, [locationParamStoreApi, page]);

  const toggleExpanded = useCallback(() => setExpanded(current => !current), []);

  if (!routes.length || !isMedium) return null;

  const itemsBefore = isMedium ? ITEMS_BEFORE : 0;
  const itemsAfter = isMedium ? ITEMS_AFTER : 1;
  const { before, after, hasEllipsis } = splitItems(routes, itemsBefore, itemsAfter, expanded);
  const last = after[after.length - 1];
  const middle = after.slice(0, -1);

  return (
    <MuiBreadcrumbs
      aria-label="breadcrumb"
      maxItems={1000}
      sx={{ color: 'inherit', display: 'flex', alignItems: 'center' }}
    >
      {before.map(route => (
        <BreadcrumbLinkItem key={route.path} route={route} />
      ))}
      {hasEllipsis && <BreadcrumbsEllipsis expanded={expanded} onClick={toggleExpanded} />}
      {middle.map(route => (
        <BreadcrumbLinkItem key={route.path} route={route} />
      ))}
      {last && <BreadcrumbLastItem location={location} route={last} />}
    </MuiBreadcrumbs>
  );
});

AppBreadcrumbs.displayName = 'AppBreadcrumbs';
