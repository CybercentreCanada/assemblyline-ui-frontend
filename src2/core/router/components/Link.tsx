import React, { useCallback } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { useNavigate, type NavigateTo } from '../hooks/useNavigate';
import { AppRoutes } from './Routes';

// 'open' | 'replace'

type AppRoute = AppRoutes[number];

export type LinkProps2 = Omit<RouterLinkProps, 'to'> & {
  to: string | NavigateTo | AppRoute;

  // panel?: RoutePanel;
  // params?: Record<string, string | number | boolean>;
  // search?: Record<string, string | number | boolean | null | undefined>;
  // hash?: string;
};

// export type LinkProps = ({ to: string } | Partial<Path>) & Omit<RouterLinkProps, 'to' | 'pathname' | 'search' | 'hash'>;

export type LinkProps = { type?: 'open' | 'replace' | number; to: string } & Omit<
  RouterLinkProps,
  'to' | 'pathname' | 'search' | 'hash'
>;

// export const Link = React.memo(({ to, panel, params, search, hash, ...props }: LinkProps) => {
export const Link = React.memo(({ to, type = 'open', onClick, ...props }: LinkProps) => {
  // const { panel: currentPanel } = usePanel();
  // const { resolveHref, resolveTo } = useRouterActions();
  const navigate = useNavigate();

  // const href =
  //   typeof to === 'string'
  //     ? resolveHref(to, { fromPanel: currentPanel, panel })
  //     : resolveTo(to, { fromPanel: currentPanel, panel, params, search, hash });

  // const href = useMemo(() => resolveTo(to) , [])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      navigate(type, to);
    },
    [navigate, type]
  );

  return (
    <RouterLink
      // to={href}
      to={to}
      onClick={handleClick}
      {...props}
    />
  );
});

Link.displayName = 'Link';
