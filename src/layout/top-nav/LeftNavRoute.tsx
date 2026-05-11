import type { ListItemIconProps, ListItemTextProps } from '@mui/material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import type { LeftNavChildRenderProps } from '@tui/core';
import { AppLink } from 'core/router';
import type { AppRoute, CreatedAppRouteParamsMap } from 'core/routes';
import type { JSX } from 'react';
import { memo, useMemo } from 'react';

export type LeftNavLinkProps<Route extends AppRoute> = {
  icon?: ListItemIconProps['children'];
  navOpen: boolean;
  navProps?: LeftNavChildRenderProps;
  primary?: ListItemTextProps['primary'];
  to?: CreatedAppRouteParamsMap<Route>;
  onClick?: ListItemIconProps['onClick'];
};

function WrappedLeftNavRoute<const Route extends AppRoute>({
  icon,
  navOpen,
  navProps,
  primary,
  to = null,
  onClick = () => null
}: LeftNavLinkProps<Route>) {
  const theme = useTheme();
  const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);

  return (
    <ListItem disablePadding>
      <ListItemButton
        dense={level > 0}
        selected={active}
        sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
        {...(!to ? null : { component: AppLink, to })}
      >
        {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
        <ListItemText primary={primary} />
      </ListItemButton>
    </ListItem>
  );
}

export const LeftNavRoute = memo(WrappedLeftNavRoute) as <const Route extends AppRoute>(
  props: LeftNavLinkProps<Route>
) => JSX.Element | null;

WrappedLeftNavRoute.displayName = 'WrappedLeftNavRoute';
(LeftNavRoute as unknown as { displayName: string }).displayName = 'LeftNavRoute';
