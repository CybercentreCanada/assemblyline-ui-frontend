import React from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import type { NavigateTo } from '../hooks/useNavigate';
import { usePanel, type RoutePanel } from '../providers/PanelProvider';
import { useRouter } from '../providers/RouterProvider';
import type { AppRoutes } from '../store/routes';

type AppRoute = AppRoutes[number];

export type LinkProps = Omit<RouterLinkProps, 'to'> & {
  to: string | NavigateTo | AppRoute;
  panel?: RoutePanel;
  params?: Record<string, string | number | boolean>;
  search?: Record<string, string | number | boolean | null | undefined>;
  hash?: string;
};

const buildHref = (
  to: NavigateTo | AppRoute,
  opts?: {
    params?: Record<string, string | number | boolean>;
    search?: Record<string, string | number | boolean | null | undefined>;
    hash?: string;
  }
) => {
  const paramsSource = (('params' in to && to.params) || opts?.params) as
    | Record<string, string | number | boolean>
    | undefined;

  const withParams = paramsSource
    ? Object.entries(paramsSource).reduce(
        (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
        to.path
      )
    : to.path;

  const searchSource = ('search' in to ? to.search : undefined) ?? opts?.search;
  const search = searchSource
    ? new URLSearchParams(
        Object.entries(searchSource).reduce<Record<string, string>>((acc, [key, value]) => {
          if (value === undefined || value === null) return acc;
          return { ...acc, [key]: String(value) };
        }, {})
      ).toString()
    : '';

  const hashValue = ('hash' in to ? to.hash : undefined) ?? opts?.hash;
  const hash = typeof hashValue === 'string' && hashValue.length > 0 ? `#${hashValue}` : '';

  return `${withParams}${search ? `?${search}` : ''}${hash}`;
};

export const Link = React.memo(({ to, panel, params, search, hash, ...props }: LinkProps) => {
  const { panel: currentPanel } = usePanel();
  const { resolveHref } = useRouter();

  const href = typeof to === 'string' ? to : buildHref(to, { params, search, hash });

  return <RouterLink to={resolveHref(href, { fromPanel: currentPanel, panel })} {...props} />;
});
