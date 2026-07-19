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
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import { useAppConfig } from 'core/config';
import type { AppLeftNavItem } from 'core/template';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';

export const useAppLeftNavMenu = () => {
  const { t } = useTranslation(['app']);

  const archiveEnabled = useAppConfig(s => s?.configuration?.datastore?.archive?.enabled || false);
  const c12nEnforce = useAppConfig(s => s?.c12nDef?.enforce || false);
  const isAdmin = useAppConfig(s => Boolean(s?.user?.is_admin));
  const retrohuntEnabled = useAppConfig(s => s?.configuration?.retrohunt?.enabled || false);
  const systemType = useAppConfig(s => s?.configuration?.system?.type);
  const userRoles = useAppConfig(s => s?.user?.roles || []);

  return useMemo<AppLeftNavItem[]>(
    (): AppLeftNavItem[] => [
      {
        id: 'submit',
        label: t('drawer.submit'),
        nav: nav => nav.to().create({ route: '/submit' }),
        icon: <PublishOutlinedIcon />
      },
      {
        id: 'submissions',
        label: t('drawer.submissions'),
        nav: nav => nav.to().create({ route: '/submissions' }),
        icon: <ViewCarouselOutlined />,
        preventRender: !userRoles.includes('submission_view')
      },
      {
        id: 'alerts',
        label: t('drawer.alerts'),
        nav: nav => nav.to().create({ route: '/alerts-redirect' }),
        icon: <NotificationImportantOutlinedIcon />,
        preventRender: !userRoles.includes('alert_view')
      },
      {
        id: 'archive',
        label: t('drawer.archive'),
        nav: nav => nav.to().create({ route: '/archive' }),
        icon: <ArchiveOutlinedIcon />,
        preventRender: !userRoles.includes('archive_view') || !archiveEnabled
      },
      {
        id: 'retrohunt',
        label: t('drawer.retrohunt'),
        nav: nav => nav.to().create({ route: '/retrohunt' }),
        icon: <DataObjectOutlinedIcon />,
        preventRender: !userRoles.includes('retrohunt_view') || !retrohuntEnabled
      },
      ...(userRoles.some(role => ['alert_view', 'signature_view', 'submission_view', 'retrohunt_view'].includes(role))
        ? [
            {
              id: 'search',
              label: t('drawer.search'),
              icon: <Search />,
              items: [
                {
                  id: 'search.all',
                  label: t('drawer.search.all'),
                  nav: nav => nav.to().create({ route: '/search' }),
                  icon: <Search />
                },
                {
                  id: 'search.alert',
                  label: t('drawer.search.alert'),
                  nav: nav => nav.to().create({ route: '/search/alert' }),
                  icon: <NotificationImportantOutlinedIcon />,
                  preventRender: !userRoles.includes('alert_view')
                },
                {
                  id: 'search.file',
                  label: t('drawer.search.file'),
                  nav: nav => nav.to().create({ route: '/search/file' }),
                  icon: <ViewCarouselOutlined />,
                  preventRender: !userRoles.includes('submission_view')
                },
                {
                  id: 'search.result',
                  label: t('drawer.search.result'),
                  nav: nav => nav.to().create({ route: '/search/result' }),
                  icon: <ViewCarouselOutlined />,
                  preventRender: !userRoles.includes('submission_view')
                },
                {
                  id: 'search.retrohunt',
                  label: t('drawer.search.retrohunt'),
                  nav: nav => nav.to().create({ route: '/search/retrohunt' }),
                  icon: <DataObjectOutlinedIcon />,
                  preventRender: !userRoles.includes('retrohunt_view') || !retrohuntEnabled
                },
                {
                  id: 'search.signature',
                  label: t('drawer.search.signature'),
                  nav: nav => nav.to().create({ route: '/search/signature' }),
                  icon: <FingerprintOutlined />,
                  preventRender: !userRoles.includes('signature_view')
                },
                {
                  id: 'search.submission',
                  label: t('drawer.search.submission'),
                  nav: nav => nav.to().create({ route: '/search/submission' }),
                  icon: <ViewCarouselOutlined />,
                  preventRender: !userRoles.includes('submission_view')
                }
              ]
            }
          ]
        : []),
      {
        id: 'divider.1',
        divider: true
      },
      {
        id: 'dashboard',
        label: t('drawer.dashboard'),
        nav: nav => nav.to().create({ route: '/dashboard' }),
        icon: <DashboardOutlined />
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
              label: t('drawer.manage'),
              icon: <BuildOutlined />,
              items: [
                {
                  id: 'manage.badlist',
                  label: t('drawer.manage.badlist'),
                  nav: nav => nav.to().create({ route: '/manage/badlist' }),
                  icon: <BugReportOutlined />,
                  preventRender: !userRoles.includes('badlist_view')
                },
                {
                  id: 'manage.heuristics',
                  label: t('drawer.manage.heuristics'),
                  nav: nav => nav.to().create({ route: '/manage/heuristics' }),
                  icon: <SimCardOutlined />,
                  preventRender: !userRoles.includes('heuristic_view')
                },
                {
                  id: 'manage.safelist',
                  label: t('drawer.manage.safelist'),
                  nav: nav => nav.to().create({ route: '/manage/safelist' }),
                  icon: <VerifiedUserOutlined />,
                  preventRender: !userRoles.includes('safelist_view')
                },
                {
                  id: 'manage.signatures',
                  label: t('drawer.manage.signatures'),
                  nav: nav => nav.to().create({ route: '/manage/signatures' }),
                  icon: <FingerprintOutlined />,
                  preventRender: !userRoles.includes('signature_view')
                },
                {
                  id: 'manage.source',
                  label: t('drawer.manage.source'),
                  nav: nav => nav.to().create({ route: '/manage/sources' }),
                  icon: <CodeOutlined />,
                  preventRender: !userRoles.includes('signature_manage')
                },
                {
                  id: 'manage.workflow',
                  label: t('drawer.manage.workflow'),
                  nav: nav => nav.to().create({ route: '/manage/workflows' }),
                  icon: <BiNetworkChart />,
                  preventRender: !userRoles.includes('workflow_view')
                }
              ]
            }
          ]
        : []),
      ...(isAdmin
        ? [
            {
              id: 'adminmenu',
              label: t('adminmenu'),
              icon: <BusinessOutlined />,
              items: [
                {
                  id: 'adminmenu.apikeys',
                  label: t('adminmenu.apikeys'),
                  nav: nav => nav.to().create({ route: '/admin/apikeys' }),
                  icon: <KeyOutlined />
                },
                {
                  id: 'adminmenu.errors',
                  label: t('adminmenu.errors'),
                  nav: nav => nav.to().create({ route: '/admin/errors' }),
                  icon: <ErrorOutlineOutlined />
                },
                {
                  id: 'adminmenu.identify',
                  label: t('adminmenu.identify'),
                  nav: nav => nav.to().create({ route: '/admin/identify' }),
                  icon: <FindInPageOutlined />
                },
                {
                  id: 'adminmenu.actions',
                  label: t('adminmenu.actions'),
                  nav: nav => nav.to().create({ route: '/admin/actions' }),
                  icon: <PlaylistPlayOutlined />
                },
                {
                  id: 'adminmenu.services',
                  label: t('adminmenu.services'),
                  nav: nav => nav.to().create({ route: '/admin/services' }),
                  icon: <AccountTreeOutlined />
                },
                {
                  id: 'adminmenu.service_review',
                  label: t('adminmenu.service_review'),
                  nav: nav => nav.to().create({ route: '/admin/service_review' }),
                  icon: <CompareArrowsOutlined />
                },
                {
                  id: 'adminmenu.sitemap',
                  label: t('adminmenu.sitemap'),
                  nav: nav => nav.to().create({ route: '/admin/sitemap' }),
                  icon: <MapOutlined />
                },
                {
                  id: 'adminmenu.tag_safelist',
                  label: t('adminmenu.tag_safelist'),
                  nav: nav => nav.to().create({ route: '/admin/tag_safelist' }),
                  icon: <VerifiedUserOutlined />
                },
                {
                  id: 'adminmenu.users',
                  label: t('adminmenu.users'),
                  nav: nav => nav.to().create({ route: '/admin/users' }),
                  icon: <SupervisorAccountOutlined />
                }
              ]
            }
          ]
        : []),
      {
        id: 'divider.2',
        divider: true
      },
      {
        id: 'help',
        label: t('drawer.help'),
        icon: <HelpOutlineOutlined />,
        items: [
          {
            id: 'help.api',
            label: t('drawer.help.api'),
            nav: nav => nav.to().create({ route: '/help/api' }),
            icon: <AssignmentOutlined />
          },
          {
            id: 'help.classification',
            label: t('drawer.help.classification'),
            nav: nav => nav.to().create({ route: '/help/classification' }),
            icon: <LabelOutlined />,
            preventRender: !c12nEnforce
          },
          {
            id: 'help.configuration',
            label: t('drawer.help.configuration'),
            nav: nav => nav.to().create({ route: '/help/configuration' }),
            icon: <SettingsApplicationsOutlined />
          },
          {
            id: 'help.search',
            label: t('drawer.help.search'),
            nav: nav => nav.to().create({ route: '/help/search' }),
            icon: <Search />
          },
          {
            id: 'help.services',
            label: t('drawer.help.services'),
            nav: nav => nav.to().create({ route: '/help/services' }),
            icon: <AccountTreeOutlined />
          }
        ]
      },
      ...(isAdmin && (systemType === 'development' || systemType === 'staging')
        ? [
            {
              id: 'development',
              label: t('drawer.development'),
              icon: <Code />,
              items: [
                {
                  id: 'development.api',
                  label: t('drawer.development.api'),
                  nav: nav => nav.to().create({ route: '/development/api' }),
                  icon: <Api />
                },
                {
                  id: 'development.customize',
                  label: t('drawer.development.customize'),
                  nav: nav => nav.to().create({ route: '/development/customize' }),
                  icon: <Palette />
                },
                {
                  id: 'development.library',
                  label: t('drawer.development.library'),
                  nav: nav => nav.to().create({ route: '/development/library' }),
                  icon: <LibraryBooks />
                },
                {
                  id: 'development.theme',
                  label: t('drawer.development.theme'),
                  nav: nav => nav.to().create({ route: '/development/theme' }),
                  icon: <Palette />
                }
              ]
            }
          ]
        : [])
    ],
    [t, archiveEnabled, c12nEnforce, isAdmin, retrohuntEnabled, systemType, userRoles]
  );
};
