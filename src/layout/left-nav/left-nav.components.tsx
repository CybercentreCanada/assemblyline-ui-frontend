import type { ListItemIconProps, ListItemTextProps } from '@mui/material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import type { LeftNavChildRenderProps } from '@tui/core';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink } from 'core/router';
import type { JSX } from 'react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type LeftNavLinkProps<Origin extends AppRoute['path']> = InferAppNavigationPropsFromPath<Origin> & {
  icon?: ListItemIconProps['children'];
  i18nKey?: string;
  navOpen: boolean;
  navProps?: LeftNavChildRenderProps;
  ns?: string;
  primary?: ListItemTextProps['primary'];
};

function WrappedLeftNavRoute<const Origin extends AppRoute['path']>({
  icon,
  navOpen,
  navProps,
  i18nKey,
  ns,
  nav,
  navDeps = null,
  primary
}: LeftNavLinkProps<Origin>) {
  const { t } = useTranslation(ns);
  const theme = useTheme();
  const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);

  return (
    <ListItem disablePadding>
      <ListItemButton
        dense={level > 0}
        selected={active}
        sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
        {...(!nav ? null : { component: AppLink, nav, navDeps })}
      >
        {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
        <ListItemText primary={i18nKey ? t(i18nKey) : primary} />
      </ListItemButton>
    </ListItem>
  );
}

export const LeftNavRoute = memo(WrappedLeftNavRoute) as <const Origin extends AppRoute['path']>(
  props: LeftNavLinkProps<Origin>
) => JSX.Element | null;

WrappedLeftNavRoute.displayName = 'WrappedLeftNavRoute';
(LeftNavRoute as unknown as { displayName: string }).displayName = 'LeftNavRoute';
