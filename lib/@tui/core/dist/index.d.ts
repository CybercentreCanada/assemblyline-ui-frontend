import * as react0 from "react";
import { CSSProperties, ComponentType, Dispatch, FC, HTMLAttributeAnchorTarget, KeyboardEvent, MouseEvent, PropsWithChildren, ReactElement, ReactNode, Ref, RefObject, SetStateAction, SyntheticEvent } from "react";
import "zustand";
import { i18n } from "i18next";
import * as react_jsx_runtime0 from "react/jsx-runtime";
import * as _mui_material0 from "@mui/material";
import { AvatarProps, BoxProps, ButtonProps, IconButtonProps, PaletteMode, PaperProps, StackProps, Theme, ThemeOptions, colors } from "@mui/material";
import "@mui/material/styles";

//#region src/commands/index.d.ts
type AppCommand = AppCommandRoute | AppCommandAction;
type AppCommandBase = {
  id: string | number;
  type: 'route' | 'action';
  icon?: ReactElement;
  primary?: string;
  primaryI18nKey?: string;
  secondary?: string;
  secondaryI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
};
type AppCommandRoute = AppCommandBase & {
  type: 'route';
  route: string;
  matcher?: RegExp;
};
type AppCommandAction = AppCommandBase & {
  type: 'action';
  onClick: (event: MouseEvent<HTMLElement>) => void;
};
//#endregion
//#region src/breadcrumbs/index.d.ts
type AppHistoryRoute = {
  route: string;
  path: string;
};
type AppBreadcrumbItem = {
  route: string;
  path: string;
  title?: string;
  i18nKey?: string;
  icon?: ReactElement;
  width?: number;
  missing?: boolean;
  text?: boolean;
  includeRoot?: boolean;
};
//#endregion
//#region src/router/index.d.ts
type AppRouterLocation = {
  pathname: string;
  search: string;
  hash: string;
};
type AppRouterAdapter = {
  Link: ComponentType<{
    to: string;
    children?: ReactNode;
    className?: string;
    target?: string;
    style?: CSSProperties;
    ref?: Ref<HTMLAnchorElement>;
    onClick?: (event: MouseEvent) => void;
  }>;
  location: AppRouterLocation;
  navigate: (to: string) => void;
  matchPath: (pattern: {
    path: string;
    end?: boolean;
  }, pathname: string) => boolean;
  breadcrumbs: (location?: AppRouterLocation) => AppBreadcrumbItem[];
};
//#endregion
//#region src/search/AppSearchService.d.ts
type AppSearchMode = 'inline' | 'fullscreen';
type AppSearchItem<T = any> = {
  id: string | number;
  item: T;
};
type AppSearchItemRendererOption<T = any> = {
  state: AppSearchServiceState<T>;
  index: number;
  last: boolean;
};
type AppSearchService<T = any> = {
  onMounted?: (setValue?: (value: string) => void, state?: AppSearchServiceState<T>) => void;
  onEnter?: (value: string, state?: AppSearchServiceState<T>, setValue?: (value: string) => void) => void;
  onChange?: (value: string, state: AppSearchServiceState<T>, setValue?: (value: string) => void) => void;
  onItemSelect?: (item: AppSearchItem<T>, state?: AppSearchServiceState<T>) => void;
  itemRenderer: (item: AppSearchItem<T>, options?: AppSearchItemRendererOption<T>) => ReactElement;
};
//#endregion
//#region src/app/AppContexts.d.ts
type AppContextBase = {
  initialized: boolean;
};
type AppQuickSearchContextType = AppContextBase & {
  show: boolean;
  setShow: (show: boolean) => void;
  toggle: () => void;
};
type AppSearchServiceContextType<T = any> = AppContextBase & {
  provided: boolean;
  service: AppSearchService<T>;
  state: AppSearchServiceState<T>;
};
type AppLeftNavContextType = AppContextBase & {
  menus: LeftNavMenuProps[];
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  toggleMenu: (menuId: string | number) => void;
  closeMenu: (menuId: string | number) => void;
  openMenu: (menuId: string | number) => void;
  updateMenu: (menuId: string | number, updater: (current: LeftNavMenuProps) => LeftNavMenuProps) => void;
  collapseMenus: () => void;
  expandMenus: () => void;
  setMenus: Dispatch<SetStateAction<LeftNavMenuProps[]>>;
};
type AppLayoutContextType = AppContextBase & {
  ready: boolean;
  current: AppLayoutMode;
  mode: AppLayoutMode | 'focus';
  toggle: () => void;
  setReady: Dispatch<SetStateAction<boolean>>;
  setFocus: Dispatch<SetStateAction<boolean>>;
  hideMenus: () => void;
  showMenus: () => void;
};
type AppBarContextType = AppContextBase & {
  show: boolean;
  autoHide: boolean;
  setShow: (show: boolean) => void;
  setAutoHide: (autoHide: boolean) => void;
  toggleAutoHide: () => void;
};
type AppBreadcrumbsContextType = AppContextBase & {
  show: boolean;
  items: any[];
  setItems: Dispatch<SetStateAction<any[]>>;
  toggle: () => void;
  history: AppHistoryRoute[];
};
type AppSearchServiceState<T = any> = {
  searching: boolean;
  menu: boolean;
  mode: AppSearchMode;
  items: AppSearchItem<T>[];
  set: (state: AppSearchServiceState<T>) => void;
};
//#endregion
//#region src/user/index.d.ts
type AppUserValidatedProp = {
  prop: string;
  value: any;
};
type AppUser = {
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  is_admin?: boolean;
};
type AppUserService<T extends AppUser> = {
  user: T;
  setUser: (user: T) => void;
  isReady: () => boolean;
  validateProps?: (props: AppUserValidatedProp[]) => boolean;
};
type AppUserContextType<T extends AppUser> = AppContextBase & AppUserService<T>;
declare const AppUserContext: react0.Context<AppUserContextType<AppUser>>;
//#endregion
//#region src/leftnav/v2/LeftNavAction.d.ts
declare const LeftNavAction: FC<LeftNavActionProps & LeftNavChildRenderProps & {
  disableCollapse?: boolean;
}>;
//#endregion
//#region src/leftnav/v2/LeftNavItem.d.ts
declare const LeftNavItem: FC<LeftNavItemProps & LeftNavChildRenderProps>;
//#endregion
//#region src/leftnav/v2/LeftNavRoute.d.ts
declare const LeftNavRoute: FC<LeftNavRouteProps & LeftNavChildRenderProps>;
//#endregion
//#region src/leftnav/v2/hooks/usePathMatcher.d.ts
declare const usePathMatcher: () => (path: string, configs?: {
  matcher?: RegExp;
  matchEnd?: boolean;
}) => boolean;
//#endregion
//#region src/leftnav/v2/index.d.ts
type LeftNavMenuItem = LeftNavMenuProps | LeftNavRouteProps | LeftNavActionProps | LeftNavSlotProps;
type LeftNavChildRenderProps = PropsWithChildren & {
  level: number;
  context: 'accordion' | 'popper';
  active?: boolean;
  activeParent?: boolean;
};
type LeftNavChildProps = {
  id: string | number;
  validators?: AppUserValidatedProp[];
};
type LeftNavItemProps = LeftNavChildProps & {
  label?: string;
  i18nKey?: string;
  icon?: ReactElement<any>;
  tooltipI18nKey?: string;
};
type LeftNavMenuProps = LeftNavItemProps & {
  type: 'menu';
  route?: string;
  matcher?: RegExp;
  expanded?: boolean;
  popped?: boolean;
  keepMounted?: boolean;
  items: LeftNavMenuItem[];
};
type LeftNavSlotProps = LeftNavChildProps & {
  type: 'slot';
  withProps?: boolean;
  component?: FC<any>;
  render?: (navopen: boolean, props?: LeftNavChildRenderProps) => ReactElement;
};
type LeftNavRouteProps = LeftNavItemProps & {
  type: 'route';
  route: string;
  matcher?: RegExp;
  target?: HTMLAttributeAnchorTarget;
};
type LeftNavActionProps = LeftNavItemProps & {
  type: 'action';
  action: (event: SyntheticEvent<HTMLElement>, props?: Omit<LeftNavActionProps, 'type'>) => void;
};
declare const traverse: (menu: LeftNavMenuProps, action: (props: LeftNavMenuItem, agg: any) => void, agg: any) => any;
declare const visit: (items: LeftNavMenuItem[], accept: (props: LeftNavMenuItem) => boolean, action: (props: LeftNavMenuItem) => LeftNavMenuItem) => LeftNavMenuItem[];
//#endregion
//#region src/topnav/index.d.ts
type AppBarUserMenuElement = {
  i18nKey?: string;
  title?: string;
  route?: string;
  icon?: ReactElement<any>;
  element?: ReactElement<any>;
};
//#endregion
//#region src/app/hooks/useAppBar.d.ts
declare function useAppBar(): AppBarContextType;
//#endregion
//#region src/app/hooks/useAppBarHeight.d.ts
declare const APPBAR_READY_EVENT = "tui.event.appbar.ready";
declare function useAppBarHeight(): number;
//#endregion
//#region src/app/hooks/useAppBarScrollTrigger.d.ts
declare function useAppBarScrollTrigger(): boolean;
//#endregion
//#region src/app/hooks/useAppBrand.d.ts
declare const BRAND_VARIANTS: readonly ["app", "logo", "name", "banner-vertical", "banner-horizontal"];
type BrandVariant = (typeof BRAND_VARIANTS)[number];
type BrandSize = 'app' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
type AppBrandProps = {
  variant: BrandVariant;
  size?: BrandSize;
  config: AppBrandConfig;
  sizes: BrandSizeSpecs;
};
type BrandSizeSpecs = {
  divider: {
    margin: string;
  };
  name: {
    height: string;
  };
  icon: {
    width: string;
    height: string;
  };
  text: {
    fontSize: string;
  };
};
declare const getBrandSizes: (theme: Theme, size: BrandSize) => BrandSizeSpecs;
declare const useAppBrand: (props?: {
  variant?: BrandVariant;
  size?: BrandSize;
}) => {
  brand: AppBrandConfig;
  variant: "app" | "logo" | "name" | "banner-vertical" | "banner-horizontal";
  size: BrandSize;
  sizes: BrandSizeSpecs;
};
//#endregion
//#region src/app/hooks/useAppBreadcrumbs.d.ts
declare const useAppBreadcrumbs: () => AppBreadcrumbsContextType;
//#endregion
//#region src/app/hooks/useAppDensity.d.ts
declare const useAppDensity: () => {
  density: AppDensityMode;
  setDensity: (density: AppDensityMode) => void;
};
//#endregion
//#region src/app/hooks/useAppLanguage.d.ts
type UseAppLanguageType = {
  isFR: () => boolean;
  isEN: () => boolean;
  toggle: () => void;
};
declare const useAppLanguage: (onChange?: (language: "en" | "fr") => void) => UseAppLanguageType;
//#endregion
//#region src/app/hooks/useAppLayout.d.ts
declare const useAppLayout: () => AppLayoutContextType;
//#endregion
//#region src/app/hooks/useAppLeftNav.d.ts
declare const useAppLeftNav: () => AppLeftNavContextType;
//#endregion
//#region src/app/hooks/useAppLogo.d.ts
declare const useAppLogo: () => string | undefined;
//#endregion
//#region src/app/hooks/useAppPreferences.d.ts
declare const useAppPreferences: () => AppPreferenceConfigs;
//#endregion
//#region src/app/hooks/useAppQuickSearch.d.ts
declare const useAppQuickSearch: () => AppQuickSearchContextType;
//#endregion
//#region src/app/hooks/useAppRouter.d.ts
declare const useAppRouter: () => AppRouterAdapter;
//#endregion
//#region src/app/hooks/useAppSearchService.d.ts
declare const useAppSearchService: <T = any>() => AppSearchServiceContextType<T>;
//#endregion
//#region src/themes/hooks/useAppThemeBuilder.d.ts
/**
 * Additional positional arguments forwarded to MUI's `createTheme(options, ...args)`.
 *
 * Typically used to pass MUI locale packs (e.g. `frFR` from `@mui/material/locale`,
 * `@mui/x-data-grid/locales`, `@mui/x-date-pickers/locales`) so component
 * `defaultProps` localized strings are merged into the resulting theme.
 */
type AppThemeLocalization = object[];
/**
 * Returns a memoized builder that produces a paired light/dark MUI `Theme` for the
 * application.
 *
 * The builder deep-merges configuration in the following precedence (lowest to highest):
 * 1. {@link BASE_THEME_CONFIG} — TUI baseline.
 * 2. Density overrides resolved from `density` via `getDensityThemeOverrides`.
 * 3. `theme.configs.global` — theme-level options shared across modes.
 * 4. `optionsOverride.global` — caller-supplied global overrides.
 * 5. `theme.configs.light` / `theme.configs.dark` — mode-specific options.
 * 6. `optionsOverride.light` / `optionsOverride.dark` — caller-supplied mode overrides.
 *
 * The merged options are then passed to `createTheme(options, ...localization)`, where
 * `localization` forwards MUI locale packs (see {@link AppThemeLocalization}) so component
 * `defaultProps` translated strings are applied.
 *
 * All inputs are deep-cloned before merging to prevent mutation of caller-owned config
 * objects across renders.
 *
 * @returns A stable callback `(theme, optionsOverride, density?, localization?) => { lightTheme, darkTheme }`.
 */
declare const useAppThemeBuilder: () => (theme: AppTheme, optionsOverride: Partial<AppThemeConfigs>, density?: AppDensityMode, localization?: AppThemeLocalization) => {
  lightTheme: _mui_material0.Theme;
  darkTheme: _mui_material0.Theme;
};
//#endregion
//#region src/app/providers/AppThemesProvider.d.ts
type TuiThemesContextType = AppContextBase & {
  current: AppTheme;
  mode: PaletteMode;
  themes?: AppTheme[];
  optionsOverride: Partial<AppThemeConfigs>;
  setTheme: (id: string) => void;
  setOptionsOverride: Dispatch<SetStateAction<AppThemeConfigs>>;
  toggleMode: () => void;
};
type TuiThemesProviderProps = PropsWithChildren & {
  initTheme?: AppTheme;
  themes: AppTheme[];
  localization?: AppThemeLocalization;
};
declare const AppThemesProvider: FC<TuiThemesProviderProps>;
//#endregion
//#region src/app/hooks/useAppTheme.d.ts
type UseAppThemeType = TuiThemesContextType & {
  isDark: boolean;
  isLight: boolean;
};
declare const useAppTheme: () => UseAppThemeType;
//#endregion
//#region src/app/hooks/useAppUser.d.ts
declare const useAppUser: <U extends AppUser>() => AppUserContextType<U>;
//#endregion
//#region src/app/AppConfigs.d.ts
type AppBrandConfig = {
  application: string;
  appName?: string;
  logo: {
    dark: string;
    light: string;
  };
  name?: {
    dark?: string;
    light?: string;
  };
  component?: FC<AppBrandProps>;
};
type AppPreferenceConfigs = {
  brand?: AppBrandConfig;
  appLink?: string;
  allowAutoHideTopbar?: boolean;
  allowBreadcrumbs?: boolean;
  allowQuickSearch?: boolean;
  allowReset?: boolean;
  allowLayoutSelection?: boolean;
  allowThemeSelection?: boolean;
  allowTranslate?: boolean;
  allowFocusMode?: boolean;
  allowPersonalization?: boolean;
  allowDensitySelection?: boolean;
  topnav?: AppTopNavConfigs;
  leftnav?: AppLeftNavConfigs;
  commands?: AppCommand[];
  slots?: {
    layout?: FC<PropsWithChildren>;
  };
};
type AppTheme = {
  id: string;
  configs: AppThemeConfigs;
  i18nKey: string;
  default?: boolean;
};
type AppThemeConfigs = {
  global?: Partial<ThemeOptions>;
  light?: Partial<ThemeOptions>;
  dark?: Partial<ThemeOptions>;
};
type AppTopNavConfigs = {
  themeSelectionMode?: AppThemeSelectionMode;
  quickSearchURI?: string;
  quickSearchParam?: string;
  quickSearchIconOnly?: boolean;
  hideUserAvatar?: boolean;
  slots?: {
    left?: ReactElement[];
    right?: ReactElement[];
    breadcrumbs?: {
      left?: ReactElement[];
      right?: ReactElement[];
    };
    search?: {
      left?: ReactElement[];
      right?: ReactElement[];
    };
  };
  profile?: {
    slots?: {
      top?: ReactElement[];
      bottom?: ReactElement[];
      userMenu?: {
        before?: ReactElement[];
        after?: ReactElement[];
      };
      admin?: {
        before?: ReactElement[];
        after?: ReactElement[];
      };
    };
    menus?: {
      user?: {
        i18nKey?: string;
        title?: string;
        slot?: AppBarUserMenuElement[];
      };
      admin?: {
        i18nKey?: string;
        title?: string;
        slot?: AppBarUserMenuElement[];
      };
    };
  };
};
type AppLeftNavConfigs = {
  menus?: LeftNavMenuProps[];
  width?: number | string;
};
type AppLayoutMode = 'side' | 'top';
type AppThemeSelectionMode = 'profile' | 'icon';
type AppDensityMode = 'comfortable' | 'compact' | 'dense';
//#endregion
//#region src/cookies/client.d.ts
declare const parseTuiClientCookies: (defaults?: Partial<TuiCookies>) => TuiCookies;
declare const setClientCookie: (key: string, value: string) => void;
//#endregion
//#region src/cookies/hooks/useCookiesStore.d.ts
declare const useCookiesStore: <R>(selector: (state: TuiCookiesStore) => R) => R;
//#endregion
//#region src/cookies/server.d.ts
declare const parseExtraServerCookie: <T extends object>(request: Request, ...entry: TuiCookieDef[]) => T;
declare const parseTuiServerCookies: (request: Request, defaults?: Partial<TuiCookies>) => TuiCookies;
//#endregion
//#region src/cookies/index.d.ts
declare const TUI_COOKIE_OPTIONS: {
  path: string;
  expires: Date;
};
declare const TUI_COOKIE_KEYS: string[];
type TuiParsedJsCookies = {
  [key: string]: string;
};
type TuiCookieDef = {
  key: string;
  name: string;
  default?: any;
  type?: string;
};
type TuiCookies = {
  theme: string;
  mode: PaletteMode;
  lang: string;
  layout: AppLayoutMode;
  density: AppDensityMode;
  drawerOpen: boolean;
  autoHideAppbar: boolean;
  showQuickSearch: boolean;
  showBreadcrumbs: boolean;
};
type TuiCookiesStore = TuiCookies & {
  initialized: boolean;
  setTheme: (newTheme: string) => void;
  setMode: (newMode: PaletteMode) => void;
  setLang: (newLang: string) => void;
  setLayout: (newLayout: AppLayoutMode) => void;
  setAutoHideAppbar: (auto: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setShowQuickSearch: (show: boolean) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  setDensity: (density: AppDensityMode) => void;
  reset: () => void;
};
declare const parseTuiCookies: (cookies: TuiParsedJsCookies, defaults?: Partial<TuiCookies>) => TuiCookies;
declare const parseCookies: <T extends object>(cookies: TuiParsedJsCookies, ...include: TuiCookieDef[]) => T;
//#endregion
//#region src/app/AppDefaults.d.ts
declare const AppDefaultsCookieConfigs: Partial<TuiCookies>;
declare const AppDefaultsPreferencesConfigs: AppPreferenceConfigs;
declare const AppDefaultsLeftNavConfigs: AppLeftNavConfigs;
declare const AppDefaultsTopNavConfigs: AppTopNavConfigs;
declare const AppDefaultsThemeConfigs: AppThemeConfigs;
//#endregion
//#region src/app/AppProvider.d.ts
type AppProviderProps<U extends AppUser> = {
  router: AppRouterAdapter;
  preferences?: AppPreferenceConfigs;
  user?: AppUserService<U>;
  search?: AppSearchService;
  children: ReactNode;
};
declare const AppProvider: <U extends AppUser>({
  router,
  user,
  search,
  preferences,
  children
}: Omit<AppProviderProps<U>, "theme">) => react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/themes/tui-theme.d.ts
declare module '@mui/material/styles' {
  interface ZIndex {
    tui: {
      superOverlay: number;
    };
  }
}
//#endregion
//#region src/themes/density.d.ts
declare const getDensityThemeOverrides: (density: AppDensityMode) => Partial<ThemeOptions>;
//#endregion
//#region src/themes/elements/AppDensity.d.ts
type AppDensityProps = PropsWithChildren<{
  density: AppDensityMode;
}>;
declare const AppDensity: FC<AppDensityProps>;
//#endregion
//#region src/themes/index.d.ts
declare const TUI_THEMES: AppTheme[];
//#endregion
//#region src/app/AppRoot.d.ts
type AppRootProps = PropsWithChildren & {
  i18n: i18n;
  cookies: TuiCookies;
  themes?: AppTheme[];
  localization?: AppThemeLocalization;
};
declare const AppRoot: FC<AppRootProps>;
//#endregion
//#region src/app/providers/AppCookiesProvider.d.ts
type AppCookiesProviderProps = PropsWithChildren & {
  cookies: TuiCookies;
  i18n: i18n;
};
declare const AppCookiesProvider: FC<AppCookiesProviderProps>;
//#endregion
//#region src/display/AppAvatar.d.ts
type AppAvatarProps = {
  url?: string;
  email?: string;
} & Omit<AvatarProps, 'src'>;
declare const AppAvatar: FC<AppAvatarProps>;
declare const AppUserAvatar: FC<AppAvatarProps>;
//#endregion
//#region src/display/AppBrand.d.ts
type AppBrandComponentProps = {
  variant?: BrandVariant;
  size?: BrandSize;
};
declare const AppBrand: FC<AppBrandComponentProps>;
//#endregion
//#region src/display/AppInfoPanel.d.ts
type AppInfoPanelProps = {
  i18nKey: string;
} & StackProps;
declare const AppInfoPanel: FC<AppInfoPanelProps>;
//#endregion
//#region src/display/AppListEmpty.d.ts
declare const AppListEmpty: FC<Omit<AppInfoPanelProps, 'i18nKey'>>;
//#endregion
//#region src/display/AppSurface.d.ts
type AppSurfaceProps = {
  baseElevation?: number;
  relativeElevation?: number;
  withBorder?: boolean;
  withShadow?: boolean;
} & PaperProps;
declare const AppSurface: FC<AppSurfaceProps>;
//#endregion
//#region src/display/AppToc.d.ts
type AppTocItem = {
  id: string;
  subItems?: AppTocItem[];
  is_admin?: boolean;
};
type AppTocElementProps = {
  translation: string;
  item: AppTocItem;
};
type AppTocProps = {
  children: ReactNode;
  translation: string;
  items: AppTocItem[];
  titleI18nKey?: string;
  topI18nKey?: string;
};
declare const AppToc: react0.MemoExoticComponent<({
  children,
  translation,
  items,
  titleI18nKey,
  topI18nKey
}: AppTocProps) => react_jsx_runtime0.JSX.Element>;
//#endregion
//#region src/display/hooks/useAppColor.d.ts
type MuiColorType = keyof typeof colors;
type MuiColorVariant = keyof typeof colors.blue;
declare const useAppColor: (color?: MuiColorType, lightVariant?: MuiColorVariant, darkVariant?: MuiColorVariant) => "#e3f2fd" | "#bbdefb" | "#90caf9" | "#64b5f6" | "#42a5f5" | "#2196f3" | "#1e88e5" | "#1976d2" | "#1565c0" | "#0d47a1" | "#82b1ff" | "#448aff" | "#2979ff" | "#2962ff";
//#endregion
//#region src/i18n/index.d.ts
declare function addTranslations(i18n: i18n): void;
//#endregion
//#region src/name.d.ts
declare const MODULE_NAME = "tui.core";
//#endregion
//#region src/overlay/OverlayProvider.d.ts
type OverlayContextType = {
  actives: string[];
  regions: string[];
  regionProps: OverlayProps[];
  activeProps: OverlayProps[];
  setActives: Dispatch<SetStateAction<string[]>>;
  setRegions: Dispatch<SetStateAction<string[]>>;
  setActiveProps: Dispatch<SetStateAction<OverlayProps[]>>;
  setRegionProps: Dispatch<SetStateAction<OverlayProps[]>>;
  toggleActive: (active: string) => void;
  toggleRegion: (region: string) => void;
};
declare const OverlayDefs: {
  region: string;
  description: string;
}[];
declare const OverlayProvider: FC<PropsWithChildren>;
//#endregion
//#region src/overlay/OverlayLabel.d.ts
declare const OverlayLabel: ({
  label,
  rect
}: OverlayProps) => react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/overlay/OverlayShadow.d.ts
declare const OverlayShadow: FC<Omit<BoxProps, 'component'> & {
  region: string;
  id: string;
}>;
//#endregion
//#region src/overlay/index.d.ts
declare const useAppOverlay: () => OverlayContextType;
type OverlayProps = {
  id: string;
  label: string;
  region: string;
  description?: string;
  rect: DOMRect;
};
//#endregion
//#region src/pages/hooks/usePageProps.d.ts
type PageProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
};
declare const usePageProps: ({
  props,
  defaultOverrides
}: {
  props: PageProps;
  defaultOverrides?: PageProps;
}) => {
  className: string;
  style: {
    width: string | number;
    height: string | number;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    marginTop: string;
  };
};
//#endregion
//#region src/pages/PageCardCentered.d.ts
declare const PageCardCentered: react0.NamedExoticComponent<{
  children?: react0.ReactNode | undefined;
}>;
//#endregion
//#region src/pages/PageCenter.d.ts
type PageCenterProps = PropsWithChildren & PageProps & {
  maxWidth?: string;
  textAlign?: string;
};
declare const PageCenter: react0.NamedExoticComponent<PageCenterProps>;
//#endregion
//#region src/pages/PageContent.d.ts
type PageContentProps = PropsWithChildren & PageProps;
declare const PageContent: react0.NamedExoticComponent<PageContentProps>;
//#endregion
//#region src/pages/PageFullScreen.d.ts
type PageFullscreenProps = PropsWithChildren & {
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  test?: React.CSSProperties;
  fsIconPos?: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky';
};
declare const PageFullscreen: react0.NamedExoticComponent<PageFullscreenProps>;
//#endregion
//#region src/pages/PageFullWidth.d.ts
type PageFullWidthProps = PropsWithChildren & {
  height?: number | string;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
};
declare const PageFullWidth: react0.NamedExoticComponent<PageFullWidthProps>;
//#endregion
//#region src/pages/PageHeader.d.ts
type PageHeaderAction = {
  key?: string;
  title?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
};
type PageHeaderProps = PropsWithChildren & {
  left?: React.ReactNode;
  right?: React.ReactNode;
  actions?: PageHeaderAction[];
  isSticky?: boolean;
  top?: number;
  elevation?: number;
  backgroundColor?: string;
  className?: string;
};
declare const PageHeader: react0.NamedExoticComponent<PageHeaderProps>;
//#endregion
//#region src/skeleton/AppSkeleton.d.ts
/**
 * Default Skeleton component that will render either [TopLayoutSkeleton] or [SideLayoutSkeleton] based on [useAppLayout::currentLayout].
 */
declare const LayoutSkeleton: () => react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/types/index.d.ts
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
//#endregion
//#region src/utils/hooks/useClipboard.d.ts
declare const useClipboard: () => {
  copy: (text: string) => Promise<void>;
};
//#endregion
//#region src/utils/hooks/useEnv.d.ts
declare const useAppEnv: (key?: string) => string | NodeJS.ProcessEnv;
//#endregion
//#region src/utils/hooks/useFullscreenStatus.d.ts
declare const useFullscreenStatus: (elRef: RefObject<any>) => [boolean, () => void];
//#endregion
//#region src/utils/hooks/useLocalStorage.d.ts
declare const useLocalStorage: (prefix?: string) => {
  get: <T>(key: string) => T;
  set: (key: string, value: any) => void;
  remove: (key: string, withPrefix?: boolean) => void;
  has: (key: string) => boolean;
  keys: () => string[];
  items: () => {
    key: string;
    value: unknown;
  }[];
  clear: () => void;
};
//#endregion
//#region src/utils/hooks/useLocalStorageItem.d.ts
/**
 * This hooks backs the typical 'useState' hook with local storage.
 *
 * This means that it will initialize with the value stored in local storage.
 *
 * State changes are also persisted to local storage.
 *
 * All this ensures the state is preserved across inializations.
 *
 * @param key - local storage key under which to store the state.
 * @param initialValue - local storage initialization value.
 * @returns a stateful value, a function to update it, and a function to remove it.
 */
declare const useLocalStorageItem: <T>(key: string, initialValue?: T) => [T, (newValue: T | ((prev: T) => T), save?: boolean) => void, () => void];
//#endregion
//#region src/utils/keyboard.d.ts
declare const ENTER = "Enter";
declare const ESCAPE = "Escape";
declare const ARROW_LEFT = "ArrowLeft";
declare const ARROW_UP = "ArrowUp";
declare const ARROW_RIGHT = "ArrowRight";
declare const ARROW_DOWN = "ArrowDown";
declare const BACKSPACE = "Backspace";
declare const SPACE = " ";
declare function is(key: string, check: string): boolean;
declare function isArrowUp(key: string): boolean;
declare function isArrowDown(key: string): boolean;
declare function isArrowLeft(key: string): boolean;
declare function isArrowRight(key: string): boolean;
declare function isEscape(key: string): boolean;
declare function isEnter(key: string): boolean;
declare function isBackspace(key: string): boolean;
declare function isSpace(key: string): boolean;
declare function parseEvent(event: KeyboardEvent<HTMLElement>): {
  key: string;
  isCtrl: boolean;
  isEnter: boolean;
  isSpace: boolean;
  isBackspace: boolean;
  isEscape: boolean;
  isArrowLeft: boolean;
  isArrowRight: boolean;
  isArrowUp: boolean;
  isArrowDown: boolean;
};
declare const keyboard: {
  ENTER: string;
  ESCAPE: string;
  ARROW_LEFT: string;
  ARROW_UP: string;
  ARROW_DOWN: string;
  BACKSPACE: string;
  SPACE: string;
  is: typeof is;
  isArrowUp: typeof isArrowUp;
  isArrowDown: typeof isArrowDown;
  isArrowLeft: typeof isArrowLeft;
  isArrowRight: typeof isArrowRight;
  isEscape: typeof isEscape;
  isEnter: typeof isEnter;
  isBackspace: typeof isBackspace;
  isSpace: typeof isSpace;
  parseEvent: typeof parseEvent;
};
//#endregion
export { APPBAR_READY_EVENT, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, AppAvatar, AppAvatarProps, AppBarUserMenuElement, AppBrand, AppBrandComponentProps, AppBrandConfig, AppBrandProps, AppBreadcrumbItem, AppCookiesProvider, AppDefaultsCookieConfigs, AppDefaultsLeftNavConfigs, AppDefaultsPreferencesConfigs, AppDefaultsThemeConfigs, AppDefaultsTopNavConfigs, AppDensity, AppDensityMode, AppDensityProps, AppHistoryRoute, AppInfoPanel, AppInfoPanelProps, AppLayoutMode, AppLeftNavConfigs, AppListEmpty, AppPreferenceConfigs, AppProvider, AppRoot, AppRouterAdapter, AppRouterLocation, AppSearchItem, AppSearchItemRendererOption, AppSearchMode, AppSearchService, type AppSearchServiceState, AppSurface, AppSurfaceProps, AppTheme, AppThemeConfigs, AppThemeLocalization, AppThemeSelectionMode, AppThemesProvider, AppToc, AppTocElementProps, AppTocItem, AppTopNavConfigs, AppUser, AppUserAvatar, AppUserContext, AppUserContextType, AppUserService, AppUserValidatedProp, BACKSPACE, BRAND_VARIANTS, BrandSize, BrandSizeSpecs, BrandVariant, ENTER, ESCAPE, LayoutSkeleton, LeftNavAction, LeftNavActionProps, LeftNavChildProps, LeftNavChildRenderProps, LeftNavItem, LeftNavItemProps, LeftNavMenuItem, LeftNavMenuProps, LeftNavRoute, LeftNavRouteProps, LeftNavSlotProps, MODULE_NAME, MakeOptional, MuiColorType, OverlayDefs, OverlayLabel, OverlayProps, OverlayProvider, OverlayShadow, PageCardCentered, PageCenter, PageContent, PageFullWidth, PageFullscreen, PageHeader, PageHeaderAction, PageProps, SPACE, TUI_COOKIE_KEYS, TUI_COOKIE_OPTIONS, TUI_THEMES, TuiCookieDef, TuiCookies, TuiCookiesStore, TuiParsedJsCookies, UseAppLanguageType, UseAppThemeType, addTranslations, getBrandSizes, getDensityThemeOverrides, is, isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isBackspace, isEnter, isEscape, isSpace, keyboard, parseCookies, parseEvent, parseExtraServerCookie, parseTuiClientCookies, parseTuiCookies, parseTuiServerCookies, setClientCookie, traverse, useAppBar, useAppBarHeight, useAppBarScrollTrigger, useAppBrand, useAppBreadcrumbs, useAppColor, useAppDensity, useAppEnv, useAppLanguage, useAppLayout, useAppLeftNav, useAppLogo, useAppOverlay, useAppPreferences, useAppQuickSearch, useAppRouter, useAppSearchService, useAppTheme, useAppThemeBuilder, useAppUser, useClipboard, useCookiesStore, useFullscreenStatus, useLocalStorage, useLocalStorageItem, usePageProps, usePathMatcher, visit };
//# sourceMappingURL=index.d.ts.map