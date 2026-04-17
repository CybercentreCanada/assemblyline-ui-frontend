import {
  AccountTreeOutlined,
  Api,
  AssignmentOutlined,
  BugReportOutlined,
  BuildOutlined,
  BusinessOutlined,
  Code,
  CodeOutlined,
  CompareArrowsOutlined,
  DashboardOutlined,
  ErrorOutlineOutlined,
  FindInPageOutlined,
  FingerprintOutlined,
  HelpOutlineOutlined,
  KeyOutlined,
  LabelOutlined,
  LibraryBooks,
  MapOutlined,
  Palette,
  PlaylistPlayOutlined,
  Search,
  SettingsApplicationsOutlined,
  SimCardOutlined,
  SupervisorAccountOutlined,
  VerifiedUserOutlined,
  ViewCarouselOutlined
} from '@mui/icons-material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import { AppSwitcher } from '@tui/apps';
import { AppPreferenceConfigs, LeftNavMenuProps } from '@tui/core';
import { useAppConfig } from 'core/config';
import { DocumentationIconButton } from 'core/layout/components/DocumentationIconButton';
import { EmailIconButton } from 'core/layout/components/EmailIconButton';
import { LeftNavRoute } from 'core/layout/components/LeftNavItem';
import { UserProfile } from 'core/layout/components/UserProfile';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';

export const useAppLeftNavMenu = (): LeftNavMenuProps[] => {
  const { t } = useTranslation(['app']);

  const userRoles = useAppConfig(s => s?.user?.roles || []);
  const isAdmin = useAppConfig(s => Boolean((s?.user as any)?.is_admin));
  const archiveEnabled = useAppConfig(s => s?.configuration?.datastore?.archive?.enabled || false);
  const retrohuntEnabled = useAppConfig(s => s?.configuration?.retrohunt?.enabled || false);
  const systemType = useAppConfig(s => s?.configuration?.system?.type);
  const c12nEnforce = useAppConfig(s => s?.c12nDef?.enforce || false);

  return useMemo<LeftNavMenuProps[]>(
    () => [
      {
        id: 'menu',
        type: 'menu',
        items: [
          {
            id: 'submit',
            type: 'slot',
            withProps: true,
            render: (navOpen, navProps) => (
              <LeftNavRoute
                primary={t('drawer.submit')}
                route="/submit"
                icon={<PublishOutlinedIcon />}
                navOpen={navOpen}
                navProps={navProps}
              />
            )
          },
          {
            id: 'submissions',
            type: 'slot',
            withProps: true,
            render: (navOpen, navProps) => (
              <LeftNavRoute
                primary={t('drawer.submissions')}
                route="/submissions"
                icon={<ViewCarouselOutlined />}
                preventRender={!userRoles.includes('submission_view')}
                navOpen={navOpen}
                navProps={navProps}
              />
            )
          },
          {
            id: 'alerts',
            type: 'slot',
            withProps: true,
            render: (navOpen, navProps) => (
              <LeftNavRoute
                primary={t('drawer.alerts')}
                route="/alerts_redirect"
                icon={<NotificationImportantOutlinedIcon />}
                preventRender={!userRoles.includes('alert_view')}
                navOpen={navOpen}
                navProps={navProps}
              />
            )
          },
          {
            id: 'archive',
            type: 'slot',
            withProps: true,
            render: (navOpen, navProps) => (
              <LeftNavRoute
                primary={t('drawer.archive')}
                route="/archive"
                icon={<ArchiveOutlinedIcon />}
                preventRender={!userRoles.includes('archive_view') || !archiveEnabled}
                navOpen={navOpen}
                navProps={navProps}
              />
            )
          },
          {
            id: 'retrohunt',
            type: 'slot',
            withProps: true,
            render: (navOpen, navProps) => (
              <LeftNavRoute
                primary={t('drawer.retrohunt')}
                route="/retrohunt"
                icon={<DataObjectOutlinedIcon />}
                preventRender={!userRoles.includes('retrohunt_view') || !retrohuntEnabled}
                navOpen={navOpen}
                navProps={navProps}
              />
            )
          },

          ...(userRoles.some(role =>
            ['alert_view', 'signature_view', 'submission_view', 'retrohunt_view'].includes(role)
          )
            ? [
                {
                  id: 'search',
                  type: 'menu' as 'menu',
                  label: t('drawer.search'),
                  icon: <SearchIcon />,
                  items: [
                    {
                      id: 'search.all',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.all')}
                          route="/search"
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'search.alert',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.alert')}
                          route="/search/alert"
                          preventRender={!userRoles.includes('alert_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'search.file',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.file')}
                          route="/search/file"
                          preventRender={!userRoles.includes('submission_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'search.result',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.result')}
                          route="/search/result"
                          preventRender={!userRoles.includes('submission_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'search.retrohunt',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.retrohunt')}
                          route="/search/retrohunt"
                          preventRender={!userRoles.includes('retrohunt_view') || !retrohuntEnabled}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'search.signature',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.signature')}
                          route="/search/signature"
                          preventRender={!userRoles.includes('signature_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'search.submission',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.search.submission')}
                          route="/search/submission"
                          preventRender={!userRoles.includes('submission_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    }
                  ]
                }
              ]
            : []),

          {
            id: 'drawer.divider.1',
            type: 'slot',
            render: () => <Divider />
          },

          {
            id: 'dashboard',
            type: 'slot',
            withProps: true,
            render: (navOpen, navProps) => (
              <LeftNavRoute
                primary={t('drawer.dashboard')}
                route="/dashboard"
                icon={<DashboardOutlined />}
                navOpen={navOpen}
                navProps={navProps}
              />
            )
          },

          ...(userRoles.some(role =>
            [
              'badlist_view',
              'heuristic_view',
              'safelist_view',
              'signature_view',
              'signature_manage',
              'workflow_view'
            ].includes(role)
          )
            ? [
                {
                  id: 'manage',
                  type: 'menu' as 'menu',
                  label: t('drawer.manage'),
                  icon: <BuildOutlined />,
                  items: [
                    {
                      id: 'manage.badlist',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.manage.badlist')}
                          route="/manage/badlist"
                          icon={<BugReportOutlined />}
                          preventRender={!userRoles.includes('badlist_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'manage.heuristics',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.manage.heuristics')}
                          route="/manage/heuristics"
                          icon={<SimCardOutlined />}
                          preventRender={!userRoles.includes('heuristic_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'manage.safelist',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.manage.safelist')}
                          route="/manage/safelist"
                          icon={<VerifiedUserOutlined />}
                          preventRender={!userRoles.includes('safelist_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'manage.signatures',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.manage.signatures')}
                          route="/manage/signatures"
                          icon={<FingerprintOutlined />}
                          preventRender={!userRoles.includes('signature_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'manage.source',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.manage.source')}
                          route="/manage/sources"
                          icon={<CodeOutlined />}
                          preventRender={!userRoles.includes('signature_manage')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'manage.workflow',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.manage.workflow')}
                          route="/manage/workflows"
                          icon={<BiNetworkChart />}
                          preventRender={!userRoles.includes('workflow_view')}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    }
                  ]
                }
              ]
            : []),

          ...(isAdmin
            ? [
                {
                  id: 'adminmenu',
                  type: 'menu' as 'menu',
                  label: t('adminmenu'),
                  icon: <BusinessOutlined />,
                  items: [
                    {
                      id: 'adminmenu.apikeys',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.apikeys')}
                          route="/admin/apikeys"
                          icon={<KeyOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.errors',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.errors')}
                          route="/admin/errors"
                          icon={<ErrorOutlineOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.identify',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.identify')}
                          route="/admin/identify"
                          icon={<FindInPageOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.actions',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.actions')}
                          route="/admin/actions"
                          icon={<PlaylistPlayOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.services',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.services')}
                          route="/admin/services"
                          icon={<AccountTreeOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.service_review',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.service_review')}
                          route="/admin/service_review"
                          icon={<CompareArrowsOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.sitemap',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.sitemap')}
                          route="/admin/sitemap"
                          icon={<MapOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.tag_safelist',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.tag_safelist')}
                          route="/admin/tag_safelist"
                          icon={<VerifiedUserOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'adminmenu.users',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('adminmenu.users')}
                          route="/admin/users"
                          icon={<SupervisorAccountOutlined />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    }
                  ]
                }
              ]
            : []),

          {
            id: 'drawer.divider.2',
            type: 'slot',
            render: () => <Divider />
          },

          {
            id: 'help',
            type: 'menu' as 'menu',
            label: t('drawer.help'),
            icon: <HelpOutlineOutlined />,
            items: [
              {
                id: 'help.api',
                type: 'slot' as 'slot',
                withProps: true,
                render: (navOpen, navProps) => (
                  <LeftNavRoute
                    primary={t('drawer.help.api')}
                    route="/help/api"
                    icon={<AssignmentOutlined />}
                    navOpen={navOpen}
                    navProps={navProps}
                  />
                )
              },
              {
                id: 'help.classification',
                type: 'slot' as 'slot',
                withProps: true,
                render: (navOpen, navProps) => (
                  <LeftNavRoute
                    primary={t('drawer.help.classification')}
                    route="/help/classification"
                    icon={<LabelOutlined />}
                    preventRender={!c12nEnforce}
                    navOpen={navOpen}
                    navProps={navProps}
                  />
                )
              },
              {
                id: 'help.configuration',
                type: 'slot' as 'slot',
                withProps: true,
                render: (navOpen, navProps) => (
                  <LeftNavRoute
                    primary={t('drawer.help.configuration')}
                    route="/help/configuration"
                    icon={<SettingsApplicationsOutlined />}
                    navOpen={navOpen}
                    navProps={navProps}
                  />
                )
              },
              {
                id: 'help.search',
                type: 'slot' as 'slot',
                withProps: true,
                render: (navOpen, navProps) => (
                  <LeftNavRoute
                    primary={t('drawer.help.search')}
                    route="/help/search"
                    icon={<Search />}
                    navOpen={navOpen}
                    navProps={navProps}
                  />
                )
              },
              {
                id: 'help.services',
                type: 'slot' as 'slot',
                withProps: true,
                render: (navOpen, navProps) => (
                  <LeftNavRoute
                    primary={t('drawer.help.services')}
                    route="/help/services"
                    icon={<AccountTreeOutlined />}
                    navOpen={navOpen}
                    navProps={navProps}
                  />
                )
              }
            ]
          },

          ...(isAdmin && (systemType === 'development' || systemType === 'staging')
            ? [
                {
                  id: 'development',
                  type: 'menu' as 'menu',
                  label: t('drawer.development'),
                  icon: <Code />,
                  items: [
                    {
                      id: 'development.api',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.development.api')}
                          route="/development/api"
                          icon={<Api />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'development.customize',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.development.customize')}
                          route="/development/customize"
                          icon={<Palette />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'development.library',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.development.library')}
                          route="/development/library"
                          icon={<LibraryBooks />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    },
                    {
                      id: 'development.theme',
                      type: 'slot' as 'slot',
                      withProps: true,
                      render: (navOpen, navProps) => (
                        <LeftNavRoute
                          primary={t('drawer.development.theme')}
                          route="/development/theme"
                          icon={<Palette />}
                          navOpen={navOpen}
                          navProps={navProps}
                        />
                      )
                    }
                  ]
                }
              ]
            : [])
        ]
      }
    ],
    [t, userRoles, isAdmin, archiveEnabled, retrohuntEnabled, systemType, c12nEnforce]
  );
};

export const useMyPreferences = (): AppPreferenceConfigs => {
  const leftnavMenu = useAppLeftNavMenu();

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
              <DocumentationIconButton key="documentation" />,
              <EmailIconButton key="email" />,
              <AppSwitcher key="tui.apps" />,
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
    [leftnavMenu]
  );
};
