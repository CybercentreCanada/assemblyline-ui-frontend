import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import ListAltOutlinedIcon from '@material-ui/icons/ListAltOutlined';
import MapOutlinedIcon from '@material-ui/icons/MapOutlined';
import NotificationImportantOutlinedIcon from '@material-ui/icons/NotificationImportantOutlined';
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined';
import ReceiptOutlinedIcon from '@material-ui/icons/ReceiptOutlined';
import SearchIcon from '@material-ui/icons/Search';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import SupervisorAccountOutlinedIcon from '@material-ui/icons/SupervisorAccountOutlined';
import React from 'react';
import { useTranslation } from 'react-i18next';

// SiteMapContextProps configuration properties.
// exceptLast: boolean = false (default),
// allLinks: boolean = false (default),
// lastOnly: boolean = false (default),
// itemsBefore: number = 1 (default),
// itemsAfter: number = 1 (default),
// routes: SiteMapRoute[] = [] (default)

// For each individual SiteMapRoute:
// path: string -> the react router path to this route.
// title: string -> the title/lable to display in breadcrumbs for this route.
// icon?: React.ReactNode -> the icon component to show beside the title/lable.
// isRoot?: boolean = false -> when true, indicates that the breadcrumbs will reset to this one path each time it is encountered.
// isLeaf?: boolean = false -> when true, indicates that this path does not aggregate in breadcrumbs, i.e. will be replaced by next path.
// excluded?: boolean = false -> when true, indicates to breadcrumbs component to not render this route.  This is usefull if you want to use <PageHeader mode='title' />
export default function useMySitemap() {
  const { t } = useTranslation();
  return {
    routes: [
      { path: '/', title: t('drawer.submit'), isRoot: true, icon: <PublishOutlinedIcon /> },
      { path: '/submit', title: t('drawer.submit'), isRoot: true, icon: <PublishOutlinedIcon /> },
      { path: '/submissions', title: t('drawer.submissions'), isRoot: true, icon: <AmpStoriesOutlinedIcon /> },
      {
        path: '/submission/detail',
        title: t('page.submission.detail'),
        icon: <ListAltOutlinedIcon />,
        breadcrumbs: ['/submissions']
      },
      {
        path: '/submission/report',
        title: t('page.submission.report'),
        icon: <ChromeReaderModeOutlinedIcon />,
        breadcrumbs: ['/submissions']
      },
      { path: '/alerts', title: t('drawer.alerts'), isRoot: true, icon: <NotificationImportantOutlinedIcon /> },
      { path: '/dashboard', title: t('drawer.dashboard'), isRoot: true, icon: <DashboardOutlinedIcon /> },
      { path: '/manage', title: t('drawer.manage'), isRoot: true, icon: <BuildOutlinedIcon /> },
      { path: '/manage/heuristics', title: t('drawer.manage.heuristics'), breadcrumbs: ['/manage'] },
      { path: '/manage/signatures', title: t('drawer.manage.signatures'), breadcrumbs: ['/manage'] },
      { path: '/manage/sources', title: t('drawer.manage.source'), breadcrumbs: ['/manage'] },
      { path: '/manage/workflows', title: t('drawer.manage.workflow'), breadcrumbs: ['/manage'] },
      { path: '/search', title: t('drawer.search'), isRoot: true, icon: <SearchIcon /> },
      { path: '/search?index=alert', title: t('drawer.search.alert'), breadcrumbs: ['/search'] },
      { path: '/search?index=file', title: t('drawer.search.file'), breadcrumbs: ['/search'] },
      { path: '/search?index=result', title: t('drawer.search.result'), breadcrumbs: ['/search'] },
      { path: '/search?index=signature', title: t('drawer.search.signature'), breadcrumbs: ['/search'] },
      { path: '/search?index=submission', title: t('drawer.search.submission'), breadcrumbs: ['/search'] },
      { path: '/help', title: t('drawer.help'), isRoot: true, icon: <HelpOutlineOutlinedIcon /> },
      { path: '/help/api', title: t('drawer.help.api'), breadcrumbs: ['/help'] },
      { path: '/help/classification', title: t('drawer.help.classification'), breadcrumbs: ['/help'] },
      { path: '/help/configuration', title: t('drawer.help.configuration'), breadcrumbs: ['/help'] },
      { path: '/help/search', title: t('drawer.help.search'), breadcrumbs: ['/help'] },
      { path: '/help/service', title: t('drawer.help.service'), breadcrumbs: ['/help'] },
      { path: '/tos', title: t('page.tos'), isRoot: true, icon: <ReceiptOutlinedIcon /> },
      { path: '/account', title: t('usermenu.account'), isRoot: true, icon: <AccountCircleOutlinedIcon /> },
      { path: '/settings', title: t('usermenu.settings'), isRoot: true, icon: <SettingsOutlinedIcon /> },
      { path: '/admin', title: t('adminmenu'), isRoot: true },
      {
        path: '/admin/errors',
        title: t('adminmenu.errors'),
        icon: <ErrorOutlineOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/services',
        title: t('adminmenu.services'),
        icon: <AccountTreeOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      { path: '/admin/sitemap', title: t('adminmenu.sitemap'), icon: <MapOutlinedIcon />, breadcrumbs: ['/admin'] },
      {
        path: '/admin/users',
        title: t('adminmenu.users'),
        icon: <SupervisorAccountOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/users/:id',
        title: '{:id}',
        isRoot: true,
        icon: <AccountCircleOutlinedIcon />,
        breadcrumbs: ['/admin', '/admin/users']
      }
    ]
  };
}
