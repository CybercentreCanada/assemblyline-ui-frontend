import { APP_ROUTES, AppRoute } from 'app/app.routes';
import React, { ReactNode, useCallback, useMemo } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';
import { PathParamKeyForPath } from '../path-params/path-params.models';
import { useAppNavigate } from './navigate.hooks';

//*****************************************************************************************
// Link
//*****************************************************************************************
type LinkBaseProps = { variant?: 'open' | 'replace' | 'to'; panel?: number } & Omit<
  LinkProps,
  'to' | 'pathname' | 'search' | 'hash'
>;

// prettier-ignore
export type AppLinkProps =
   AppRoute extends infer Route
    ? Route extends AppRoute
      ? (
          & {
              children: ReactNode;
              onClick?: LinkProps["onClick"]
            }
          & { path: Route['path']}
          & (
              [PathParamKeyForPath<Route['path']>] extends [never]
                ? { params?: never }
                : { params: NonNullable<Route['params']>['type'] }
            )
          & (
              | { variant?: 'open', panel?: never }
              | { variant?: 'replace', panel?: never }
              | { variant?: 'to', panel: number }
            )
        )
      : never
    : never

export const AppLink = React.memo(
  ({ children, path, params, variant = 'open', panel, onClick, ...props }: AppLinkProps) => {
    const navigate = useAppNavigate();

    const href = useMemo(() => {
      const route = APP_ROUTES.find(r => r.path === path);
      if (!route?.params || !params) return path;
      return route.params.stringify(params as never);
    }, [params, path]);

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
      <Link to={href} onClick={handleClick} {...props}>
        {children}
      </Link>
    );
  }
);

Link.displayName = 'Link';
