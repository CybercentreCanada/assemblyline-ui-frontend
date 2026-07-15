import type { ListItemIconProps, ListItemTextProps } from '@mui/material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import type { LeftNavChildRenderProps } from '@tui/core';
import type { AppNavigateOptions, InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink, DEFAULT_APP_NAVIGATE_OPTIONS } from 'core/router';
import type { DependencyList, JSX } from 'react';
import { memo, useMemo } from 'react';

export type LeftNavLinkProps<Path extends AppRoute['route']> = InferAppNavigationPropsFromPath<Path> & {
  icon?: ListItemIconProps['children'];
  navOpen: boolean;
  navProps?: LeftNavChildRenderProps;
  primary?: ListItemTextProps['primary'];
  navOptions: AppNavigateOptions;
  navDeps: DependencyList;
};

function WrappedLeftNavRoute<const Path extends AppRoute['route']>({
  icon,
  navOpen,
  navProps,
  primary,
  from,
  here,
  to,
  at,
  navOptions = DEFAULT_APP_NAVIGATE_OPTIONS,
  navDeps = null
}: LeftNavLinkProps<Path>) {
  const theme = useTheme();
  const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);

  return (
    <ListItem disablePadding>
      <ListItemButton
        dense={level > 0}
        selected={active}
        sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
        {...(!to && !here && !from && !at ? null : { component: AppLink, to, here, from, at, navDeps, navOptions })}
      >
        {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
        <ListItemText primary={primary} />
      </ListItemButton>
    </ListItem>
  );
}

export const LeftNavRoute = memo(WrappedLeftNavRoute) as <const Path extends AppRoute['route']>(
  props: LeftNavLinkProps<Path>
) => JSX.Element | null;

WrappedLeftNavRoute.displayName = 'WrappedLeftNavRoute';
(LeftNavRoute as unknown as { displayName: string }).displayName = 'LeftNavRoute';
