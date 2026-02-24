import React from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { useNavigate, type NavigateTo } from '../hooks/useNavigate';
import type { AppRoutes } from '../store/routes';

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

export type LinkProps = { to: string } & Omit<RouterLinkProps, 'to' | 'pathname' | 'search' | 'hash'>;

// export const Link = React.memo(({ to, panel, params, search, hash, ...props }: LinkProps) => {
export const Link = React.memo(({ to, onClick, ...props }: LinkProps) => {
  // const { panel: currentPanel } = usePanel();
  // const { resolveHref, resolveTo } = useRouterActions();
  const navigate = useNavigate();

  // const href =
  //   typeof to === 'string'
  //     ? resolveHref(to, { fromPanel: currentPanel, panel })
  //     : resolveTo(to, { fromPanel: currentPanel, panel, params, search, hash });

  // const href = useMemo(() => resolveTo(to) , [])

  return (
    <RouterLink
      // to={href}
      to={to}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        navigate(to);
      }}
      {...props}
    />
  );
});
