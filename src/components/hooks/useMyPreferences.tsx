/* eslint-disable react-hooks/exhaustive-deps */
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistPlayOutlinedIcon from '@mui/icons-material/PlaylistPlayOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsApplicationsOutlinedIcon from '@mui/icons-material/SettingsApplicationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SimCardOutlinedIcon from '@mui/icons-material/SimCardOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { AppBarUserMenuElement, AppLeftNavElement, AppPreferenceConfigs } from 'commons/components/app/AppConfigs';
import { Notification } from 'components/visual/Notification';
import { ReactElement, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';

const useMyPreferences = () => {
  const { t } = useTranslation();

  const AL_LIGHT_LOGO = useMemo(
    (): ReactElement<any> => (
      <img
        alt={t('logo.alt')}
        src={`${process.env.PUBLIC_URL}/images/al.svg`}
        width="40"
        height="32"
        style={{ marginLeft: '-5px' }}
      />
    ),
    [t]
  );

  const AL_DARK_LOGO = useMemo(
    (): ReactElement<any> => (
      <img
        alt={t('logo.alt')}
        src={`${process.env.PUBLIC_URL}/images/al_dark.svg`}
        width="40"
        height="32"
        style={{ marginLeft: '-5px' }}
      />
    ),
    [t]
  );

  const AL_LIGHT_BANNER = useMemo(
    (): ReactElement<any> => (
      <img
        style={{ display: 'inline-block', width: '100%', margin: '2rem 0' }}
        src={`${process.env.PUBLIC_URL}/images/banner.svg`}
        alt={t('banner.alt')}
      />
    ),
    [t]
  );

  const AL_DARK_BANNER = useMemo(
    (): ReactElement<any> => (
      <img
        style={{ display: 'inline-block', width: '100%', margin: '2rem 0' }}
        src={`${process.env.PUBLIC_URL}/images/banner_dark.svg`}
        alt={t('banner.alt')}
      />
    ),
    [t]
  );

  const TOP_NAV_RIGHT = useMemo((): ReactNode => <Notification />, []);

  const LEFT_MENU_ITEMS = useMemo(
    (): AppLeftNavElement[] => [
      {
        type: 'item' as 'item',
        element: {
          id: 'submit',
          i18nKey: 'drawer.submit',
          icon: <PublishOutlinedIcon />,
          route: '/submit',
          nested: false
        }
      },
      {
        type: 'item' as 'item',
        element: {
          id: 'submissions',
          i18nKey: 'drawer.submissions',
          userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
          icon: <ViewCarouselOutlinedIcon />,
          route: '/submissions',
          nested: false
        }
      },
      {
        type: 'item' as 'item',
        element: {
          id: 'alerts',
          i18nKey: 'drawer.alerts',
          userPropValidators: [{ prop: 'user.roles', value: 'alert_view' }],
          icon: <NotificationImportantOutlinedIcon />,
          route: '/alerts',
          nested: false
        }
      },
      {
        type: 'item' as 'item',
        element: {
          id: 'archive',
          text: t('drawer.archive'),
          userPropValidators: [
            { prop: 'user.roles', value: 'archive_view', enforce: true },
            { prop: 'configuration.datastore.archive.enabled', value: true, enforce: true }
          ],
          icon: <ArchiveOutlinedIcon />,
          route: '/archive',
          nested: false
        }
      },
      {
        type: 'item' as 'item',
        element: {
          id: 'retrohunt',
          i18nKey: 'drawer.retrohunt',
          userPropValidators: [{ prop: 'user.roles', value: 'retrohunt_view' }],
          icon: <DataObjectOutlinedIcon />,
          route: '/retrohunt',
          nested: false
        }
      },
      {
        type: 'group' as 'group',
        element: {
          id: 'search',
          i18nKey: 'drawer.search',
          userPropValidators: [
            { prop: 'user.roles', value: 'alert_view' },
            { prop: 'user.roles', value: 'signature_view' },
            { prop: 'user.roles', value: 'submission_view' },
            { prop: 'user.roles', value: 'retrohunt_view' }
          ],
          icon: <SearchIcon />,
          items: [
            {
              id: 'search.all',
              i18nKey: 'drawer.search.all',
              route: '/search',
              nested: true
            },
            {
              id: 'search.alert',
              i18nKey: 'drawer.search.alert',
              userPropValidators: [{ prop: 'user.roles', value: 'alert_view' }],
              route: '/search/alert',
              nested: true
            },
            {
              id: 'search.file',
              i18nKey: 'drawer.search.file',
              userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
              route: '/search/file',
              nested: true
            },
            {
              id: 'search.result',
              i18nKey: 'drawer.search.result',
              userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
              route: '/search/result',
              nested: true
            },
            {
              id: 'search.retrohunt',
              i18nKey: 'drawer.search.retrohunt',
              userPropValidators: [{ prop: 'user.roles', value: 'retrohunt_view' }],
              route: '/search/retrohunt',
              nested: true
            },
            {
              id: 'search.signature',
              i18nKey: 'drawer.search.signature',
              userPropValidators: [{ prop: 'user.roles', value: 'signature_view' }],
              route: '/search/signature',
              nested: true
            },
            {
              id: 'search.submission',
              i18nKey: 'drawer.search.submission',
              userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
              route: '/search/submission',
              nested: true
            }
          ]
        }
      },
      {
        type: 'divider' as 'divider',
        element: null
      },
      {
        type: 'item' as 'item',
        element: {
          id: 'dashboard',
          i18nKey: 'drawer.dashboard',
          icon: <DashboardOutlinedIcon />,
          route: '/dashboard',
          nested: false
        }
      },
      {
        type: 'group' as 'group',
        element: {
          id: 'manage',
          i18nKey: 'drawer.manage',
          userPropValidators: [
            { prop: 'user.roles', value: 'heuristic_view' },
            { prop: 'user.roles', value: 'safelist_view' },
            { prop: 'user.roles', value: 'signature_view' },
            { prop: 'user.roles', value: 'signature_manage' },
            { prop: 'user.roles', value: 'workflow_view' }
          ],
          icon: <BuildOutlinedIcon />,
          items: [
            {
              id: 'manage.heuristics',
              i18nKey: 'drawer.manage.heuristics',
              userPropValidators: [{ prop: 'user.roles', value: 'heuristic_view' }],
              icon: <SimCardOutlinedIcon />,
              route: '/manage/heuristics',
              nested: true
            },
            {
              id: 'manage.safelist',
              i18nKey: 'drawer.manage.safelist',
              userPropValidators: [{ prop: 'user.roles', value: 'safelist_view' }],
              icon: <PlaylistAddCheckIcon />,
              route: '/manage/safelist',
              nested: true
            },
            {
              id: 'manage.signatures',
              i18nKey: 'drawer.manage.signatures',
              userPropValidators: [{ prop: 'user.roles', value: 'signature_view' }],
              icon: <FingerprintOutlinedIcon />,
              route: '/manage/signatures',
              nested: true
            },
            {
              id: 'manage.source',
              i18nKey: 'drawer.manage.source',
              userPropValidators: [{ prop: 'user.roles', value: 'signature_manage' }],
              icon: <CodeOutlinedIcon />,
              route: '/manage/sources',
              nested: true
            },
            {
              id: 'manage.workflow',
              i18nKey: 'drawer.manage.workflow',
              userPropValidators: [{ prop: 'user.roles', value: 'workflow_view' }],
              icon: <BiNetworkChart />,
              route: '/manage/workflows',
              nested: true
            }
          ]
        }
      },

      {
        type: 'group' as 'group',
        element: {
          id: 'adminmenu',
          i18nKey: 'adminmenu',
          userPropValidators: [{ prop: 'user.is_admin', value: true }],
          icon: <BusinessOutlinedIcon />,
          items: [
            {
              id: 'adminmenu.errors',
              i18nKey: 'adminmenu.errors',
              route: '/admin/errors',
              icon: <ErrorOutlineOutlinedIcon />,
              nested: true
            },
            {
              id: 'adminmenu.identify',
              i18nKey: 'adminmenu.identify',
              route: '/admin/identify',
              icon: <FindInPageOutlinedIcon />,
              nested: true
            },
            {
              id: 'adminmenu.actions',
              i18nKey: 'adminmenu.actions',
              route: '/admin/actions',
              icon: <PlaylistPlayOutlinedIcon />,
              nested: true
            },
            {
              id: 'adminmenu.services',
              i18nKey: 'adminmenu.services',
              route: '/admin/services',
              icon: <AccountTreeOutlinedIcon />,
              nested: true
            },
            {
              id: 'adminmenu.service_review',
              i18nKey: 'adminmenu.service_review',
              icon: <CompareArrowsOutlinedIcon />,
              route: '/admin/service_review',
              nested: true
            },
            {
              id: 'adminmenu.sitemap',
              i18nKey: 'adminmenu.sitemap',
              route: '/admin/sitemap',
              icon: <MapOutlinedIcon />,
              nested: true
            },
            {
              id: 'adminmenu.tag_safelist',
              i18nKey: 'adminmenu.tag_safelist',
              route: '/admin/tag_safelist',
              icon: <PlaylistAddCheckIcon />,
              nested: true
            },
            {
              id: 'adminmenu.users',
              i18nKey: 'adminmenu.users',
              route: '/admin/users',
              icon: <SupervisorAccountOutlinedIcon />,
              nested: true
            }
          ]
        }
      },
      {
        type: 'divider' as 'divider',
        element: null
      },
      {
        type: 'group' as 'group',
        element: {
          id: 'help',
          i18nKey: 'drawer.help',
          icon: <HelpOutlineOutlinedIcon />,
          items: [
            {
              id: 'help.api',
              i18nKey: 'drawer.help.api',
              icon: <AssignmentOutlinedIcon />,
              route: '/help/api',
              nested: true
            },
            {
              id: 'help.classification',
              i18nKey: 'drawer.help.classification',
              userPropValidators: [{ prop: 'c12nDef.enforce', value: true }],
              icon: <LabelOutlinedIcon />,
              route: '/help/classification',
              nested: true
            },
            {
              id: 'help.configuration',
              i18nKey: 'drawer.help.configuration',
              icon: <SettingsApplicationsOutlinedIcon />,
              route: '/help/configuration',
              nested: true
            },
            {
              id: 'help.search',
              i18nKey: 'drawer.help.search',
              icon: <SearchIcon />,
              route: '/help/search',
              nested: true
            },
            {
              id: 'help.services',
              i18nKey: 'drawer.help.services',
              icon: <AccountTreeOutlinedIcon />,
              route: '/help/services',
              nested: true
            }
          ]
        }
      }
    ],
    []
  );

  const USER_MENU_ITEMS = useMemo(
    (): AppBarUserMenuElement[] => [
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
    ],
    []
  );

  return useMemo(
    (): AppPreferenceConfigs => ({
      allowBreadcrumbs: true,
      allowShowSafeResults: true,
      allowQuickSearch: true,
      allowReset: false,
      appName: 'Assemblyline',
      appLink: '/',
      appIconDark: AL_DARK_LOGO,
      appIconLight: AL_LIGHT_LOGO,
      bannerDark: AL_DARK_BANNER,
      bannerLight: AL_LIGHT_BANNER,
      defaultAutoHideAppbar: false,
      defaultDrawerOpen: false,
      defaultLayout: 'side',
      defaultShowBreadcrumbs: true,
      defaultShowQuickSearch: true,
      leftnav: {
        width: 240,
        elements: LEFT_MENU_ITEMS,
        hideNestedIcons: true
      },
      topnav: {
        adminMenu: [],
        adminMenuI18nKey: 'adminmenu',
        apps: [],
        quickSearchURI: '/search',
        quickSearchParam: 'query',
        right: TOP_NAV_RIGHT,
        themeSelectionMode: 'profile',
        userMenu: USER_MENU_ITEMS,
        userMenuI18nKey: 'usermenu',
        userMenuType: 'icon'
      }
    }),
    [AL_DARK_LOGO, AL_LIGHT_LOGO, AL_DARK_BANNER, AL_LIGHT_BANNER, USER_MENU_ITEMS, TOP_NAV_RIGHT, LEFT_MENU_ITEMS]
  );
};

export default useMyPreferences;
