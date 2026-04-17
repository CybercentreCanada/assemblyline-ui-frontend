import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ApiIcon from '@mui/icons-material/Api';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CodeIcon from '@mui/icons-material/Code';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import PaletteIcon from '@mui/icons-material/Palette';
import PlaylistPlayOutlinedIcon from '@mui/icons-material/PlaylistPlayOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsApplicationsOutlinedIcon from '@mui/icons-material/SettingsApplicationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SimCardOutlinedIcon from '@mui/icons-material/SimCardOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { useTheme } from '@mui/material';
import { useAppConfig } from 'core/config';
import { AppLayoutLeftNavItem } from 'core/layout/layout.models';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';

export const AppLogo = React.memo(() => {
  const { t } = useTranslation('layout');
  const theme = useTheme();

  switch (theme.palette.mode) {
    case 'dark':
      return (
        <img alt={t('logo.alt')} src="/images/noswoop_dark.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
      );
    case 'light':
      return (
        <img alt={t('logo.alt')} src="/images/noswoop.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
      );
    default:
      return null;
  }
});

export const AppBanner = React.memo(() => {
  const { t } = useTranslation('layout');
  const theme = useTheme();

  switch (theme.palette.mode) {
    case 'dark':
      return (
        <img alt={t('banner.alt')} src="/images/banner_dark.svg" style={{ display: 'inline-block', width: '100%' }} />
      );
    case 'light':
      return <img alt={t('banner.alt')} src="/images/banner.svg" style={{ display: 'inline-block', width: '100%' }} />;
    default:
      return null;
  }
});

export const AppVerticalBanner = React.memo(() => {
  const { t } = useTranslation('layout');
  const theme = useTheme();

  switch (theme.palette.mode) {
    case 'dark':
      return (
        <img
          alt={t('banner.alt')}
          src="/images/vertical_banner_dark.svg"
          style={{ display: 'inline-block', width: '100%' }}
        />
      );
    case 'light':
      return (
        <img
          alt={t('banner.alt')}
          src="/images/vertical_banner.svg"
          style={{ display: 'inline-block', width: '100%' }}
        />
      );
    default:
      return null;
  }
});

export const APP_USER_MENU_ITEMS = [
  {
    i18nKey: 'usermenu.account',
    route: '/account',
    icon: <AccountCircleOutlinedIcon />
  },
  {
    i18nKey: 'usermenu.settings',
    route: '/settings',
    icon: <SettingsOutlinedIcon />
  },
  {
    i18nKey: 'usermenu.logout',
    route: '/logout',
    icon: <ExitToAppIcon />
  }
];

export const useAppLeftMenuItems = () => {
  const { t } = useTranslation();

  const userRoles = useAppConfig(s => s?.user?.roles || []);
  const isAdmin = useAppConfig(s => Boolean(s?.user?.is_admin));
  const archiveEnabled = useAppConfig(s => Boolean(s?.configuration?.datastore?.archive?.enabled));
  const retrohuntEnabled = useAppConfig(s => Boolean(s?.configuration?.retrohunt?.enabled));
  const c12nEnforced = useAppConfig(s => Boolean((s as any)?.c12nDef?.enforce));
  const systemType = useAppConfig(s => s?.configuration?.system?.type);

  const canDevelopment = useMemo(
    () => isAdmin && (systemType === 'development' || systemType === 'staging'),
    [isAdmin, systemType]
  );

  return useMemo<AppLayoutLeftNavItem[]>(
    () => [
      {
        primary: t('drawer.submit'),
        icon: <PublishOutlinedIcon />,
        route: '/submit'
      },
      {
        primary: t('drawer.submissions'),
        disabled: !userRoles.includes('submission_view'),
        icon: <ViewCarouselOutlinedIcon />,
        route: '/submissions'
      },
      {
        primary: t('drawer.alerts'),
        disabled: !userRoles.includes('alert_view'),
        icon: <NotificationImportantOutlinedIcon />,
        route: '/alerts_redirect'
      },
      {
        primary: t('drawer.archive'),
        disabled: !userRoles.includes('archive_view') || !archiveEnabled,
        icon: <ArchiveOutlinedIcon />,
        route: '/archive'
      },
      {
        primary: t('drawer.retrohunt'),
        disabled: !userRoles.includes('retrohunt_view') || !retrohuntEnabled,
        icon: <DataObjectOutlinedIcon />,
        route: '/retrohunt'
      },
      {
        primary: t('drawer.search'),
        icon: <SearchIcon />,
        route: '/search',
        items: [
          { primary: t('drawer.search.all'), route: '/search' },
          {
            primary: t('drawer.search.alert'),
            disabled: !userRoles.includes('alert_view'),
            route: '/search/alert'
          },
          {
            primary: t('drawer.search.file'),
            disabled: !userRoles.includes('submission_view'),
            route: '/search/file'
          },
          {
            primary: t('drawer.search.result'),
            disabled: !userRoles.includes('submission_view'),
            route: '/search/result'
          },
          {
            primary: t('drawer.search.retrohunt'),
            disabled: !userRoles.includes('retrohunt_view') || !retrohuntEnabled,
            route: '/search/retrohunt'
          },
          {
            primary: t('drawer.search.signature'),
            disabled: !userRoles.includes('signature_view'),
            route: '/search/signature'
          },
          {
            primary: t('drawer.search.submission'),
            disabled: !userRoles.includes('submission_view'),
            route: '/search/submission'
          }
        ]
      },
      {
        primary: t('drawer.dashboard'),
        divider: true,
        icon: <DashboardOutlinedIcon />,
        route: '/dashboard'
      },
      {
        primary: t('drawer.manage'),
        icon: <BuildOutlinedIcon />,
        route: '/manage/badlist',
        items: [
          {
            primary: t('drawer.manage.badlist'),
            disabled: !userRoles.includes('badlist_view'),
            icon: <BugReportOutlinedIcon />,
            route: '/manage/badlist'
          },
          {
            primary: t('drawer.manage.heuristics'),
            disabled: !userRoles.includes('heuristic_view'),
            icon: <SimCardOutlinedIcon />,
            route: '/manage/heuristics'
          },
          {
            primary: t('drawer.manage.safelist'),
            disabled: !userRoles.includes('safelist_view'),
            icon: <VerifiedUserOutlinedIcon />,
            route: '/manage/safelist'
          },
          {
            primary: t('drawer.manage.signatures'),
            disabled: !userRoles.includes('signature_view'),
            icon: <FingerprintOutlinedIcon />,
            route: '/manage/signatures'
          },
          {
            primary: t('drawer.manage.source'),
            disabled: !userRoles.includes('signature_manage'),
            icon: <CodeOutlinedIcon />,
            route: '/manage/sources'
          },
          {
            primary: t('drawer.manage.workflow'),
            disabled: !userRoles.includes('workflow_view'),
            icon: <BiNetworkChart />,
            route: '/manage/workflows'
          }
        ]
      },
      {
        primary: t('adminmenu'),
        disabled: !isAdmin,
        icon: <BusinessOutlinedIcon />,
        route: '/admin/apikeys',
        items: [
          { primary: t('adminmenu.apikeys'), icon: <KeyOutlinedIcon />, route: '/admin/apikeys' },
          { primary: t('adminmenu.errors'), icon: <ErrorOutlineOutlinedIcon />, route: '/admin/errors' },
          { primary: t('adminmenu.identify'), icon: <FindInPageOutlinedIcon />, route: '/admin/identify' },
          { primary: t('adminmenu.actions'), icon: <PlaylistPlayOutlinedIcon />, route: '/admin/actions' },
          { primary: t('adminmenu.services'), icon: <AccountTreeOutlinedIcon />, route: '/admin/services' },
          {
            primary: t('adminmenu.service_review'),
            icon: <CompareArrowsOutlinedIcon />,
            route: '/admin/service_review'
          },
          { primary: t('adminmenu.sitemap'), icon: <MapOutlinedIcon />, route: '/admin/sitemap' },
          { primary: t('adminmenu.tag_safelist'), icon: <VerifiedUserOutlinedIcon />, route: '/admin/tag_safelist' },
          { primary: t('adminmenu.users'), icon: <SupervisorAccountOutlinedIcon />, route: '/admin/users' }
        ]
      },
      {
        primary: t('drawer.help'),
        divider: true,
        icon: <HelpOutlineOutlinedIcon />,
        route: '/help/api',
        items: [
          { primary: t('drawer.help.api'), icon: <AssignmentOutlinedIcon />, route: '/help/api' },
          {
            primary: t('drawer.help.classification'),
            disabled: !c12nEnforced,
            icon: <LabelOutlinedIcon />,
            route: '/help/classification'
          },
          {
            primary: t('drawer.help.configuration'),
            icon: <SettingsApplicationsOutlinedIcon />,
            route: '/help/configuration'
          },
          { primary: t('drawer.help.search'), icon: <SearchIcon />, route: '/help/search' },
          { primary: t('drawer.help.services'), icon: <AccountTreeOutlinedIcon />, route: '/help/services' }
        ]
      },
      {
        primary: t('drawer.development'),
        disabled: !canDevelopment,
        icon: <CodeIcon />,
        route: '/development/api',
        items: [
          { primary: t('drawer.development.api'), icon: <ApiIcon />, route: '/development/api' },
          { primary: t('drawer.development.customize'), icon: <PaletteIcon />, route: '/development/customize' },
          { primary: t('drawer.development.library'), icon: <LibraryBooksIcon />, route: '/development/library' },
          { primary: t('drawer.development.theme'), icon: <PaletteIcon />, route: '/development/theme' }
        ]
      }
    ],
    [t, userRoles, isAdmin, archiveEnabled, retrohuntEnabled, c12nEnforced, canDevelopment]
  );
};

// OLD

// export const APP_LIGHT_LOGO = React.memo(() => {
//   const { t } = useTranslation();

//   return <img alt={t('logo.alt')} src="/images/noswoop.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />;
// });

// export const APP_DARK_LOGO = React.memo(() => {
//   const { t } = useTranslation();

//   return (
//     <img alt={t('logo.alt')} src="/images/noswoop_dark.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
//   );
// });

// export const APP_LIGHT_BANNER = React.memo(() => {
//   const { t } = useTranslation();

//   return <img style={{ display: 'inline-block', width: '100%' }} src="/images/banner.svg" alt={t('banner.alt')} />;
// });

// export const APP_DARK_BANNER = React.memo(() => {
//   const { t } = useTranslation();

//   return <img style={{ display: 'inline-block', width: '100%' }} src="/images/banner_dark.svg" alt={t('banner.alt')} />;
// });

// export const APP_LIGHT_BANNER_VERT = React.memo(() => {
//   const { t } = useTranslation();

//   return (
//     <img style={{ display: 'inline-block', width: '100%' }} src="/images/vertical_banner.svg" alt={t('banner.alt')} />
//   );
// });

// export const APP_DARK_BANNER_VERT = React.memo(() => {
//   const { t } = useTranslation();

//   return (
//     <img
//       style={{ display: 'inline-block', width: '100%' }}
//       src="/images/vertical_banner_dark.svg"
//       alt={t('banner.alt')}
//     />
//   );
// });

// export const APP_TOP_NAV_RIGHT = React.memo(() => {
//   return null;
// });

// export const APP_LEFT_MENU_ITEMS = [
//   {
//     type: 'item',
//     element: {
//       id: 'submit',
//       i18nKey: 'drawer.submit',
//       icon: <PublishOutlinedIcon />,
//       route: '/submit',
//       nested: false
//     }
//   },
//   {
//     type: 'item',
//     element: {
//       id: 'submissions',
//       i18nKey: 'drawer.submissions',
//       userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
//       icon: <ViewCarouselOutlinedIcon />,
//       route: '/submissions',
//       nested: false
//     }
//   },
//   {
//     type: 'item',
//     element: {
//       id: 'alerts',
//       i18nKey: 'drawer.alerts',
//       userPropValidators: [{ prop: 'user.roles', value: 'alert_view' }],
//       icon: <NotificationImportantOutlinedIcon />,
//       route: '/alerts_redirect',
//       nested: false
//     }
//   },
//   {
//     type: 'item',
//     element: {
//       id: 'archive',
//       i18nKey: 'drawer.archive',
//       userPropValidators: [
//         { prop: 'user.roles', value: 'archive_view', enforce: true },
//         { prop: 'configuration.datastore.archive.enabled', value: true, enforce: true }
//       ],
//       icon: <ArchiveOutlinedIcon />,
//       route: '/archive',
//       nested: false
//     }
//   },
//   {
//     type: 'item',
//     element: {
//       id: 'retrohunt',
//       i18nKey: 'drawer.retrohunt',
//       userPropValidators: [
//         { prop: 'user.roles', value: 'retrohunt_view', enforce: true },
//         { prop: 'configuration.retrohunt.enabled', value: true, enforce: true }
//       ],
//       icon: <DataObjectOutlinedIcon />,
//       route: '/retrohunt',
//       nested: false
//     }
//   },
//   {
//     type: 'group',
//     element: {
//       id: 'search',
//       i18nKey: 'drawer.search',
//       userPropValidators: [
//         { prop: 'user.roles', value: 'alert_view' },
//         { prop: 'user.roles', value: 'signature_view' },
//         { prop: 'user.roles', value: 'submission_view' },
//         { prop: 'user.roles', value: 'retrohunt_view' }
//       ],
//       icon: <SearchIcon />,
//       items: [
//         {
//           id: 'search.all',
//           i18nKey: 'drawer.search.all',
//           route: '/search',
//           nested: true
//         },
//         {
//           id: 'search.alert',
//           i18nKey: 'drawer.search.alert',
//           userPropValidators: [{ prop: 'user.roles', value: 'alert_view' }],
//           route: '/search/alert',
//           nested: true
//         },
//         {
//           id: 'search.file',
//           i18nKey: 'drawer.search.file',
//           userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
//           route: '/search/file',
//           nested: true
//         },
//         {
//           id: 'search.result',
//           i18nKey: 'drawer.search.result',
//           userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
//           route: '/search/result',
//           nested: true
//         },
//         {
//           id: 'search.retrohunt',
//           i18nKey: 'drawer.search.retrohunt',
//           userPropValidators: [
//             { prop: 'user.roles', value: 'retrohunt_view' },
//             { prop: 'configuration.retrohunt.enabled', value: true, enforce: true }
//           ],
//           route: '/search/retrohunt',
//           nested: true
//         },
//         {
//           id: 'search.signature',
//           i18nKey: 'drawer.search.signature',
//           userPropValidators: [{ prop: 'user.roles', value: 'signature_view' }],
//           route: '/search/signature',
//           nested: true
//         },
//         {
//           id: 'search.submission',
//           i18nKey: 'drawer.search.submission',
//           userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
//           route: '/search/submission',
//           nested: true
//         }
//       ]
//     }
//   },
//   {
//     type: 'divider',
//     element: null
//   },
//   {
//     type: 'item',
//     element: {
//       id: 'dashboard',
//       i18nKey: 'drawer.dashboard',
//       icon: <DashboardOutlinedIcon />,
//       route: '/dashboard',
//       nested: false
//     }
//   },
//   {
//     type: 'group',
//     element: {
//       id: 'manage',
//       i18nKey: 'drawer.manage',
//       userPropValidators: [
//         { prop: 'user.roles', value: 'badlist_view' },
//         { prop: 'user.roles', value: 'heuristic_view' },
//         { prop: 'user.roles', value: 'safelist_view' },
//         { prop: 'user.roles', value: 'signature_view' },
//         { prop: 'user.roles', value: 'signature_manage' },
//         { prop: 'user.roles', value: 'workflow_view' }
//       ],
//       icon: <BuildOutlinedIcon />,
//       items: [
//         {
//           id: 'manage.badlist',
//           i18nKey: 'drawer.manage.badlist',
//           userPropValidators: [{ prop: 'user.roles', value: 'badlist_view' }],
//           icon: <BugReportOutlinedIcon />,
//           route: '/manage/badlist',
//           nested: true
//         },
//         {
//           id: 'manage.heuristics',
//           i18nKey: 'drawer.manage.heuristics',
//           userPropValidators: [{ prop: 'user.roles', value: 'heuristic_view' }],
//           icon: <SimCardOutlinedIcon />,
//           route: '/manage/heuristics',
//           nested: true
//         },
//         {
//           id: 'manage.safelist',
//           i18nKey: 'drawer.manage.safelist',
//           userPropValidators: [{ prop: 'user.roles', value: 'safelist_view' }],
//           icon: <VerifiedUserOutlinedIcon />,
//           route: '/manage/safelist',
//           nested: true
//         },
//         {
//           id: 'manage.signatures',
//           i18nKey: 'drawer.manage.signatures',
//           userPropValidators: [{ prop: 'user.roles', value: 'signature_view' }],
//           icon: <FingerprintOutlinedIcon />,
//           route: '/manage/signatures',
//           nested: true
//         },
//         {
//           id: 'manage.source',
//           i18nKey: 'drawer.manage.source',
//           userPropValidators: [{ prop: 'user.roles', value: 'signature_manage' }],
//           icon: <CodeOutlinedIcon />,
//           route: '/manage/sources',
//           nested: true
//         },
//         {
//           id: 'manage.workflow',
//           i18nKey: 'drawer.manage.workflow',
//           userPropValidators: [{ prop: 'user.roles', value: 'workflow_view' }],
//           icon: <BiNetworkChart />,
//           route: '/manage/workflows',
//           nested: true
//         }
//       ]
//     }
//   },

//   {
//     type: 'group',
//     element: {
//       id: 'adminmenu',
//       i18nKey: 'adminmenu',
//       userPropValidators: [{ prop: 'user.is_admin', value: true }],
//       icon: <BusinessOutlinedIcon />,
//       items: [
//         {
//           id: 'adminmenu.apikeys',
//           i18nKey: 'adminmenu.apikeys',
//           route: '/admin/apikeys',
//           icon: <KeyOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.errors',
//           i18nKey: 'adminmenu.errors',
//           route: '/admin/errors',
//           icon: <ErrorOutlineOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.identify',
//           i18nKey: 'adminmenu.identify',
//           route: '/admin/identify',
//           icon: <FindInPageOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.actions',
//           i18nKey: 'adminmenu.actions',
//           route: '/admin/actions',
//           icon: <PlaylistPlayOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.services',
//           i18nKey: 'adminmenu.services',
//           route: '/admin/services',
//           icon: <AccountTreeOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.service_review',
//           i18nKey: 'adminmenu.service_review',
//           icon: <CompareArrowsOutlinedIcon />,
//           route: '/admin/service_review',
//           nested: true
//         },
//         {
//           id: 'adminmenu.sitemap',
//           i18nKey: 'adminmenu.sitemap',
//           route: '/admin/sitemap',
//           icon: <MapOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.tag_safelist',
//           i18nKey: 'adminmenu.tag_safelist',
//           route: '/admin/tag_safelist',
//           icon: <VerifiedUserOutlinedIcon />,
//           nested: true
//         },
//         {
//           id: 'adminmenu.users',
//           i18nKey: 'adminmenu.users',
//           route: '/admin/users',
//           icon: <SupervisorAccountOutlinedIcon />,
//           nested: true
//         }
//       ]
//     }
//   },
//   {
//     type: 'divider',
//     element: null
//   },
//   {
//     type: 'group',
//     element: {
//       id: 'help',
//       i18nKey: 'drawer.help',
//       icon: <HelpOutlineOutlinedIcon />,
//       items: [
//         {
//           id: 'help.api',
//           i18nKey: 'drawer.help.api',
//           icon: <AssignmentOutlinedIcon />,
//           route: '/help/api',
//           nested: true
//         },
//         {
//           id: 'help.classification',
//           i18nKey: 'drawer.help.classification',
//           userPropValidators: [{ prop: 'c12nDef.enforce', value: true }],
//           icon: <LabelOutlinedIcon />,
//           route: '/help/classification',
//           nested: true
//         },
//         {
//           id: 'help.configuration',
//           i18nKey: 'drawer.help.configuration',
//           icon: <SettingsApplicationsOutlinedIcon />,
//           route: '/help/configuration',
//           nested: true
//         },
//         {
//           id: 'help.search',
//           i18nKey: 'drawer.help.search',
//           icon: <SearchIcon />,
//           route: '/help/search',
//           nested: true
//         },
//         {
//           id: 'help.services',
//           i18nKey: 'drawer.help.services',
//           icon: <AccountTreeOutlinedIcon />,
//           route: '/help/services',
//           nested: true
//         }
//       ]
//     }
//   },
//   {
//     type: 'group',
//     element: {
//       id: 'development',
//       i18nKey: 'drawer.development',
//       userPropValidators: [
//         { prop: 'user.is_admin', value: true, enforce: true },
//         { prop: 'configuration.system.type', value: 'development' },
//         { prop: 'configuration.system.type', value: 'staging' }
//       ],
//       icon: <CodeIcon />,
//       items: [
//         {
//           id: 'development.api',
//           i18nKey: 'drawer.development.api',
//           userPropValidators: [
//             { prop: 'user.is_admin', value: true, enforce: true },
//             { prop: 'configuration.system.type', value: 'development' },
//             { prop: 'configuration.system.type', value: 'staging' }
//           ],
//           icon: <ApiIcon />,
//           route: '/development/api',
//           nested: true
//         },
//         {
//           id: 'development.customize',
//           i18nKey: 'drawer.development.customize',
//           userPropValidators: [
//             { prop: 'user.is_admin', value: true, enforce: true },
//             { prop: 'configuration.system.type', value: 'development' },
//             { prop: 'configuration.system.type', value: 'staging' }
//           ],
//           icon: <PaletteIcon />,
//           route: '/development/customize',
//           nested: true
//         },
//         {
//           id: 'development.library',
//           i18nKey: 'drawer.development.library',
//           userPropValidators: [
//             { prop: 'user.is_admin', value: true, enforce: true },
//             { prop: 'configuration.system.type', value: 'development' },
//             { prop: 'configuration.system.type', value: 'staging' }
//           ],
//           icon: <LibraryBooksIcon />,
//           route: '/development/library',
//           nested: true
//         },
//         {
//           id: 'development.theme',
//           i18nKey: 'drawer.development.theme',
//           userPropValidators: [
//             { prop: 'user.is_admin', value: true, enforce: true },
//             { prop: 'configuration.system.type', value: 'development' },
//             { prop: 'configuration.system.type', value: 'staging' }
//           ],
//           icon: <PaletteIcon />,
//           route: '/development/theme',
//           nested: true
//         }
//       ]
//     }
//   }
// ];
