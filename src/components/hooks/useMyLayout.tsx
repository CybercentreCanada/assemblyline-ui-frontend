import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
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
import { AppPreferenceConfigs, AppSwitcherItem } from 'commons/components/app/AppConfigs';
import { Notification } from 'components/visual/Notification';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';

const useMyLayout = (): AppPreferenceConfigs => {
  const { t } = useTranslation();
  const MENU_ITEMS = [
    {
      type: 'item' as 'item',
      element: {
        id: 'submit',
        text: t('drawer.submit'),
        icon: <PublishOutlinedIcon />,
        route: '/submit',
        nested: false
      }
    },
    {
      type: 'item' as 'item',
      element: {
        id: 'submissions',
        text: t('drawer.submissions'),
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
        text: t('drawer.alerts'),
        userPropValidators: [{ prop: 'user.roles', value: 'alert_view' }],
        icon: <NotificationImportantOutlinedIcon />,
        route: '/alerts',
        nested: false
      }
    },
    {
      type: 'group' as 'group',
      element: {
        id: 'search',
        title: t('drawer.search'),
        userPropValidators: [
          { prop: 'user.roles', value: 'alert_view' },
          { prop: 'user.roles', value: 'signature_view' },
          { prop: 'user.roles', value: 'submission_view' }
        ],
        icon: <SearchIcon />,
        items: [
          {
            id: 'search.all',
            text: t('drawer.search.all'),
            route: '/search',
            nested: true
          },
          {
            id: 'search.alert',
            text: t('drawer.search.alert'),
            userPropValidators: [{ prop: 'user.roles', value: 'alert_view' }],
            route: '/search/alert',
            nested: true
          },
          {
            id: 'search.file',
            text: t('drawer.search.file'),
            userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
            route: '/search/file',
            nested: true
          },
          {
            id: 'search.result',
            text: t('drawer.search.result'),
            userPropValidators: [{ prop: 'user.roles', value: 'submission_view' }],
            route: '/search/result',
            nested: true
          },
          {
            id: 'search.signature',
            text: t('drawer.search.signature'),
            userPropValidators: [{ prop: 'user.roles', value: 'signature_view' }],
            route: '/search/signature',
            nested: true
          },
          {
            id: 'search.submission',
            text: t('drawer.search.submission'),
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
        text: t('drawer.dashboard'),
        icon: <DashboardOutlinedIcon />,
        route: '/dashboard',
        nested: false
      }
    },
    {
      type: 'group' as 'group',
      element: {
        id: 'manage',
        title: t('drawer.manage'),
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
            text: t('drawer.manage.heuristics'),
            userPropValidators: [{ prop: 'user.roles', value: 'heuristic_view' }],
            icon: <SimCardOutlinedIcon />,
            route: '/manage/heuristics',
            nested: true
          },
          {
            id: 'manage.safelist',
            text: t('drawer.manage.safelist'),
            userPropValidators: [{ prop: 'user.roles', value: 'safelist_view' }],
            icon: <PlaylistAddCheckIcon />,
            route: '/manage/safelist',
            nested: true
          },
          {
            id: 'manage.signatures',
            text: t('drawer.manage.signatures'),
            userPropValidators: [{ prop: 'user.roles', value: 'signature_view' }],
            icon: <FingerprintOutlinedIcon />,
            route: '/manage/signatures',
            nested: true
          },
          {
            id: 'manage.source',
            text: t('drawer.manage.source'),
            userPropValidators: [{ prop: 'user.roles', value: 'signature_manage' }],
            icon: <CodeOutlinedIcon />,
            route: '/manage/sources',
            nested: true
          },
          {
            id: 'manage.workflow',
            text: t('drawer.manage.workflow'),
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
        title: t('adminmenu'),
        userPropValidators: [{ prop: 'user.is_admin', value: true }],
        icon: <BusinessOutlinedIcon />,
        items: [
          {
            id: 'adminmenu.errors',
            text: t('adminmenu.errors'),
            route: '/admin/errors',
            icon: <ErrorOutlineOutlinedIcon />,
            nested: true
          },
          {
            id: 'adminmenu.identify',
            text: t('adminmenu.identify'),
            route: '/admin/identify',
            icon: <FindInPageOutlinedIcon />,
            nested: true
          },
          {
            id: 'adminmenu.actions',
            text: t('adminmenu.actions'),
            route: '/admin/actions',
            icon: <PlaylistPlayOutlinedIcon />,
            nested: true
          },
          {
            id: 'adminmenu.services',
            text: t('adminmenu.services'),
            route: '/admin/services',
            icon: <AccountTreeOutlinedIcon />,
            nested: true
          },
          {
            id: 'adminmenu.service_review',
            text: t('adminmenu.service_review'),
            icon: <CompareArrowsOutlinedIcon />,
            route: '/admin/service_review',
            nested: true
          },
          {
            id: 'adminmenu.sitemap',
            text: t('adminmenu.sitemap'),
            route: '/admin/sitemap',
            icon: <MapOutlinedIcon />,
            nested: true
          },
          {
            id: 'adminmenu.tag_safelist',
            text: t('adminmenu.tag_safelist'),
            route: '/admin/tag_safelist',
            icon: <PlaylistAddCheckIcon />,
            nested: true
          },
          {
            id: 'adminmenu.users',
            text: t('adminmenu.users'),
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
        title: t('drawer.help'),
        icon: <HelpOutlineOutlinedIcon />,
        items: [
          {
            id: 'help.api',
            text: t('drawer.help.api'),
            icon: <AssignmentOutlinedIcon />,
            route: '/help/api',
            nested: true
          },
          {
            id: 'help.classification',
            text: t('drawer.help.classification'),
            userPropValidators: [{ prop: 'c12nDef.enforce', value: true }],
            icon: <LabelOutlinedIcon />,
            route: '/help/classification',
            nested: true
          },
          {
            id: 'help.configuration',
            text: t('drawer.help.configuration'),
            icon: <SettingsApplicationsOutlinedIcon />,
            route: '/help/configuration',
            nested: true
          },
          {
            id: 'help.search',
            text: t('drawer.help.search'),
            icon: <SearchIcon />,
            route: '/help/search',
            nested: true
          },
          {
            id: 'help.services',
            text: t('drawer.help.services'),
            icon: <AccountTreeOutlinedIcon />,
            route: '/help/services',
            nested: true
          }
        ]
      }
    }
  ];

  const APP_SWITCHER_ITEMS: AppSwitcherItem[] = [
    {
      alt: 'AL',
      name: 'Assemblyline',
      img_d: '/images/al_dark.svg',
      img_l: '/images/al.svg',
      route: 'https://localhost'
    }
  ];

  const USER_MENU_ITEMS = [
    {
      name: t('usermenu.account'),
      route: '/account',
      icon: <AccountCircleOutlinedIcon />
    },
    {
      name: t('usermenu.settings'),
      route: '/settings',
      icon: <SettingsOutlinedIcon />
    },
    {
      name: t('usermenu.logout'),
      route: '/logout',
      icon: <ExitToAppIcon />
    }
  ];

  const ADMIN_MENU_ITEMS = [
    // {
    //   name: t('adminmenu.errors'),
    //   route: '/admin/errors',
    //   icon: <ErrorOutlineOutlinedIcon />
    // },
    // {
    //   name: t('adminmenu.services'),
    //   route: '/admin/services',
    //   icon: <AccountTreeOutlinedIcon />
    // },
    // {
    //   name: t('adminmenu.sitemap'),
    //   route: '/admin/sitemap',
    //   icon: <MapOutlinedIcon />
    // },
    // {
    //   name: t('adminmenu.tag_safelist'),
    //   route: '/admin/tag_safelist',
    //   icon: <PlaylistAddCheckIcon />
    // },
    // {
    //   name: t('adminmenu.users'),
    //   route: '/admin/users',
    //   icon: <SupervisorAccountOutlinedIcon />
    // }
  ];

  const darkLogo = (
    <img
      alt={t('logo.alt')}
      src={`${process.env.PUBLIC_URL}/images/al_dark.svg`}
      width="40"
      height="32"
      style={{ marginLeft: '-5px' }}
    />
  );
  const lightLogo = (
    <img
      alt={t('logo.alt')}
      src={`${process.env.PUBLIC_URL}/images/al.svg`}
      width="40"
      height="32"
      style={{ marginLeft: '-5px' }}
    />
  );
  const darkBanner = (
    <img
      style={{ display: 'inline-block', width: '100%', margin: '2rem 0' }}
      src={`${process.env.PUBLIC_URL}/images/banner_dark.svg`}
      alt={t('banner.alt')}
    />
  );
  const lightBanner = (
    <img
      style={{ display: 'inline-block', width: '100%', margin: '2rem 0' }}
      src={`${process.env.PUBLIC_URL}/images/banner.svg`}
      alt={t('banner.alt')}
    />
  );

  return {
    appName: 'Assemblyline',
    allowBreadcrumbs: false,
    allowReset: false,
    appIconDark: darkLogo,
    appIconLight: lightLogo,
    bannerLight: lightBanner,
    bannerDark: darkBanner,
    defaultLayout: 'side' as 'side',
    defaultDrawerOpen: false,
    defaultShowQuickSearch: true,
    defaultAutoHideAppbar: false,
    defaultShowBreadcrumbs: true,
    leftnav: {
      elements: MENU_ITEMS,
      hideNestedIcons: true
    },
    topnav: {
      adminMenu: ADMIN_MENU_ITEMS,
      adminMenuTitle: t('adminmenu'),
      apps: APP_SWITCHER_ITEMS,
      quickSearchURI: '/search',
      quickSearchParam: 'query',
      right: <Notification />,
      themeSelectionMode: 'profile' as 'profile',
      userMenu: USER_MENU_ITEMS,
      userMenuTitle: t('usermenu'),
      userMenuType: 'icon' as 'icon'
    }
  };
};

export default useMyLayout;
