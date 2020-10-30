import { CssBaseline, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import useAppUser from 'commons/components/hooks/useAppUser';
import LeftNavDrawer, { LeftNavElement } from 'commons/components/layout/leftnav/LeftNavDrawer';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import { AppElement } from 'commons/components/layout/topnav/AppSwitcher';
import TopBar from 'commons/components/layout/topnav/TopBar';
import { UserMenuElement } from 'commons/components/layout/topnav/UserProfile';
import React, { useState } from 'react';

const useStyles = (layout, showSpacing) => {
  return makeStyles(theme => ({
    app: {
      [theme.breakpoints.up('md')]: {
        display: 'flex'
      }
    },
    container: {
      display: 'block',
      paddingTop: showSpacing ? theme.spacing(8) : theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      [theme.breakpoints.only('sm')]: {
        paddingLeft: showSpacing ? theme.spacing(10) : theme.spacing(3)
      },
      [theme.breakpoints.up('md')]: {
        flexGrow: 1
      },
      '@media print': {
        padding: 0
      }
    }
  }))();
};

export type AppLayoutContextProps = {
  autoHideAppbar: boolean;
  currentLayout: string;
  drawerState: boolean;
  breadcrumbsEnabled: boolean;
  breadcrumbsState: boolean;
  breadcrumbsPlacement: string;
  hideNestedIcons: boolean;
  layoutProps: AppLayoutProps;
  showQuickSearch: boolean;
  getBanner: (theme) => React.ReactElement<any>;
  getLogo: (theme) => React.ReactElement<any>;
  hideMenus: () => void;
  toggleLayout: () => void;
  toggleDrawer: () => void;
  toggleQuickSearch: () => void;
  toggleAutoHideAppbar: () => void;
  toggleShowBreadcrumbs: () => void;
  toggleBreadcrumbsState: () => void;
  isReady: () => boolean;
  setReady: (isReady: boolean) => void;
};

export interface AppLayoutProps {
  appName: string;
  allowAutoHideTopbar?: boolean;
  allowBreadcrumbs?: boolean;
  allowBreadcrumbsMinimize?: boolean;
  allowGravatar?: boolean;
  allowQuickSearch?: boolean;
  allowReset?: boolean;
  allowTopbarModeSelection?: boolean;
  allowThemeSelection?: boolean;
  allowTranslate?: boolean;
  appIconDark: React.ReactElement<any>;
  appIconLight: React.ReactElement<any>;
  bannerDark: React.ReactElement<any>;
  bannerLight: React.ReactElement<any>;
  defaultLayout: 'top' | 'side';
  defaultDrawerOpen?: boolean;
  defaultShowQuickSearch?: boolean;
  defaultAutoHideAppbar?: boolean;
  defaultShowBreadcrumbs?: boolean;
  defaultBreadcrumbsOpen?: boolean;
  breadcrumbsPlacement?: 'topbar' | 'page';
  topnav: {
    apps?: AppElement[];
    userMenu?: UserMenuElement[];
    userMenuTitle?: string;
    adminMenu?: UserMenuElement[];
    adminMenuTitle?: string;
    quickSearchURI?: string;
    quickSearchParam?: string;
    themeSelectionUnder: 'profile' | 'icon';
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
  leftnav: {
    elements: LeftNavElement[];
    hideNestedIcons?: boolean;
  };
}

interface LayoutProviderProps extends AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayoutContext = React.createContext<AppLayoutContextProps>(null);

function AppLayoutProvider(props: LayoutProviderProps) {
  const { children, ...layoutProps } = props;
  const muiTheme = useTheme();
  const { isReady: isUserReady } = useAppUser();

  // Load Initial Layout Default
  let initialLayout;
  const storedNavLayout = localStorage.getItem('navLayout');
  if (storedNavLayout && storedNavLayout === 'top') {
    initialLayout = 'top' as 'top';
  } else if (storedNavLayout && storedNavLayout === 'side') {
    initialLayout = 'side' as 'side';
  } else {
    initialLayout = layoutProps.defaultLayout;
  }

  // Load Nav Drawer Default State
  const storedDrawer = localStorage.getItem('drawerOpen');
  const initialDrawer = storedDrawer ? !!JSON.parse(storedDrawer) : layoutProps.defaultDrawerOpen;

  // Load Quick Search Default State
  const storedQuickSearch = localStorage.getItem('showQuickSearch');
  const initialQuickSearch = storedQuickSearch ? !!JSON.parse(storedQuickSearch) : layoutProps.defaultShowQuickSearch;

  // Load Auto hide Topbar default state
  const storedAutoHideAppbar = localStorage.getItem('autoHideAppbar');
  const initialAutoHideAppbar = storedAutoHideAppbar
    ? !!JSON.parse(storedAutoHideAppbar)
    : layoutProps.defaultAutoHideAppbar;

  // Load Breadcrumbs Default State
  const storedShowBreadcrumbs = localStorage.getItem('breadcrumbsEnabled');
  const initialBreadcrumbsEnabled = storedShowBreadcrumbs
    ? !!JSON.parse(storedShowBreadcrumbs)
    : layoutProps.defaultShowBreadcrumbs;

  // Load Breadcrumbs Default Expanded/Minimize State
  const storedBreadcrumbs = localStorage.getItem('breadcrumbsState');
  const initialBreadcrumbsState = storedBreadcrumbs
    ? !!JSON.parse(storedBreadcrumbs)
    : layoutProps.defaultBreadcrumbsOpen;

  // Breadcrumb placement.
  const breadcrumbsPlacement = layoutProps.breadcrumbsPlacement ? layoutProps.breadcrumbsPlacement : 'topbar';

  // Hooks...
  const [appReady, setAppReady] = useState<boolean>(false);
  const [showMenus, setShowMenus] = useState<boolean>(true);
  const [drawer, setDrawer] = useState<boolean>(initialDrawer);
  const [breadcrumbsEnabled, setBreadcrumbsEnabled] = useState<boolean>(initialBreadcrumbsEnabled);
  const [breadcrumbsState, setBreadcrumbsState] = useState<boolean>(initialBreadcrumbsState);
  const [quickSearch, setQuickSearch] = useState<boolean>(initialQuickSearch);
  const [autoHideAppbar, setAutoHideAppbar] = useState<boolean>(initialAutoHideAppbar);
  const [layout, setLayout] = useState<'top' | 'side'>(initialLayout);
  const classes = useStyles(layout, isUserReady() && appReady && showMenus);
  const showBreadcrumbsOnPage =
    useMediaQuery(muiTheme.breakpoints.only('sm')) &&
    layoutProps.allowQuickSearch &&
    quickSearch &&
    isUserReady() &&
    appReady &&
    showMenus;

  const onToggleLayout = () => {
    const newLayout = layout === 'top' ? 'side' : 'top';
    localStorage.setItem('navLayout', newLayout);
    setLayout(newLayout);
  };

  const onToggleDrawer = () => {
    localStorage.setItem('drawerOpen', JSON.stringify(!drawer));
    setDrawer(!drawer);
  };

  const onToggleQuickSearch = () => {
    localStorage.setItem('showQuickSearch', JSON.stringify(!quickSearch));
    setQuickSearch(!quickSearch);
  };

  const onToggleAutoHideAppbar = () => {
    localStorage.setItem('autoHideAppbar', JSON.stringify(!autoHideAppbar));
    setAutoHideAppbar(!autoHideAppbar);
  };

  const onToggleShowBreadcrumbs = () => {
    localStorage.setItem('breadcrumbsEnabled', JSON.stringify(!breadcrumbsEnabled));
    setBreadcrumbsEnabled(!breadcrumbsEnabled);
  };

  const onToggleBreadcrumbsState = () => {
    localStorage.setItem('breadcrumbsState', JSON.stringify(!breadcrumbsState));
    setBreadcrumbsState(!breadcrumbsState);
  };

  return (
    <AppLayoutContext.Provider
      value={{
        autoHideAppbar,
        currentLayout: layout,
        drawerState: drawer,
        breadcrumbsEnabled,
        breadcrumbsState,
        breadcrumbsPlacement: layoutProps.breadcrumbsPlacement ? layoutProps.breadcrumbsPlacement : 'topbar',
        hideNestedIcons: !!layoutProps.leftnav.hideNestedIcons,
        layoutProps: {
          allowAutoHideTopbar: true,
          allowBreadcrumbs: true,
          allowBreadcrumbsMinimize: true,
          allowQuickSearch: true,
          allowReset: true,
          allowTopbarModeSelection: true,
          allowThemeSelection: true,
          allowTranslate: true,
          ...layoutProps
        },
        showQuickSearch: quickSearch,
        getBanner: curTheme => {
          return curTheme.palette.type === 'dark' ? layoutProps.bannerDark : layoutProps.bannerLight;
        },
        getLogo: curTheme => {
          return curTheme.palette.type === 'dark' ? layoutProps.appIconDark : layoutProps.appIconLight;
        },
        hideMenus: () => setShowMenus(false),
        toggleLayout: onToggleLayout,
        toggleDrawer: onToggleDrawer,
        toggleQuickSearch: onToggleQuickSearch,
        toggleAutoHideAppbar: onToggleAutoHideAppbar,
        toggleShowBreadcrumbs: onToggleShowBreadcrumbs,
        toggleBreadcrumbsState: onToggleBreadcrumbsState,
        isReady: () => appReady,
        setReady: (isReady: boolean) => setAppReady(isReady)
      }}
    >
      <div className={classes.app}>
        <CssBaseline />
        {isUserReady() && appReady && showMenus && <TopBar />}
        {isUserReady() && appReady && showMenus && <LeftNavDrawer />}
        <div className={classes.container}>
          {layoutProps.allowBreadcrumbs &&
            breadcrumbsEnabled &&
            (breadcrumbsPlacement === 'page' || showBreadcrumbsOnPage) && (
              <div className="no-print">
                <PageHeader mode="breadcrumbs" />
              </div>
            )}
          {children}
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
}

export default AppLayoutProvider;
