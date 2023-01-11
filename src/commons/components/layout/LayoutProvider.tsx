import { CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/hooks/useAppUser';
import LeftNavDrawer, { LeftNavElement } from 'commons/components/layout/leftnav/LeftNavDrawer';
import { AppElement } from 'commons/components/layout/topnav/AppSwitcher';
import TopBar from 'commons/components/layout/topnav/TopBar';
import { UserMenuElement } from 'commons/components/layout/topnav/UserProfile';
import React, { useState } from 'react';

const useNewStyles = makeStyles(theme => ({
  appVertical: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative'
  },
  appVerticalLeft: {
    height: '100%',
    [theme.breakpoints.down('xl')]: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0
    }
  },
  appVerticalRight: {
    '@media print': {
      overflow: 'unset !important'
    },
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
    height: '100%',
    width: '100%'
  },
  appVerticalRightContent: {
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  appHorizontal: {
    '@media print': {
      overflow: 'unset !important'
    },
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
}));

export type AppLayoutContextProps = {
  autoHideAppbar: boolean;
  appbarState: boolean;
  currentLayout: string;
  drawerState: boolean;
  breadcrumbsEnabled: boolean;
  breadcrumbsState: boolean;
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
  setAppbarState: (show: boolean) => void;
  setApps: (apps: AppElement[]) => void;
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
  topnav: {
    apps?: AppElement[];
    userMenu?: UserMenuElement[];
    userMenuTitle?: string;
    userMenuType?: 'icon' | 'list';
    adminMenu?: UserMenuElement[];
    adminMenuTitle?: string;
    quickSearchURI?: string;
    quickSearchParam?: string;
    themeSelectionUnder?: 'profile' | 'icon';
    left?: React.ReactNode;
    leftAfterBreadcrumbs?: React.ReactNode;
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

  // Hooks...
  const [appReady, setAppReady] = useState<boolean>(false);
  const [showMenus, setShowMenus] = useState<boolean>(true);
  const [drawer, setDrawer] = useState<boolean>(initialDrawer);
  const [appbarState, setAppbarState] = useState<boolean>(true);
  const [breadcrumbsEnabled, setBreadcrumbsEnabled] = useState<boolean>(initialBreadcrumbsEnabled);
  const [breadcrumbsState, setBreadcrumbsState] = useState<boolean>(initialBreadcrumbsState);
  const [quickSearch, setQuickSearch] = useState<boolean>(initialQuickSearch);
  const [autoHideAppbar, setAutoHideAppbar] = useState<boolean>(initialAutoHideAppbar);
  const [layout, setLayout] = useState<'top' | 'side'>(initialLayout);
  const [apps, setApps] = useState<AppElement[]>(layoutProps.topnav.apps || []);
  const theme = useTheme();
  const isSM = useMediaQuery(theme.breakpoints.only('sm'));
  const isPrinting = useMediaQuery('print');

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

  const newClasses = useNewStyles();

  return (
    <AppLayoutContext.Provider
      value={{
        autoHideAppbar,
        appbarState,
        currentLayout: layout,
        drawerState: drawer,
        breadcrumbsEnabled,
        breadcrumbsState,
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
        getBanner: curTheme => (curTheme.palette.mode === 'dark' ? layoutProps.bannerDark : layoutProps.bannerLight),
        getLogo: curTheme => (curTheme.palette.mode === 'dark' ? layoutProps.appIconDark : layoutProps.appIconLight),
        hideMenus: () => setShowMenus(false),
        toggleLayout: onToggleLayout,
        toggleDrawer: onToggleDrawer,
        toggleQuickSearch: onToggleQuickSearch,
        toggleAutoHideAppbar: onToggleAutoHideAppbar,
        toggleShowBreadcrumbs: onToggleShowBreadcrumbs,
        toggleBreadcrumbsState: onToggleBreadcrumbsState,
        isReady: () => appReady,
        setReady: (isReady: boolean) => setAppReady(isReady),
        setAppbarState,
        setApps
      }}
    >
      <>
        <CssBaseline />
        {layout === 'side' ? (
          <div className={newClasses.appVertical}>
            <div className={newClasses.appVerticalLeft}>
              {isUserReady() && appReady && showMenus && <LeftNavDrawer />}
            </div>
            <div
              id="app-scrollct"
              className={newClasses.appVerticalRight}
              style={{ overflow: 'auto', paddingLeft: showMenus && isSM && !isPrinting ? theme.spacing(7) : 0 }}
            >
              {isUserReady() && appReady && showMenus && <TopBar apps={apps} />}
              {children}
            </div>
          </div>
        ) : (
          <div id="app-scrollct" className={newClasses.appHorizontal} style={{ overflow: 'auto' }}>
            {isUserReady() && appReady && showMenus && <TopBar apps={apps} />}
            <div className={newClasses.appVertical}>
              <div className={newClasses.appVerticalLeft}>
                {isUserReady() && appReady && showMenus && <LeftNavDrawer />}
              </div>
              <div
                className={newClasses.appVerticalRight}
                style={{ paddingLeft: showMenus && isSM && !isPrinting ? theme.spacing(7) : 0 }}
              >
                {children}
              </div>
            </div>
          </div>
        )}
      </>
    </AppLayoutContext.Provider>
  );
}

export default AppLayoutProvider;
