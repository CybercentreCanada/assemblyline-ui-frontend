import { Divider } from '@mui/material';
import { LeftNavMenuProps } from '@tui/core';
import { useAppLeftNavMenu } from 'app/layout.left-nav';
import { CreatedAppRouteParamsMap, createAppRoute } from 'core/routes';
import { useCallback, useMemo } from 'react';
import { LeftNavRoute } from '../components/LeftNavRoute';

type AppTemplateLeftNavMenuItem = LeftNavMenuProps['items'][number];

export type AppLeftNavItem = {
  divider?: boolean;
  icon?: LeftNavMenuProps['icon'];
  id: AppTemplateLeftNavMenuItem['id'];
  items?: AppLeftNavItem[] | null;
  label?: LeftNavMenuProps['label'];
  preventRender?: boolean;
  routes?: readonly ReturnType<typeof createAppRoute>[];
  to?: CreatedAppRouteParamsMap;
};

export const useAppTemplateLeftNavMenu = () => {
  const leftNav = useAppLeftNavMenu();

  const mapItem = useCallback((item: AppLeftNavItem): AppTemplateLeftNavMenuItem => {
    const { divider = false, id, label, icon, to, routes, preventRender = false, items = null } = item;

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
        <LeftNavRoute
          primary={label}
          to={to}
          routes={routes}
          preventRender={preventRender}
          icon={icon}
          navOpen={navOpen}
          navProps={navProps}
        />
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
