import { ListItemButton, ListItemButtonProps } from '@mui/material';
import type { AppRoute } from 'app/app.routes';
import { APP_ROUTES } from 'app/app.routes';
import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';
import { useAppLinkOnClick, useAppLinkTo, useAppNavigate } from './navigate.hooks';
import { AppRouteLink } from './navigate.models';

type RouterLinkProps = Omit<LinkProps, 'to' | 'pathname' | 'search' | 'hash'>;
type RouteLinkForPath<Path extends AppRoute['path']> = Extract<AppRouteLink, { path: Path }>;

export type AppLinkProps<Path extends AppRoute['path'] = AppRoute['path'], Props = RouterLinkProps> = Omit<
  Props,
  keyof RouteLinkForPath<Path>
> &
  RouteLinkForPath<Path>;

//*****************************************************************************************
// AppLink
//*****************************************************************************************

export function WrappedAppLink<const Path extends AppRoute['path']>(
  { children, ...props }: AppLinkProps<Path>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const to = useAppLinkTo(props);
  const handleClick = useAppLinkOnClick(props);

  return (
    <Link ref={ref} to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Path extends AppRoute['path']>(
  props: AppLinkProps<Path> & { ref?: React.ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

WrappedAppLink.displayName = 'WrappedAppLink';
(AppLink as React.FC<AppLinkProps>).displayName = 'AppLink';

//*****************************************************************************************
// AppListItemLink
//*****************************************************************************************

export const AppListItemLink = React.memo(
  ({
    children,
    hash,
    path,
    params,
    search,
    variant = 'open',
    panel,
    onClick,
    ...props
  }: AppLinkProps<AppRoute['path'], ListItemButtonProps>) => {
    const navigate = useAppNavigate();

    const href = useMemo(() => {
      const route = APP_ROUTES.find(r => r.path === path);
      const resolvedPath =
        route?.params && params
          ? route.params.stringify(params as never)
          : params
            ? Object.entries(params).reduce(
                (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
                path
              )
            : path;

      const resolvedSearch =
        search == null || !route?.search ? '' : `?${route.search.full(search as never).toString()}`;
      const resolvedHash = hash == null ? '' : String(hash).startsWith('#') ? String(hash) : `#${String(hash)}`;

      return `${resolvedPath}${resolvedSearch}${resolvedHash}`;
    }, [hash, params, path, search]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (variant === 'to') {
          navigate(href, { variant: 'to', panel: panel ?? 0 });
        } else {
          navigate(href, { variant });
        }
      },
      [href, navigate, onClick, panel, variant]
    );

    return (
      <ListItemButton component={Link} to={href} onClick={handleClick} {...props}>
        {children}
      </ListItemButton>
    );
  }
);

AppListItemLink.displayName = 'AppListItemLink';
