import React from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { AnyTypedRoute, PathParams } from '../models/router.models';
import type { RoutePanel } from '../providers/RouteProvider';
import { useOptionalRouteContext } from '../providers/RouteProvider';
import { useRouterContext } from '../providers/RouterProvider';

type RouteTargetProps = { to: AnyTypedRoute; params?: Record<string, string> };

export type LinkProps = Omit<RouterLinkProps, 'to'> &
  ({ to: string; params?: never } | RouteTargetProps) & {
    panel?: RoutePanel;
  };

export const Link = React.memo(({ to, ...props }: LinkProps) => {
  const routeContext = useOptionalRouteContext();
  const { resolveHref } = useRouterContext();
  const panel = props.panel ?? routeContext?.panel ?? 'main';
  const { panel: _panel, ...restProps } = props;

  if (typeof to === 'string') {
    const href = resolveHref(to, panel);
    return <RouterLink to={href} {...restProps} />;
  }

  const { params, ...rest } = restProps;
  const href = resolveHref(to.to((params ?? {}) as PathParams<typeof to.path>), panel);

  return <RouterLink to={href} {...rest} />;
});
