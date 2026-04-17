import { AppConfig } from 'core/config';
import { AppLayoutLeftNav, AppLayoutQuickSearch, AppLayoutTopBar } from './layout.config';
import { AppConfigLeftNavItem, AppLayoutLeftNavItem } from './layout.models';

//*****************************************************************************************
// App Quick Search
//*****************************************************************************************

export const toggleQuickSearchShow = (store: AppConfig): AppConfig => {
  if (!store.layout.quickSearch) store.layout.quickSearch = { show: false };
  store.layout.quickSearch.show = !store.layout.quickSearch.show;
  return store;
};

export const setQuickSearchShow = (store: AppConfig, show: AppLayoutQuickSearch['show']): AppConfig => {
  if (!store.layout.quickSearch) store.layout.quickSearch = { show: false };
  store.layout.quickSearch.show = show;
  return store;
};

//*****************************************************************************************
// App Left Nav
//*****************************************************************************************

export const setLeftNavOpen = (store: AppConfig, open: AppLayoutLeftNav['open']): AppConfig => {
  store.layout.leftNav.open = open;
  return store;
};

export const toggleLeftNavOpen = (store: AppConfig): AppConfig => {
  store.layout.leftNav.open = !store.layout.leftNav.open;
  return store;
};

export const toggleLeftNavMenu = (store: AppConfig, indexMap: number[]): AppConfig => {
  return store;
};

export const openLeftNavMenu = (store: AppConfig, indexMap: number[]): AppConfig => {
  return store;
};

export const closeLeftNavMenu = (store: AppConfig, indexMap: number[]): AppConfig => {
  return store;
};

//*****************************************************************************************
// App Top Bar
//*****************************************************************************************
export const setTopBarShow = (store: AppConfig, show: AppLayoutTopBar['show']): AppConfig => {
  store.layout.topBar.show = show;
  return store;
};

export const setTopBarAutoHide = (store: AppConfig, autoHide: AppLayoutTopBar['autoHide']): AppConfig => {
  store.layout.topBar.autoHide = autoHide;
  return store;
};

export const toggleTopBarAutoHide = (store: AppConfig): AppConfig => {
  store.layout.topBar.autoHide = !store.layout.topBar.autoHide;
  return store;
};

//*****************************************************************************************
// App Breadcrumbs
//*****************************************************************************************

//*****************************************************************************************
// App Layout
//*****************************************************************************************

//*****************************************************************************************
// App Layout Settings & Config
//*****************************************************************************************

const buildLeftNavItems = (item: AppLayoutLeftNavItem): AppConfigLeftNavItem => ({
  expanded: false,
  popped: false,
  items: 'items' in item ? item.items.map(i => buildLeftNavItems(i)) : []
});

const closeAllMenus = (items: AppConfigLeftNavItem[] = []): void => {
  for (const menuItem of items) {
    menuItem.expanded = false;
    menuItem.popped = false;
    closeAllMenus(menuItem.items ?? []);
  }
};

export const initializeLeftNavItems = (store: AppConfig, menu: AppLayoutLeftNavItem[]): AppConfig => {
  store.layout.leftNav.menu = menu.map(item => buildLeftNavItems(item));
  return store;
};

export const toggleLeftNavDrawer = (store: AppConfig): AppConfig => {
  if (store.layout.leftNav.open) {
    store.layout.leftNav.open = false;
    closeAllMenus(store.layout.leftNav.menu);
  } else {
    store.layout.leftNav.open = true;
  }

  return store;
};

export const closeLeftNavDrawer = (store: AppConfig): AppConfig => {
  store.layout.leftNav.open = false;
  closeAllMenus(store.layout.leftNav.menu);

  return store;
};

export const toggleMenu = (store: AppConfig, indexPath: number[]): AppConfig => {
  const target = mutateConfigItem(store.layout.leftNav.menu, indexPath);
  if (!target) return store;

  if (store.layout.leftNav.open) target.expanded = !Boolean(target.expanded);
  else target.popped = !Boolean(target.popped);

  return store;
};

export const closeMenu = (store: AppConfig, indexPath: number[]): AppConfig => {
  const target = mutateConfigItem(store.layout.leftNav.menu, indexPath);
  if (!target) return store;

  target.expanded = false;
  target.popped = false;

  return store;
};

export const resolveConfigItem = (
  items: AppConfigLeftNavItem[] | undefined,
  indexPath: number[]
): AppConfigLeftNavItem | undefined => {
  let currentItems = items;
  let currentItem: AppConfigLeftNavItem | undefined;

  for (const index of indexPath) {
    currentItem = currentItems?.[index];
    currentItems = currentItem?.items ?? undefined;
  }

  return currentItem;
};

export const mutateConfigItem = (
  items: AppConfigLeftNavItem[] | undefined,
  indexPath: number[]
): AppConfigLeftNavItem | undefined => {
  let currentItems = items;
  let currentItem: AppConfigLeftNavItem | undefined;

  for (const index of indexPath) {
    currentItem = currentItems?.[index];
    currentItems = currentItem?.items ?? undefined;
  }

  return currentItem;
};
