import React, { useCallback } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { useNavigate, type NavigateTo } from '../hooks/useNavigate';
import { AppRoutes } from './Routes';

type AppRoute = AppRoutes[number];

export type LinkProps2 = Omit<RouterLinkProps, 'to'> & {
  to: string | NavigateTo | AppRoute;
};

export type LinkProps = { variant?: 'open' | 'replace' | 'to'; panel: number; to: string } & Omit<
  RouterLinkProps,
  'to' | 'pathname' | 'search' | 'hash'
>;

export const Link = React.memo(({ variant = 'open', panel = null, to, onClick, ...props }: LinkProps) => {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      navigate(to, { variant, panel });
    },
    [navigate]
  );

  return <RouterLink to={to} onClick={handleClick} {...props} />;
});

Link.displayName = 'Link';
