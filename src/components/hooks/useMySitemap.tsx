import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';

import BlockIcon from '@mui/icons-material/Block';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistPlayOutlinedIcon from '@mui/icons-material/PlaylistPlayOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsApplicationsOutlinedIcon from '@mui/icons-material/SettingsApplicationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SimCardOutlinedIcon from '@mui/icons-material/SimCardOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';

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
      { path: '/forbidden', title: t('forbidden'), isRoot: true, icon: <BlockIcon /> },
      { path: '/notfound', title: t('notfound'), isRoot: true, icon: <LinkOffIcon /> },

      { path: '/', title: t('drawer.submit'), isRoot: true, icon: <PublishOutlinedIcon /> },
      { path: '/submit', title: t('drawer.submit'), isRoot: true, icon: <PublishOutlinedIcon /> },
      { path: '/submissions', title: t('drawer.submissions'), isRoot: true, icon: <ViewCarouselOutlinedIcon /> },
      {
        path: '/submission/detail/:id',
        title: t('breadcrumb.submission.detail'),
        icon: <ListAltOutlinedIcon />,
        breadcrumbs: ['/submissions']
      },
      {
        path: '/file/detail/:id',
        title: t('breadcrumb.file.detail'),
        icon: <DescriptionOutlinedIcon />,
        isRoot: true
      },
      {
        path: '/file/viewer/:id',
        title: t('breadcrumb.file.viewer'),
        icon: <PageviewOutlinedIcon />,
        isRoot: true
      },
      {
        path: '/submission/detail/:id/:fid',
        title: t('breadcrumb.submission.detail'),
        icon: <ListAltOutlinedIcon />,
        breadcrumbs: ['/submissions']
      },
      {
        path: '/submission/report/:id',
        title: t('breadcrumb.submission.report'),
        icon: <ChromeReaderModeOutlinedIcon />,
        breadcrumbs: ['/submissions']
      },
      { path: '/alerts', title: t('drawer.alerts'), isRoot: true, icon: <NotificationImportantOutlinedIcon /> },
      { path: '/retrohunt', title: t('drawer.retrohunt'), isRoot: true, icon: <DataObjectOutlinedIcon /> },
      {
        path: '/retrohunt/:code',
        title: t('breadcrumb.workflow.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/retrohunt']
      },
      {
        path: '/alerts/:id',
        title: t('breadcrumb.alert.detail'),
        icon: <BallotOutlinedIcon />,
        breadcrumbs: ['/alerts']
      },
      { path: '/archive', title: t('drawer.archive'), isRoot: true, icon: <ArchiveOutlinedIcon /> },
      { path: '/dashboard', title: t('drawer.dashboard'), isRoot: true, icon: <DashboardOutlinedIcon /> },
      { path: '/manage', title: t('drawer.manage'), isRoot: true, icon: <BuildOutlinedIcon /> },
      {
        path: '/manage/heuristics',
        title: t('drawer.manage.heuristics'),
        icon: <SimCardOutlinedIcon />,
        breadcrumbs: ['/manage']
      },
      {
        path: '/manage/heuristic/:id',
        title: t('breadcrumb.heuristic.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/manage', '/manage/heuristics']
      },
      {
        path: '/manage/signatures',
        title: t('drawer.manage.signatures'),
        icon: <FingerprintOutlinedIcon />,
        breadcrumbs: ['/manage']
      },
      {
        path: '/manage/signature/:id',
        title: t('breadcrumb.signature.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/manage', '/manage/signatures']
      },
      {
        path: '/manage/signature/:type/:source/:name',
        title: t('breadcrumb.signature.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/manage', '/manage/signatures']
      },
      {
        path: '/manage/sources',
        title: t('drawer.manage.source'),
        icon: <CodeOutlinedIcon />,
        breadcrumbs: ['/manage']
      },
      {
        path: '/manage/workflow/:id',
        title: t('breadcrumb.workflow.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/manage', '/manage/workflows']
      },
      {
        path: '/manage/workflows',
        title: t('drawer.manage.workflow'),
        icon: <BiNetworkChart />,
        breadcrumbs: ['/manage']
      },
      {
        path: '/manage/safelist/:id',
        title: t('breadcrumb.safelist.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/manage', '/manage/safelist']
      },
      {
        path: '/manage/safelist',
        title: t('drawer.manage.safelist'),
        icon: <PlaylistAddCheckIcon />,
        breadcrumbs: ['/manage']
      },
      { path: '/search', title: t('drawer.search'), isRoot: true, icon: <SearchIcon /> },
      { path: '/search/alert', title: t('drawer.search.alert'), breadcrumbs: ['/search'] },
      { path: '/search/file', title: t('drawer.search.file'), breadcrumbs: ['/search'] },
      { path: '/search/result', title: t('drawer.search.result'), breadcrumbs: ['/search'] },
      { path: '/search/signature', title: t('drawer.search.signature'), breadcrumbs: ['/search'] },
      { path: '/search/submission', title: t('drawer.search.submission'), breadcrumbs: ['/search'] },
      { path: '/help', title: t('drawer.help'), isRoot: true, icon: <HelpOutlineOutlinedIcon /> },
      { path: '/help/api', title: t('drawer.help.api'), icon: <AssignmentOutlinedIcon />, breadcrumbs: ['/help'] },
      {
        path: '/help/classification',
        title: t('drawer.help.classification'),
        icon: <LabelOutlinedIcon />,
        breadcrumbs: ['/help']
      },
      {
        path: '/help/configuration',
        title: t('drawer.help.configuration'),
        icon: <SettingsApplicationsOutlinedIcon />,
        breadcrumbs: ['/help']
      },
      { path: '/help/search', title: t('drawer.help.search'), icon: <SearchIcon />, breadcrumbs: ['/help'] },
      {
        path: '/help/services',
        title: t('drawer.help.services'),
        icon: <AccountTreeOutlinedIcon />,
        breadcrumbs: ['/help']
      },
      { path: '/tos', title: t('breadcrumb.tos'), isRoot: true, icon: <ReceiptOutlinedIcon /> },
      { path: '/account', title: t('usermenu.account'), isRoot: true, icon: <AccountCircleOutlinedIcon /> },
      { path: '/settings', title: t('usermenu.settings'), isRoot: true, icon: <SettingsOutlinedIcon /> },
      { path: '/admin', title: t('adminmenu'), isRoot: true, icon: <BusinessOutlinedIcon /> },
      {
        path: '/admin/service_review',
        title: t('adminmenu.service_review'),
        icon: <CompareArrowsOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/actions',
        title: t('adminmenu.actions'),
        icon: <PlaylistPlayOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/errors',
        title: t('adminmenu.errors'),
        icon: <ErrorOutlineOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/identify',
        title: t('adminmenu.identify'),
        icon: <FindInPageOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/errors/:id',
        title: t('breadcrumb.heuristic.detail'),
        icon: <ListOutlinedIcon />,
        breadcrumbs: ['/admin', '/admin/errors']
      },
      {
        path: '/admin/services',
        title: t('adminmenu.services'),
        icon: <AccountTreeOutlinedIcon />,
        breadcrumbs: ['/admin']
      },
      {
        path: '/admin/services/:svc',
        title: '{:svc}',
        icon: <WebAssetIcon />,
        breadcrumbs: ['/admin', '/admin/services']
      },
      { path: '/admin/sitemap', title: t('adminmenu.sitemap'), icon: <MapOutlinedIcon />, breadcrumbs: ['/admin'] },
      {
        path: '/admin/tag_safelist',
        title: t('adminmenu.tag_safelist'),
        icon: <PlaylistAddCheckIcon />,
        breadcrumbs: ['/admin']
      },
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
