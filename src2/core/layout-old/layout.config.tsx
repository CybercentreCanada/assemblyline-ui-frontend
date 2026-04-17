import { ReactElement } from 'react';
import { z } from 'zod';
import { AppConfigLeftNavItem } from './layout.models';

//*****************************************************************************************
// App Layout Quick Search
//*****************************************************************************************

export type AppLayoutQuickSearch = {
  // is the quick search shown in the app bar?
  show: boolean;
};

//*****************************************************************************************
// App Layout Quick Search
//*****************************************************************************************

export type AppLayoutLeftNav = {
  // is the left nav bar open?
  open: boolean;

  // Width of the Left Nav Bar
  width: number;

  // menu controls
  menu: AppConfigLeftNavItem[];
};

//*****************************************************************************************
// App Layout Top Bar
//*****************************************************************************************

export type AppLayoutTopBar = {
  // is the appbar shown?
  show: boolean;

  // is the appbar auto hiding on scroll or being sticky?
  autoHide: boolean;
};

//*****************************************************************************************
// App Layout Breadcrumbs
//*****************************************************************************************

// Specification interface describing an application route captured in the breadcrumb provider history tracker.
export type AppHistoryRoute = {
  route: string;
  path: string;
};

// Specification interface describing a element that is rendered in the application breadcrumb list.
export type AppBreadcrumbItem = {
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

export type AppLayoutBreadcrumbs = {
  // are the breadcrumbs shown?
  show: boolean;

  // the items to render in the breadcrumbs.
  items: any[];

  // Get the list of routes from history.
  history: AppHistoryRoute[];
};

//*****************************************************************************************
// App Layout
//*****************************************************************************************

export type AppLayout = {
  // is the left nav bar open?
  ready: boolean;

  // indicates which layout is currently active (as a union of AppLayoutMode + 'focus').
  mode: 'side' | 'top' | 'focus';
};

//*****************************************************************************************
// App Layout Settings & Config
//*****************************************************************************************

export const AppLayoutSettingsSchema = z.object({
  // the current mode of the layout ['side' | 'top].
  current: z.enum(['top', 'side']).default('side').optional()
});

export type AppLayoutSettings = z.infer<typeof AppLayoutSettingsSchema>;

export type AppLayoutConfig = AppLayoutSettings &
  AppLayout & {
    breadcrumbs: AppLayoutBreadcrumbs;
    leftNav: AppLayoutLeftNav;
    quickSearch: AppLayoutQuickSearch;
    topBar: AppLayoutTopBar;
  };
