import React, { useState } from "react";
import { CssBaseline, makeStyles, ThemeProvider, useMediaQuery, Box, useTheme } from "@material-ui/core";
import useAppTheme, { AppThemeColorProps } from "commons/components/hooks/useAppTheme";
import LeftNavDrawer, { LeftNavElement } from "commons/components/layout/leftnav/LeftNavDrawer";
import TopBar from "commons/components/layout/topnav/TopBar";
import { AppElement } from "commons/components/layout/topnav/AppSwitcher";
import { UserMenuElement, UserProfileProps } from "commons/components/layout/topnav/UserProfile";
import PageHeader from "commons/components/layout/pages/PageHeader";

const useStyles = (layout) => {
  return makeStyles((theme) => ({
    app: {
      // display: "block",
      [theme.breakpoints.up("md")]: {
        // There are issues with display flex that propagate to other components.
        // If we are not able to fix them we should consider using block but
        //   calculating the padding depending on the menu state
        display: "flex",
      },
    },
    container: {
      display: "block",
      paddingTop: layout === "top" ? theme.spacing(9) : theme.spacing(8),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      [theme.breakpoints.only("sm")]: {
        paddingLeft: theme.spacing(10),
      },
      [theme.breakpoints.up("md")]: {
        flexGrow: 1,
      },
    }
  }))()
};


export type AppLayoutProps = {
  appName: string,
  allowBreadcrumbs?: boolean,
  allowGravatar?: boolean,
  allowQuickSearch?: boolean,
  allowReset?: boolean,
  appIconDark: React.ReactElement<any>,
  appIconLight: React.ReactElement<any>,
  bannerDark: React.ReactElement<any>,
  bannerLight: React.ReactElement<any>,
  colors: AppThemeColorProps,
  defaultTheme: "dark" | "light",
  defaultLayout: "top" | "side",
  defaultDrawerOpen?: boolean,
  defaultShowQuickSearch?: boolean,
  defaultAutoHideAppbar?: boolean,
  defaultShowBreadcrumbs?: boolean,
  defaultBreadcrumbsOpen?: boolean,
  breadcrumbsPlacement?: "topbar" | "page",
  topnav: {
    apps?: AppElement[],
    userMenu?: UserMenuElement[],
    userMenuTitle?: string,
    adminMenu?: UserMenuElement[],
    adminMenuTitle?: string,
    quickSearchURI?: string,
    quickSearchParam?: string,
    themeSelectionUnder: "profile" | "icon"
  },
  leftnav: {
    elements: LeftNavElement[];
  },
  userReady: (user) => boolean
};

export type AppLayoutContextProps = {
  autoHideAppbar: boolean,
  currentLayout: string,
  currentUser: UserProfileProps | null,
  drawerState: boolean,
  breadcrumbsEnabled: boolean,
  breadcrumbsState: boolean,
  breadcrumbsPlacement: string,
  layoutProps: AppLayoutProps,
  showQuickSearch: boolean,
  getBanner: (theme) => React.ReactElement<any>,
  getLogo: (theme)  => React.ReactElement<any>,
  hideMenus: () => void,
  setCurrentUser: (user: UserProfileProps) => void,
  toggleLayout: () => void,
  toggleTheme: () => void,
  toggleDrawer: () => void,
  toggleQuickSearch: () => void,
  toggleAutoHideAppbar: () => void,
  toggleShowBreadcrumbs: () => void,
  toggleBreadcrumbsState: () => void,
}

export const AppLayoutContext = React.createContext<AppLayoutContextProps>(null);


type LayoutProviderProps = {
  children: React.ReactNode,
  value: AppLayoutProps,
  user: UserProfileProps | null;
};


function AppLayoutProvider(props: LayoutProviderProps) {
  // Load DarkMode defaults
  let initialTheme;
  const muiTheme = useTheme();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const storedDarkMode = localStorage.getItem("darkMode");
  const darkMode = storedDarkMode ? !!JSON.parse(storedDarkMode) : null;

  if (darkMode !== null && darkMode === true){
    initialTheme = "dark" as "dark";
  }
  else if (darkMode !== null && darkMode === false){
    initialTheme = "light" as "light";
  }
  else if (prefersDarkMode){
    initialTheme = "dark" as "dark";
  }
  else {
    initialTheme = props.value.defaultTheme;
  }

  // Load Initial Layout Default
  let initialLayout;
  const storedNavLayout = localStorage.getItem('navLayout');
  if (storedNavLayout && storedNavLayout === 'top'){
    initialLayout = 'top' as 'top';
  }
  else if (storedNavLayout && storedNavLayout === 'side'){
    initialLayout = 'side' as 'side';
  }
  else{
    initialLayout = props.value.defaultLayout;
  }

  // Load Nav Drawer Default State
  let initialDrawer;
  const storedDrawer = localStorage.getItem('drawerOpen');
  initialDrawer = storedDrawer ? !!JSON.parse(storedDrawer) : props.value.defaultDrawerOpen;

  // Load Quick Search Default State
  let initialQuickSearch;
  const storedQuickSearch = localStorage.getItem('showQuickSearch');
  initialQuickSearch = storedQuickSearch ? !!JSON.parse(storedQuickSearch) : props.value.defaultShowQuickSearch;

  // Load Auto hide Topbar default state
  let initialAutoHideAppbar;
  const storedAutoHideAppbar = localStorage.getItem('autoHideAppbar');
  initialAutoHideAppbar = storedAutoHideAppbar ? !!JSON.parse(storedAutoHideAppbar) : props.value.defaultAutoHideAppbar;

  // Load Breadcrumbs Default State
  let initialBreadcrumbsEnabled;
  const storedShowBreadcrumbs = localStorage.getItem('breadcrumbsEnabled');
  initialBreadcrumbsEnabled = storedShowBreadcrumbs ? !!JSON.parse(storedShowBreadcrumbs) : props.value.defaultShowBreadcrumbs;


  // Load Breadcrumbs Default Expanded/Minimize State
  let initialBreadcrumbsState;
  const storedBreadcrumbs = localStorage.getItem('breadcrumbsState');
  initialBreadcrumbsState = storedBreadcrumbs ? !!JSON.parse(storedBreadcrumbs) : props.value.defaultBreadcrumbsOpen;

  // Breadcrumb placement.
  const breadcrumbsPlacement = props.value.breadcrumbsPlacement ? props.value.breadcrumbsPlacement : "topbar"  


  const [showMenus, setShowMenus] = useState<boolean>(true)
  const [theme, setTheme] = useState<string>(initialTheme)
  const [drawer, setDrawer] = useState<boolean>(initialDrawer)
  const [breadcrumbsEnabled, setBreadcrumbsEnabled] = useState<boolean>(initialBreadcrumbsEnabled)
  const [breadcrumbsState, setBreadcrumbsState] = useState<boolean>(initialBreadcrumbsState)
  const [quickSearch, setQuickSearch] = useState<boolean>(initialQuickSearch)
  const [autoHideAppbar, setAutoHideAppbar] = useState<boolean>(initialAutoHideAppbar)
  const [layout, setLayout] = useState<"top"| "side">(initialLayout)
  const [appTheme] = useAppTheme(theme === "dark", props.value.colors);
  const classes = useStyles(layout);
  const showBreadcrumbsOnPage = useMediaQuery(muiTheme.breakpoints.only("sm")) && props.value.allowQuickSearch && quickSearch


  const setCurrentUser = (user: UserProfileProps) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  const onToggleLayout = () => {
    const newLayout = layout === "top" ? "side" : "top"
    localStorage.setItem('navLayout', newLayout);
    setLayout(newLayout)
  }

  const onToggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    localStorage.setItem('darkMode', JSON.stringify(newTheme === 'dark'));
    setTheme(newTheme)
  }

  const onToggleDrawer = () => {
    localStorage.setItem("drawerOpen", JSON.stringify(!drawer));
    setDrawer(!drawer)
  }

  const onToggleQuickSearch = () => {
    localStorage.setItem("showQuickSearch", JSON.stringify(!quickSearch));
    setQuickSearch(!quickSearch)
  }

  const onToggleAutoHideAppbar = () => {
    localStorage.setItem("autoHideAppbar", JSON.stringify(!autoHideAppbar));
    setAutoHideAppbar(!autoHideAppbar)
  }

  const onToggleShowBreadcrumbs = () => {
    localStorage.setItem("breadcrumbsEnabled", JSON.stringify(!breadcrumbsEnabled));
    setBreadcrumbsEnabled(!breadcrumbsEnabled)
  }

  const onToggleBreadcrumbsState = () => {
    localStorage.setItem("breadcrumbsState", JSON.stringify(!breadcrumbsState));
    setBreadcrumbsState(!breadcrumbsState)
  }

  return (
    <ThemeProvider theme={appTheme}>
      <AppLayoutContext.Provider value={{
        autoHideAppbar: autoHideAppbar,
        currentLayout: layout,
        currentUser: props.user,
        drawerState: drawer,
        breadcrumbsEnabled,
        breadcrumbsState,
        breadcrumbsPlacement: props.value.breadcrumbsPlacement ? props.value.breadcrumbsPlacement : "topbar",
        layoutProps: props.value,
        showQuickSearch: quickSearch,
        getBanner: (theme) => {
          return theme.palette.type === "dark" ? props.value.bannerDark : props.value.bannerLight
        },
        getLogo: (theme) => {
          return theme.palette.type === "dark" ? props.value.appIconDark : props.value.appIconLight
        },
        hideMenus: () => setShowMenus(false),
        setCurrentUser: setCurrentUser,
        toggleLayout: onToggleLayout,
        toggleTheme: onToggleTheme,
        toggleDrawer: onToggleDrawer,
        toggleQuickSearch: onToggleQuickSearch,
        toggleAutoHideAppbar: onToggleAutoHideAppbar,
        toggleShowBreadcrumbs: onToggleShowBreadcrumbs,
        toggleBreadcrumbsState: onToggleBreadcrumbsState,
      }}>
        <Box className={classes.app}>
          <CssBaseline />
          {props.value.userReady(props.user) && showMenus ? <TopBar/> : null}
          {props.value.userReady(props.user) && showMenus ? <LeftNavDrawer/>: null}
          <Box className={classes.container}>
            {props.value.allowBreadcrumbs && breadcrumbsEnabled && (breadcrumbsPlacement === "page" || showBreadcrumbsOnPage) ? <PageHeader mode="breadcrumbs" /> : null}
            {props.children}
          </Box>
        </Box>
      </AppLayoutContext.Provider>
    </ThemeProvider>
  );
}

export default AppLayoutProvider;
