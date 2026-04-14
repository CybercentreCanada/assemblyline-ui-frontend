import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { AppHistoryRoute } from '../breadcrumbs';
import type { LeftNavMenuProps } from '../leftnav';
import type { AppRouterAdapter } from '../router';
import type { AppSearchItem, AppSearchMode, AppSearchService } from '../search/AppSearchService';
import type { AppLayoutMode, AppPreferenceConfigs } from './AppConfigs';

export type AppContextBase = {
  initialized: boolean; // the context has been initialized by the provider.
};

export type AppContextType = AppContextBase & {
  router: AppRouterAdapter;
  preferences?: AppPreferenceConfigs; // The app's preferences config.
};

export type AppQuickSearchContextType = AppContextBase & {
  show: boolean; // is the quick search shown in the app bar?
  setShow: (show: boolean) => void; // specify whether to show the quick search in the app bar.
  toggle: () => void; // hide/show the quick search in the app bar.
};

export type AppSearchServiceContextType<T = any> = AppContextBase & {
  provided: boolean; // has a search service been provided? - if false, then it means the default service is being used.
  service: AppSearchService<T>; // the search service implementation to use.
  state: AppSearchServiceState<T>; // the state of the search service.
};

export type AppLeftNavContextType = AppContextBase & {
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

export type AppLayoutContextType = AppContextBase & {
  ready: boolean; // is the layout ready?
  current: AppLayoutMode; // the current mode of the layout ['side' | 'top].
  mode: AppLayoutMode | 'focus'; // indicates which layout is currently active (as a union of AppLayoutMode + 'focus').
  toggle: () => void; // toggle between 'top' and 'side' layout mode.
  setReady: Dispatch<SetStateAction<boolean>>; // specifiy whether the applayout is ready to render.
  setFocus: Dispatch<SetStateAction<boolean>>; // enable or disable 'focus' mode.
  hideMenus: () => void; // hide the left nav menu and the app bar.
  showMenus: () => void; // show the left nav menu and the app bar.
};

export type AppBarContextType = AppContextBase & {
  show: boolean; // is the appbar shown?
  autoHide: boolean; // is the appbar auto hiding on scroll or being sticky?
  setShow: (show: boolean) => void; // specify whether to show the app bar or not.
  setAutoHide: (autoHide: boolean) => void; // specify whether to auto hide the app bar.
  toggleAutoHide: () => void; // toggle the auto hide property.
};

export type AppBreadcrumbsContextType = AppContextBase & {
  show: boolean; // are the breadcrumbs shown?
  items: any[]; // the items to render in the breadcrumbs.
  setItems: Dispatch<SetStateAction<any[]>>; // set the items to render in the breadcrumbs.
  toggle: () => void; // show/hide the breadcrumbs.
  history: AppHistoryRoute[]; // Get the list of routes from history.
};

export type AppSearchServiceState<T = any> = {
  searching: boolean; // indicates if the app search should show the progress indicator.
  menu: boolean; // is the app search result menu opened?
  mode: AppSearchMode; // inline vs fullscreen.
  items: AppSearchItem<T>[]; // the app search result items to render.
  set: (state: AppSearchServiceState<T>) => void; // update app search state.
};

// React Context for the AppProvider (Root Context).
export const AppContext = createContext<AppContextType>({
  initialized: false,
  preferences: null,
  router: null
});

// React Context for the AppLayoutProvider.
export const AppLayoutContext = createContext<AppLayoutContextType>({
  initialized: false,
  ready: false,
  current: 'side',
  mode: 'side',
  toggle: () => {},
  setReady: () => {},
  setFocus: () => {},
  hideMenus: () => {},
  showMenus: () => {}
});

// React Context for the AppBarProvider.
export const AppBarContext = createContext<AppBarContextType>({
  initialized: false,
  show: true,
  autoHide: false,
  setShow: () => {},
  setAutoHide: () => {},
  toggleAutoHide: () => {}
});

// React Context for the AppBreadcrumbsProvider.
export const AppBreadcrumbsContext = createContext<AppBreadcrumbsContextType>({
  initialized: false,
  show: true,
  items: [],
  setItems: () => {},
  toggle: () => {},
  history: []
});

// React Context for the AppLeftNavProvider.
export const AppLeftNavContext = createContext<AppLeftNavContextType>({
  initialized: false,
  menus: [],
  open: false,
  setOpen: () => {},
  toggle: () => {},
  toggleMenu: () => {},
  closeMenu: () => {},
  openMenu: () => {},
  updateMenu: () => {},
  collapseMenus: () => {},
  expandMenus: () => {},
  setMenus: () => {}
});

// React Context for the AppQuickSearchProvider.
export const AppQuickSearchContext = createContext<AppQuickSearchContextType>({
  initialized: false,
  show: false,
  setShow: () => {},
  toggle: () => {}
});

// React Context for the AppSearchServiceProvider.
export const AppSearchServiceContext = createContext<AppSearchServiceContextType>({
  initialized: false,
  provided: false,
  service: null,
  state: {
    searching: false,
    menu: false,
    mode: 'inline',
    items: [],
    set: () => {}
  }
});
