import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import type { AppPreferenceConfigs } from '@tui/core';
import { useMemo } from 'react';

export const useAppTemplatePreferences = () =>
  useMemo<AppPreferenceConfigs>(
    () => ({
      brand: {
        application: 'Assemblyline',
        appName: 'Assemblyline',
        logo: {
          dark: '/images/noswoop_dark.svg',
          light: '/images/noswoop.svg'
        }
      },
      appLink: '/',
      allowBreadcrumbs: false,
      allowQuickSearch: false,
      allowReset: false,
      allowThemeSelection: false,
      allowFocusMode: false,
      allowDensitySelection: false,
      topnav: {
        hideUserAvatar: true,
        slots: {
          breadcrumbs: {
            left: null
          },
          search: {
            right: null
          }
        },
        profile: {
          menus: {
            user: {
              slot: [
                {
                  i18nKey: 'usermenu.logout',
                  route: '/logout',
                  icon: <ExitToAppIcon />
                },
                {
                  // i18nKey: 'usermenu',
                  // title: 'usermenu',
                  // route: 'usermenu',
                  // icon: null,
                  element: <>{'test'}</>
                },
                {
                  i18nKey: 'usermenu',
                  title: 'usermenu',
                  route: 'usermenu',
                  icon: null,
                  element: null
                }
              ]
            },
            admin: {
              slot: [
                {
                  i18nKey: 'usermenu',
                  title: 'usermenu',
                  route: 'usermenu',
                  icon: null,
                  element: null
                }
              ]
            }
          }
        }
      },
      leftnav: {
        menus: [],
        width: 240
      }
    }),
    []
  );
