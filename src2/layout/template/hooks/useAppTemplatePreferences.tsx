import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { AppSwitcher } from '@tui/apps';
import { AppPreferenceConfigs } from '@tui/core';
import { useAppPreferences } from 'app/layout.preferences';
import { Notifications } from 'layout/notifications';
import { useMemo } from 'react';
import { DocumentationButton } from '../components/DocumentationButton';
import { EmailButton } from '../components/EmailButton';
import { UserProfile } from '../components/UserProfile';
import { useAppTemplateLeftNavMenu } from './useAppTemplateLeftNavMenu';

export const useAppTemplatePreferences = () => {
  const appPreferences = useAppPreferences();
  const leftnavMenu = useAppTemplateLeftNavMenu();

  return useMemo<AppPreferenceConfigs>(
    (): AppPreferenceConfigs => ({
      brand: {
        application: 'Assemblyline',
        appName: 'Assemblyline',
        logo: {
          dark: '/images/noswoop_dark.svg',
          light: '/images/noswoop.svg'
        }
      },
      appLink: '/',
      allowBreadcrumbs: true,
      topnav: {
        hideUserAvatar: true,
        slots: {
          search: {
            right: [
              <DocumentationButton key="documentation" />,
              <EmailButton key="email" />,
              <Notifications key="notifications" />,
              <AppSwitcher key="app-switcher" />,
              <UserProfile key="user-profile" />
            ]
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
      leftnav: { menus: leftnavMenu, width: 240 }

      // slots: { layout: AppDrawerContainer }
    }),
    []
  );
};
