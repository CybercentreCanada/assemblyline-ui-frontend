import { AccountTreeOutlined, Language, Palette, ViewQuilt } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import type { LeftNavMenuProps } from '@tui/core';
import { useMemo } from 'react';

export const useMyLeftNav = (): LeftNavMenuProps[] => {
  // Example routes are intentionally grouped.
  // Feel free to remove this section entirely once onboarding is complete.
  const mainMenu: LeftNavMenuProps = useMemo(
    () => ({
      id: 'menu2',
      type: 'menu',
      items: [
        {
          id: 'examples.overview',
          type: 'route',
          label: 'Overview',
          icon: <Language />,
          route: '/examples'
        },
        {
          id: 'examples.layout',
          type: 'route',
          label: 'Layout',
          icon: <ViewQuilt />,
          route: '/examples/layout'
        },
        {
          id: 'examples.routing',
          type: 'menu',
          label: 'Routing',
          icon: <AccountTreeOutlined />,
          route: '/examples/routing',
          items: [
            {
              id: 'examples.routing.overview',
              type: 'route',
              label: 'Overview',
              route: '/examples/routing'
            },
            {
              id: 'examples.routing.basic',
              type: 'route',
              label: 'Basic',
              route: '/examples/routing/basic'
            },
            {
              id: 'examples.routing.nested',
              type: 'route',
              label: 'Nested',
              route: '/examples/routing/nested'
            },
            {
              id: 'examples.routing.dynamic',
              type: 'route',
              label: 'Dynamic',
              route: '/examples/routing/dynamic'
            },
            {
              id: 'examples.routing.error',
              type: 'route',
              label: 'Error Boundary',
              route: '/examples/routing/error'
            }
          ]
        },
        {
          id: 'examples.themes',
          type: 'route',
          label: 'Themes',
          icon: <Palette />,
          route: '/examples/themes'
        },
        { id: 'drawer.divider.2', type: 'slot', component: Divider }
      ]
    }),
    []
  );

  // Main routes are intentionally grouped.
  // Feel free to remove this section entirely once onboarding is complete.
  // const stubMenu: LeftNavMenuProps = useMemo(
  //   () => ({
  //     id: 'menu1',
  //     type: 'menu',
  //     items: [
  //       {
  //         id: 'drawer.dashboard',
  //         type: 'route',
  //         i18nKey: 'drawer.dashboard',
  //         tooltipI18nKey: 'drawer.dashboard.tooltip',
  //         icon: <DashboardOutlined />,
  //         route: '/dashboard'
  //       },
  //       {
  //         id: 'drawer.settiongs',
  //         type: 'route',
  //         i18nKey: 'drawer.settings',
  //         tooltipI18nKey: 'drawer.settings.tooltip',
  //         icon: <Tune />,
  //         route: '/settings'
  //       },
  //       {
  //         id: 'drawer.reports',
  //         type: 'route',
  //         i18nKey: 'drawer.reports',
  //         tooltipI18nKey: 'drawer.reports.tooltip',
  //         icon: <AssessmentOutlined />,
  //         route: '/reports'
  //       },
  //       {
  //         id: 'drawer.divider.1',
  //         type: 'slot',
  //         component: Divider
  //       }
  //     ]
  //   }),
  //   []
  // );

  return useMemo(() => [mainMenu], [mainMenu]);
};
