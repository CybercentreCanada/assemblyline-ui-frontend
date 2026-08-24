import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { AppSwitcher } from '@tui/apps';
import type { AppPreferenceConfigs, AppRouterAdapter, AppUserService } from '@tui/core';
import { useAppConfigStore } from 'core/config';
import { AppBreadcrumbs } from 'layout/breadcrumbs';
import type { AppLeftNavItem } from 'layout/left-nav';
import { useParseTemplateLeftNavMenu } from 'layout/left-nav';
import { Notifications } from 'layout/notifications';
import { QuickSearch } from 'layout/quick-search';
import { UserProfile } from 'layout/user-menu';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { IconButton } from 'ui/buttons/IconButton';

//*****************************************************************************************
// Email Button
//*****************************************************************************************

export const EmailButton = memo(() => {
  const { t } = useTranslation();

  const email = useAppConfigStore(s => s?.configuration?.system?.support?.email);

  return !email ? null : (
    <IconButton color="inherit" size="large" tooltip={t('support.email')} onClick={() => window.open(email, '_blank')}>
      <MenuBookOutlinedIcon />
    </IconButton>
  );
});

EmailButton.displayName = 'EmailButton';

//*****************************************************************************************
// Documentation Button
//*****************************************************************************************

export const DocumentationButton = memo(() => {
  const { t } = useTranslation();

  const documentation = useAppConfigStore(s => s?.configuration?.system?.support?.documentation);

  return !documentation ? null : (
    <IconButton
      color="inherit"
      size="large"
      tooltip={t('support.documentation')}
      onClick={() => window.open(documentation, '_blank')}
    >
      <MenuBookOutlinedIcon />
    </IconButton>
  );
});

DocumentationButton.displayName = 'DocumentationButton';

//*****************************************************************************************
// App Template Router
//*****************************************************************************************

export const useAppTemplateRouter = () => {
  const navigate = useNavigate();

  return useMemo<AppRouterAdapter>(
    () => ({
      Link,
      navigate,
      location: { pathname: null, search: null, hash: null },
      matchPath: () => false,
      breadcrumbs: () => []
    }),
    [navigate]
  );
};

//*****************************************************************************************
// App Template User
//*****************************************************************************************

export const useAppTemplateUser = () => {
  return useMemo<AppUserService<{ id: string; name: string }>>(
    (): AppUserService<{ id: string; name: string }> => ({
      isReady: () => true,
      user: { id: 'test', name: 'test' },
      setUser: () => undefined,
      validateProps: () => true
    }),
    []
  );
};

//*****************************************************************************************
// App Template Left Nav
//*****************************************************************************************

export const useAppTemplateLeftNav = () =>
  useMemo<AppLeftNavItem[]>(
    () => [
      { link: { route: '/submit' } },
      { link: { route: '/submissions' } },
      { link: { route: '/alerts-redirect' } },
      { link: { route: '/archives' } },
      { link: { route: '/retrohunt' } },
      {
        link: { route: '/search/:index', path: { index: null } } as never,
        items: [
          { link: { route: '/search' } },
          { link: { route: '/search/:index', path: { index: 'alert' } } },
          { link: { route: '/search/:index', path: { index: 'file' } } },
          { link: { route: '/search/:index', path: { index: 'result' } } },
          { link: { route: '/search/:index', path: { index: 'retrohunt' } } },
          { link: { route: '/search/:index', path: { index: 'signature' } } },
          { link: { route: '/search/:index', path: { index: 'submission' } } }
        ] as const
      },
      { divider: true },
      { link: { route: '/dashboard' } },
      {
        link: { route: '/manage' },
        items: [
          { link: { route: '/manage/badlists' } },
          { link: { route: '/manage/heuristics' } },
          { link: { route: '/manage/safelists' } },
          { link: { route: '/manage/signatures' } },
          { link: { route: '/manage/sources' } },
          { link: { route: '/manage/workflows' } }
        ]
      },
      {
        link: { route: '/admin' },
        items: [
          { link: { route: '/admin/apikeys' } },
          { link: { route: '/admin/errors' } },
          { link: { route: '/admin/identify' } },
          { link: { route: '/admin/actions' } },
          { link: { route: '/admin/services' } },
          { link: { route: '/admin/service_review' } },
          { link: { route: '/admin/sitemap' } },
          { link: { route: '/admin/tag_safelist' } },
          { link: { route: '/admin/users' } }
        ]
      },
      { divider: true },
      {
        link: { route: '/help' },
        items: [
          { link: { route: '/help/api' } },
          { link: { route: '/help/classification' } },
          { link: { route: '/help/configuration' } },
          { link: { route: '/help/search' } },
          { link: { route: '/help/services' } }
        ]
      },
      {
        link: { route: '/development' },
        items: [
          { link: { route: '/development/api' } },
          { link: { route: '/development/customize' } },
          { link: { route: '/development/library' } },
          { link: { route: '/development/theme' } }
        ]
      }
    ],
    []
  );

//*****************************************************************************************
// App Template Preferences
//*****************************************************************************************
export const useAppTemplatePreferences = () => {
  const leftNav = useAppTemplateLeftNav();
  const menu = useParseTemplateLeftNavMenu(leftNav);

  return useMemo<AppPreferenceConfigs>(
    () => ({
      brand: {
        application: 'Assemblyline',
        appName: 'Assemblyline',
        logo: {
          dark: '/images/noswoop_dark.svg',
          light: '/images/noswoop.svg'
        }
      },
      appLink: '/v1#/',
      allowBreadcrumbs: false,
      allowQuickSearch: false,
      allowAutoHideTopbar: true,
      allowLayoutSelection: true,
      allowPersonalization: true,
      allowReset: false,
      // allowThemeSelection: true,
      // allowFocusMode: false,
      // allowDensitySelection: false,
      topnav: {
        hideUserAvatar: true,
        slots: {
          breadcrumbs: {
            left: [<AppBreadcrumbs key="breadcrumbs" />]
          },
          search: {
            right: [
              <QuickSearch key="quick-search" />,
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
        menus: menu,
        // TODO: maybe revert to 240 if the icons are removed
        width: 260
      }
    }),
    [menu]
  );
};
