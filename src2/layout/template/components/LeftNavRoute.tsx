import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemIconProps,
  ListItemText,
  ListItemTextProps,
  useTheme
} from '@mui/material';
import { LeftNavChildRenderProps } from '@tui/core';
import { AppLink, useAppRouteLocation } from 'core/router';
import { CreatedAppRouteParamsMap, createAppRoute } from 'core/routes';
import React, { useMemo } from 'react';

export type LeftNavLinkProps = {
  icon?: ListItemIconProps['children'];
  navOpen: boolean;
  navProps?: LeftNavChildRenderProps;
  preventRender?: boolean;
  primary?: ListItemTextProps['primary'];
  routes?: readonly ReturnType<typeof createAppRoute>[];
  to?: CreatedAppRouteParamsMap;
};

export const LeftNavRoute = React.memo(
  ({ icon, navOpen, navProps, primary, to: toProp = null, preventRender = false, routes = null }: LeftNavLinkProps) => {
    const theme = useTheme();
    const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);

    const { href, state } = useAppRouteLocation(toProp as never);

    return (
      <ListItem disablePadding>
        <ListItemButton
          dense={level > 0}
          selected={active}
          sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
          {...(!href ? null : { component: AppLink, to: href, state: state })}
        >
          {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
          <ListItemText primary={primary} />
        </ListItemButton>
      </ListItem>
    );
  }
);

LeftNavRoute.displayName = 'LeftNavRoute';
