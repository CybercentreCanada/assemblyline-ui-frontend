import { InfoOutline, Settings, SupervisorAccount } from '@mui/icons-material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { AppDrawerAccessibilityIconButton } from '@tui/a11y';
import { AppSwitcher } from '@tui/apps';
import { AppClassification, AppTLP } from '@tui/classi';
import { OverlayShadow, type AppBarUserMenuElement, type AppPreferenceConfigs } from '@tui/core';
import { AppDrawerContainer } from '@tui/drawer';
import { AppNotifications } from '@tui/notis';
import { useMemo } from 'react';
import { AppBrand } from '~/branding/AppBrand';
import { AppAbout } from '~/components/AppAbout';
import { useMyLeftNav } from '~/hooks/useMyLeftNav';

const useMyPreferences = (): AppPreferenceConfigs => {
  //
  const menus = useMyLeftNav();

  // This is the basic user menu, it is a menu that shows up in account avatar popover.
  const USER_MENU_ITEMS: AppBarUserMenuElement[] = useMemo(
    () => [
      {
        i18nKey: 'usermenu.logout',
        route: '/logout',
        icon: <ExitToAppIcon />
      }
    ],
    []
  );

  // This is the basic administrator menu, it is a menu that shows up under the user menu in the account avatar popover.
  const ADMIN_MENU_ITEMS = useMemo(
    () => [
      {
        i18nKey: 'adminmenu.users',
        route: '/admin/users',
        icon: <SupervisorAccount />
      },
      {
        i18nKey: 'adminmenu.config',
        route: '/admin/configuration',
        icon: <Settings />
      }
    ],
    []
  );

  // Return memoized config to prevent unnecessary re-renders.
  return useMemo<AppPreferenceConfigs>(
    (): AppPreferenceConfigs => ({
      appName: 'TemplateUI',
      // OPTION: 1 Either provide icons img links directly
      // ---  appIconDark: <img alt="app logo" src="/branding/templateui/noswoosh-dark.svg" height={40} width={40} />,
      // ---- appIconLight: <img alt="app logo" src="/branding/templateui/noswoosh-light.svg" height={40} width={40} />,
      // OPTION: 2 Use the AppBrand component and adjust for your app.
      appBrand: {
        application: 'templateui',
        component: AppBrand
      },
      allowThemeSelection: true,
      allowFocusMode: true,
      topnav: {
        quickSearchIconOnly: true,
        slots: {
          search: {
            left: [
              <AppClassification key="classification" variant="text" />,
              <AppTLP key="classification.tlp" value="green" mx={{ mr: 1 }} />
            ],
            right: [
              <AppAbout key="tui.app.about" />,
              <OverlayShadow key="tui.a11y" region="@tui" id="@tui/a11y">
                <AppDrawerAccessibilityIconButton key="tui.a11y" />
              </OverlayShadow>,
              <OverlayShadow key="tui.notis" region="@tui" id="@tui/notis">
                <AppNotifications key="tui.notis" />
              </OverlayShadow>,
              <OverlayShadow key="tui.apps" region="@tui" id="@tui/apps">
                <AppSwitcher />
              </OverlayShadow>
            ]
          }
        },
        profile: {
          menus: {
            user: {
              i18nKey: 'usermenu',
              slot: USER_MENU_ITEMS
            },
            admin: {
              i18nKey: 'adminmenu',
              slot: ADMIN_MENU_ITEMS
            }
          }
        }
      },
      leftnav: {
        menus,
        width: 320
      },
      commands: [
        {
          id: 'custom.cmd.1',
          type: 'action',
          icon: <InfoOutline />,
          primary: 'Potatoe',
          secondary: 'RJs Favourite',
          description: 'Do not beware, this is not an alert',
          onClick: () => alert('hello mundo!')
        }
      ],
      slots: {
        layout: AppDrawerContainer
      }
    }),
    [USER_MENU_ITEMS, ADMIN_MENU_ITEMS, menus]
  );
};

export default useMyPreferences;
