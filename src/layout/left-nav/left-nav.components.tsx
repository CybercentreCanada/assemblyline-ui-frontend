import type { ListItemIconProps, ListItemTextProps } from '@mui/material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { useAppLeftNav, type LeftNavChildRenderProps } from '@tui/core';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink } from 'core/router';
import type { RouteName } from 'core/routes';
import type { JSX } from 'react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui/Tooltip';

export type LeftNavLinkProps<Origin extends AppRoute['path']> = InferAppNavigationPropsFromPath<Origin> & {
  icon?: ListItemIconProps['children'];
  name?: RouteName;
  navOpen: boolean;
  navProps?: LeftNavChildRenderProps;
  primary?: ListItemTextProps['primary'];
};

function WrappedLeftNavRoute<const Origin extends AppRoute['path']>({
  icon,
  navOpen,
  navProps,
  name,
  nav,
  navDeps = null,
  primary
}: LeftNavLinkProps<Origin>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { active, level } = useMemo(() => navProps ?? { active: false, level: 0 }, [navProps]);
  const { open } = useAppLeftNav();

  return (
    <Tooltip
      title={open || level > 0 ? null : name ? t(name[0], name[1]) : primary}
      placement="right"
      arrow
      slotProps={{ popper: { disablePortal: false } }}
    >
      <ListItem disablePadding>
        <ListItemButton
          dense={level > 0}
          selected={active}
          sx={{ minHeight: undefined, paddingLeft: level === 0 ? undefined : theme.spacing(navOpen ? 4 : 2) }}
          {...(!nav ? null : { component: AppLink, nav, navDeps })}
        >
          {icon && <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>}
          <ListItemText primary={name ? t(name[0], name[1]) : primary} />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
}

export const LeftNavRoute = memo(WrappedLeftNavRoute) as <const Origin extends AppRoute['path']>(
  props: LeftNavLinkProps<Origin>
) => JSX.Element | null;

WrappedLeftNavRoute.displayName = 'WrappedLeftNavRoute';
(LeftNavRoute as unknown as { displayName: string }).displayName = 'LeftNavRoute';
