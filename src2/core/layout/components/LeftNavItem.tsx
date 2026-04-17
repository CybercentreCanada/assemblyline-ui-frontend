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
import { AppLink } from 'core/router';
import { AppListItemLink } from 'core/router/navigate/navigate.components';
import { useMemo } from 'react';

export type LeftNavLinkProps = {
  icon?: ListItemIconProps['children'];
  navOpen: boolean;
  navProps?: LeftNavChildRenderProps;
  primary?: ListItemTextProps['primary'];
  route?: string;
  preventRender?: boolean;
};

export const LeftNavLink = ({ icon, navOpen, navProps, primary, route }: LeftNavLinkProps) => {
  const theme = useTheme();
  const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={AppLink}
        path={route ?? '#'}
        dense={level > 0}
        selected={active}
        sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
      >
        {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
        <ListItemText primary={primary} />
      </ListItemButton>
    </ListItem>
  );
};

export const LeftNavRoute = ({ icon, navOpen, navProps, primary, route, preventRender = false }: LeftNavLinkProps) => {
  const theme = useTheme();
  const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);

  return (
    <ListItem disablePadding>
      <AppListItemLink
        path={route ?? '#'}
        params={null}
        dense={level > 0}
        selected={active}
        sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
      >
        {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
        <ListItemText primary={primary} />
      </AppListItemLink>
    </ListItem>
  );
};
