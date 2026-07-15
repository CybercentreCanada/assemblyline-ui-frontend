import { Divider } from '@mui/material';
import type { LeftNavMenuProps } from '@tui/core';
import { useAppLeftNavMenu } from 'app/layout.left-nav';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { LeftNavRoute } from 'layout/top-nav/LeftNavRoute';
import { useCallback, useMemo } from 'react';

type AppTemplateLeftNavMenuItem = LeftNavMenuProps['items'][number];

export type AppLeftNavItem<Path extends AppRoute['route'] = AppRoute['route']> =
  InferAppNavigationPropsFromPath<Path> & {
    divider?: boolean;
    icon?: LeftNavMenuProps['icon'];
    id: AppTemplateLeftNavMenuItem['id'];
    items?: AppLeftNavItem[] | null;
    label?: LeftNavMenuProps['label'];
    preventRender?: boolean;
  };

export const useAppTemplateLeftNavMenu = () => {
  const leftNav = useAppLeftNavMenu();

  const mapItem = useCallback((item: AppLeftNavItem): AppTemplateLeftNavMenuItem => {
    const { divider = false, id, label, icon, nav, navDeps, preventRender = false, items = null } = item;

    if (divider) {
      return {
        id,
        type: 'slot',
        render: () => <Divider />
      };
    }

    if (items && items.length > 0) {
      return {
        id,
        type: 'menu',
        label,
        icon,
        items: items.map(mapItem)
      };
    }

    return {
      id,
      type: 'slot',
      withProps: true,
      render: (navOpen, navProps) => (
        <LeftNavRoute primary={label} nav={nav} navDeps={navDeps} icon={icon} navOpen={navOpen} navProps={navProps} />
      )
    };
  }, []);

  return useMemo<LeftNavMenuProps[]>(
    (): LeftNavMenuProps[] => [
      {
        id: 'menu',
        type: 'menu',
        items: leftNav.map(mapItem)
      }
    ],
    [leftNav]
  );
};
